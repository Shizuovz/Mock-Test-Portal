import crypto from "crypto";
import { fulfillPaymentOrder } from "./fulfill-order";

export interface VerifyWebhookParams {
  rawBody: string;
  signature: string | null;
}

export interface VerifyWebhookResult {
  success: boolean;
  message?: string;
  error?: string;
  status: number;
}

/**
 * Authoritative asynchronous Razorpay webhook reconciliation.
 * 1. Verifies raw request body HMAC SHA-256 against RAZORPAY_WEBHOOK_SECRET.
 * 2. Parses event payload, extracts order_id and payment_id.
 * 3. Atomically fulfills entitlement and records processed event.
 */
export async function verifyAndProcessWebhook({
  rawBody,
  signature,
}: VerifyWebhookParams): Promise<VerifyWebhookResult> {
  if (!signature) {
    return { success: false, status: 400, error: "Missing x-razorpay-signature header." };
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhooks] RAZORPAY_WEBHOOK_SECRET is not configured.");
    return { success: false, status: 500, error: "Webhook secret not configured." };
  }

  // 1. Raw HMAC Signature Verification
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.warn("[Webhooks] Razorpay webhook signature mismatch.");
    return { success: false, status: 400, error: "Invalid webhook signature." };
  }

  // 2. Parse Event Body
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (parseErr) {
    return { success: false, status: 400, error: "Malformed webhook JSON payload." };
  }

  const eventType = event.event;
  const orderId = event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id;
  const paymentId = event.payload?.payment?.entity?.id || `evt_pay_${orderId}`;
  const gatewayEventId = event.payload?.payment?.entity?.id ? `rzp_evt_${event.payload.payment.entity.id}` : `rzp_evt_${orderId}_${Date.now()}`;

  // 3. Process Actionable Payment Capture or Order Paid
  if (eventType === "payment.captured" || eventType === "order.paid") {
    if (!orderId) {
      return { success: true, status: 200, message: "No actionable order ID found in event." };
    }

    const fulfillment = await fulfillPaymentOrder({
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      gatewayEventId,
      payload: event,
    });

    if (!fulfillment.success) {
      console.error(`[Webhooks] Fulfillment failed for order ${orderId}:`, fulfillment.error);
      return { success: false, status: 500, error: fulfillment.error };
    }

    return { success: true, status: 200, message: "Payment processed successfully." };
  }

  // Log other non-fulfillment events
  return { success: true, status: 200, message: `Ignored unhandled event type: ${eventType}` };
}
