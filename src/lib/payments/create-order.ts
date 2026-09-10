import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { razorpay } from "@/lib/razorpay";

export interface CreateOrderParams {
  userId: string;
  userEmail: string;
  planId: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  amountPaise?: number;
  currency?: string;
  keyId?: string;
  paymentId?: string;
  error?: string;
  status?: number;
}

/**
 * Server-authoritative order creation.
 * Checks system settings, snapshots commercial terms, creates DB payment row, calls Razorpay.
 */
export async function createPaymentOrder({
  userId,
  userEmail,
  planId,
}: CreateOrderParams): Promise<CreateOrderResult> {
  const supabase = createSupabaseAdminClient();

  // 1. Emergency Kill Switch Check
  const { data: setting } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "checkout_enabled")
    .maybeSingle();

  if (setting && setting.value === false) {
    return {
      success: false,
      status: 503,
      error: "Checkout is temporarily disabled for maintenance. Please try again later.",
    };
  }

  // 2. Authoritative Plan Lookup
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .eq("is_active", true)
    .single();

  if (planError || !plan) {
    return {
      success: false,
      status: 404,
      error: "Requested plan was not found or is currently inactive.",
    };
  }

  // 3. Pre-create payment record with commercial terms snapshot
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      plan_id: plan.id,
      plan_code: plan.code,
      plan_name: plan.name,
      amount_paise: plan.price_paise,
      currency: plan.currency || "INR",
      duration_days: plan.duration_days,
      credits: plan.credits || null,
      customer_email: userEmail,
      terms_snapshot: {
        plan_id: plan.id,
        code: plan.code,
        name: plan.name,
        duration_days: plan.duration_days,
        price_paise: plan.price_paise,
        currency: plan.currency || "INR",
        created_at: new Date().toISOString(),
      },
      provider: "razorpay",
      status: "pending",
      metadata: {
        plan_id: plan.id,
        duration_days: plan.duration_days,
        email: userEmail,
      },
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    console.error("[Payments] Failed to create payment record:", paymentError);
    return {
      success: false,
      status: 500,
      error: "Unable to initialize payment transaction.",
    };
  }

  // 4. Generate Razorpay Order
  try {
    const order = await razorpay.orders.create({
      amount: plan.price_paise,
      currency: plan.currency || "INR",
      receipt: payment.id,
      notes: {
        payment_id: payment.id,
        plan_id: plan.id,
        user_id: userId,
      },
    });

    // 5. Update payment with provider order ID
    await supabase
      .from("payments")
      .update({
        provider_order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return {
      success: true,
      orderId: order.id,
      amountPaise: plan.price_paise,
      currency: plan.currency || "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    };
  } catch (razorpayErr: any) {
    console.error("[Payments] Razorpay Order Creation Error:", razorpayErr);
    await supabase
      .from("payments")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", payment.id);

    return {
      success: false,
      status: 502,
      error: "Payment gateway error. Please try again.",
    };
  }
}
