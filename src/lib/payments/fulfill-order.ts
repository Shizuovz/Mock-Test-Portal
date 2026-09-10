import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface FulfillOrderParams {
  providerOrderId: string;
  providerPaymentId: string;
  gatewayEventId?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface FulfillOrderResult {
  success: boolean;
  subscriptionId?: string;
  paymentId?: string;
  message?: string;
  error?: string;
}

/**
 * Idempotent, atomic database payment fulfillment.
 * Locks payment row, checks status, marks captured, inserts subscription, queues receipt.
 */
export async function fulfillPaymentOrder({
  providerOrderId,
  providerPaymentId,
  gatewayEventId = null,
  payload = null,
}: FulfillOrderParams): Promise<FulfillOrderResult> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.rpc("fulfill_payment_order_atomic", {
    p_provider_order_id: providerOrderId,
    p_provider_payment_id: providerPaymentId,
    p_gateway_event_id: gatewayEventId,
    p_payload: payload,
  });

  if (error) {
    console.error("[Payments] Atomic fulfillment RPC failed:", error);
    return {
      success: false,
      error: error.message || "Database fulfillment error",
    };
  }

  return (data as FulfillOrderResult) || { success: false, error: "Empty response from fulfillment RPC" };
}
