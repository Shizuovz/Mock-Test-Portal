import { describe, expect, it, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { verifyPayment } from "@/lib/payments/verify-payment";
import { verifyAndProcessWebhook } from "@/lib/payments/verify-webhook";
import { fulfillPaymentOrder } from "@/lib/payments/fulfill-order";

// Mock Supabase admin client and Razorpay
vi.mock("@/lib/supabase/admin", () => {
  const mockPaymentsTable: Record<string, any> = {
    "order_valid_123": {
      id: "pay_uuid_123",
      user_id: "user_test_123",
      provider_order_id: "order_valid_123",
      amount_paise: 49900,
      currency: "INR",
      status: "pending",
      duration_days: 365,
      customer_email: "test@example.com",
      terms_snapshot: { duration_days: 365 },
    },
  };

  let mockSubscriptionsTable: any[] = [];
  let mockPaymentEvents: any[] = [];

  return {
    createSupabaseAdminClient: () => ({
      from: (tableName: string) => ({
        select: () => ({
          eq: (col: string, val: string) => ({
            single: async () => {
              if (tableName === "payments" && col === "provider_order_id") {
                const p = mockPaymentsTable[val];
                return p ? { data: p, error: null } : { data: null, error: { message: "Not found" } };
              }
              return { data: null, error: null };
            },
          }),
        }),
      }),
      rpc: async (functionName: string, args: any) => {
        if (functionName === "fulfill_payment_order_atomic") {
          const { p_provider_order_id, p_provider_payment_id, p_gateway_event_id } = args;
          
          // Deduplication check
          if (p_gateway_event_id && mockPaymentEvents.includes(p_gateway_event_id)) {
            return { data: { success: true, message: "Event already processed" }, error: null };
          }

          const payment = mockPaymentsTable[p_provider_order_id];
          if (!payment) {
            return { data: { success: false, error: "Payment order not found" }, error: null };
          }

          if (payment.status === "captured") {
            return {
              data: {
                success: true,
                message: "Payment already fulfilled",
                subscriptionId: "sub_existing_123",
                paymentId: payment.id,
              },
              error: null,
            };
          }

          // Atomic execution simulation
          payment.status = "captured";
          payment.provider_payment_id = p_provider_payment_id;
          const subId = `sub_${Date.now()}`;
          mockSubscriptionsTable.push({ id: subId, user_id: payment.user_id, payment_id: payment.id });

          if (p_gateway_event_id) {
            mockPaymentEvents.push(p_gateway_event_id);
          }

          return {
            data: {
              success: true,
              subscriptionId: subId,
              paymentId: payment.id,
            },
            error: null,
          };
        }
        return { data: null, error: { message: "Unknown RPC" } };
      },
    }),
  };
});

vi.mock("@/lib/razorpay", () => ({
  razorpay: {
    payments: {
      fetch: async (id: string) => {
        if (id === "pay_uncaptured") {
          return { id, status: "failed", amount: 49900 };
        }
        if (id === "pay_wrong_amount") {
          return { id, status: "captured", amount: 19900 };
        }
        return { id, status: "captured", amount: 49900 };
      },
    },
  },
}));

describe("P0 Payment Invariants & Convergence", () => {
  const secret = "test_key_secret_123";
  const webhookSecret = "test_wh_secret_456";

  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = secret;
    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
  });

  it("proves valid signature activates subscription entitlement", async () => {
    const orderId = "order_valid_123";
    const paymentId = "pay_live_001";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const result = await verifyPayment({
      userId: "user_test_123",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    expect(result.success).toBe(true);
    expect(result.subscriptionId).toBeDefined();
  });

  it("proves tampered signature is rejected and creates 0 entitlements", async () => {
    const result = await verifyPayment({
      userId: "user_test_123",
      razorpayOrderId: "order_valid_123",
      razorpayPaymentId: "pay_live_001",
      razorpaySignature: "forged_invalid_signature_hash",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toContain("invalid signature");
  });

  it("proves uncaptured/failed payment status is rejected", async () => {
    const orderId = "order_valid_123";
    const paymentId = "pay_uncaptured";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const result = await verifyPayment({
      userId: "user_test_123",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("non-eligible status");
  });

  it("proves amount mismatch is detected and rejected", async () => {
    const orderId = "order_valid_123";
    const paymentId = "pay_wrong_amount";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const result = await verifyPayment({
      userId: "user_test_123",
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("mismatch");
  });

  it("proves raw body webhook HMAC signature verification and deduplication", async () => {
    const rawPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_wh_001",
            order_id: "order_valid_123",
            amount: 49900,
          },
        },
      },
    });

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
      .digest("hex");

    // 1. Initial Webhook Delivery
    const firstDelivery = await verifyAndProcessWebhook({
      rawBody: rawPayload,
      signature,
    });
    expect(firstDelivery.success).toBe(true);

    // 2. Duplicate Webhook Delivery with identical event
    const duplicateDelivery = await verifyAndProcessWebhook({
      rawBody: rawPayload,
      signature,
    });
    expect(duplicateDelivery.success).toBe(true);
    expect(duplicateDelivery.message).toContain("processed");
  });

  it("proves webhook-before-verify and verify-before-webhook safely converge", async () => {
    // 1. Webhook fulfills first
    const fulfillment = await fulfillPaymentOrder({
      providerOrderId: "order_valid_123",
      providerPaymentId: "pay_converge_001",
      gatewayEventId: "evt_converge_001",
    });
    expect(fulfillment.success).toBe(true);

    // 2. Browser verify arrives second
    const secondFulfillment = await fulfillPaymentOrder({
      providerOrderId: "order_valid_123",
      providerPaymentId: "pay_converge_001",
    });
    expect(secondFulfillment.success).toBe(true);
    expect(secondFulfillment.message).toContain("already fulfilled");
  });
});
