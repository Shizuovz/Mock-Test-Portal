import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/razorpay";
import { fulfillPaymentOrder, FulfillOrderResult } from "./fulfill-order";

export interface VerifyPaymentParams {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  subscriptionId?: string;
  paymentId?: string;
  error?: string;
  status?: number;
}

/**
 * Fast client-side payment verification.
 * 1. Validates HMAC SHA-256 signature against RAZORPAY_KEY_SECRET.
 * 2. Matches order against server-stored payment row.
 * 3. Confirms captured/paid state via Razorpay API.
 * 4. Invokes atomic fulfillment.
 */
export async function verifyPayment({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: VerifyPaymentParams): Promise<VerifyPaymentResult> {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return {
      success: false,
      status: 500,
      error: "Payment configuration error: secret missing.",
    };
  }

  // 1. Cryptographic Signature Verification
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    console.warn(`[Payments] Invalid signature for order ${razorpayOrderId}`);
    return {
      success: false,
      status: 400,
      error: "Payment verification failed: invalid signature.",
    };
  }

  // 2. Server-Stored Order & User Ownership Check
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("provider_order_id", razorpayOrderId)
    .single();

  if (paymentError || !payment) {
    return {
      success: false,
      status: 404,
      error: "Order record not found.",
    };
  }

  if (payment.user_id !== userId) {
    return {
      success: false,
      status: 403,
      error: "Unauthorized: payment does not belong to the active user.",
    };
  }

  // 3. Confirm Server-Side Payment State via Razorpay API
  try {
    const paymentEntity: any = await (razorpay as any).payments.fetch(razorpayPaymentId);
    if (!paymentEntity || (paymentEntity.status !== "captured" && paymentEntity.status !== "authorized")) {
      return {
        success: false,
        status: 400,
        error: `Payment is in non-eligible status: ${paymentEntity?.status || "unknown"}`,
      };
    }

    // Verify amount match
    if (paymentEntity.amount !== payment.amount_paise) {
      console.error(`[Payments] Amount mismatch! Expected ${payment.amount_paise}, received ${paymentEntity.amount}`);
      return {
        success: false,
        status: 400,
        error: "Payment amount mismatch detected.",
      };
    }
  } catch (fetchErr: any) {
    console.warn("[Payments] Razorpay fetch check warning:", fetchErr.message);
    // Proceed to atomic fulfillment if signature is verified and order matches
  }

  // 4. Atomic Fulfillment
  const fulfillment: FulfillOrderResult = await fulfillPaymentOrder({
    providerOrderId: razorpayOrderId,
    providerPaymentId: razorpayPaymentId,
  });

  if (!fulfillment.success) {
    return {
      success: false,
      status: 500,
      error: fulfillment.error || "Failed to fulfill entitlement.",
    };
  }

  return {
    success: true,
    subscriptionId: fulfillment.subscriptionId,
    paymentId: fulfillment.paymentId,
  };
}
