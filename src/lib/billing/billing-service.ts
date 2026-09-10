import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Payment, Plan, Subscription } from "@/types/models";

/**
 * Retrieves all active plans available for purchase.
 */
export async function getAvailablePlans(): Promise<Plan[]> {
  const supabase = createSupabaseAdminClient();

  const { data: plans, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price_paise", { ascending: true });

  if (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }

  return plans.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    pricePaise: p.price_paise,
    durationDays: p.duration_days,
    description: p.description,
    isActive: p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

/**
 * Gets the current active subscription for a user.
 */
export async function getActiveSubscription(
  userId: string,
): Promise<Subscription | null> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: sub, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .lte("starts_at", now)
    .gt("expires_at", now)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !sub) {
    return null;
  }

  return {
    id: sub.id,
    userId: sub.user_id,
    planId: sub.plan_id,
    status: sub.status as Subscription["status"],
    startsAt: sub.starts_at,
    expiresAt: sub.expires_at,
    createdAt: sub.created_at,
    updatedAt: sub.updated_at,
  };
}

/**
 * Returns user access status: paid subscription details or remaining free mock test credits.
 */
export async function getCurrentUserAccess(userId: string) {
  const sub = await getActiveSubscription(userId);

  if (sub) {
    const supabase = createSupabaseAdminClient();
    let planCode = "paid";
    if (sub.planId) {
      const { data: plan } = await supabase
        .from("plans")
        .select("code")
        .eq("id", sub.planId)
        .single();
      if (plan?.code) {
        planCode = plan.code;
      }
    }

    const expiresAt = new Date(sub.expiresAt);
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return {
      active: true,
      planCode,
      startedAt: sub.startsAt,
      expiresAt: sub.expiresAt,
      daysRemaining,
      freeAttemptsRemaining: null,
      freeAttemptsUsed: null,
      freeAttemptLimit: null,
    };
  }

  // Check free user entitlements
  const supabase = createSupabaseAdminClient();
  const { data: ent } = await supabase
    .from("user_entitlements")
    .select("free_attempt_limit, free_attempts_used")
    .eq("user_id", userId)
    .maybeSingle();

  const freeLimit = ent?.free_attempt_limit ?? 3;
  const freeUsed = ent?.free_attempts_used ?? 0;
  const freeRemaining = Math.max(0, freeLimit - freeUsed);

  return {
    active: false,
    planCode: "free",
    startedAt: null,
    expiresAt: null,
    daysRemaining: 0,
    freeAttemptsRemaining: freeRemaining,
    freeAttemptsUsed: freeUsed,
    freeAttemptLimit: freeLimit,
  };
}

/**
 * Returns comprehensive access status for whichever visitor is making the request
 */
export type PortalAccessStatus = {
  isGuest: boolean;
  userId: string | null;
  email: string | null;
  hasActiveSubscription: boolean;
  planCode: string;
  freeAttemptsLimit: number;
  freeAttemptsUsed: number;
  freeAttemptsRemaining: number;
  canStartAttempt: boolean;
};

/**
 * High-level helper returning user billing & mock test access limits
 * (authenticated user or anonymous guest).
 */
export async function getPortalAccessStatus(): Promise<PortalAccessStatus> {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const access = await getCurrentUserAccess(user.id);
    const hasSub = access.active;
    return {
      isGuest: false,
      userId: user.id,
      email: user.email ?? null,
      hasActiveSubscription: hasSub,
      planCode: access.planCode,
      freeAttemptsLimit: access.freeAttemptLimit ?? 3,
      freeAttemptsUsed: access.freeAttemptsUsed ?? 0,
      freeAttemptsRemaining: hasSub ? Infinity : (access.freeAttemptsRemaining ?? 0),
      canStartAttempt: hasSub || (access.freeAttemptsRemaining ?? 0) > 0,
    };
  }

  // Guest flow
  const { getGuestSessionId } = await import("@/lib/auth/guest-session");
  const guestSessionId = await getGuestSessionId();
  const db = createSupabaseAdminClient();

  let guestUsed = 0;
  if (guestSessionId) {
    const { data: session } = await db
      .from("guest_sessions")
      .select("free_attempts_used")
      .eq("id", guestSessionId)
      .maybeSingle();
    if (session) {
      guestUsed = session.free_attempts_used;
    }
  }

  const freeRemaining = Math.max(0, 1 - guestUsed);
  return {
    isGuest: true,
    userId: null,
    email: null,
    hasActiveSubscription: false,
    planCode: "guest",
    freeAttemptsLimit: 1,
    freeAttemptsUsed: guestUsed,
    freeAttemptsRemaining: freeRemaining,
    canStartAttempt: freeRemaining > 0,
  };
}

/**
 * Creates a pending payment record before initiating gateway payment.
 */
export async function createPendingPayment(
  userId: string,
  amountPaise: number | string,
  provider: string = "razorpay",
  providerOrderId?: string,
): Promise<Payment | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      amount_paise: parseInt(amountPaise.toString(), 10),
      currency: "INR",
      provider,
      provider_order_id: providerOrderId ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to create pending payment:", error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    subscriptionId: data.subscription_id,
    amountPaise: data.amount_paise,
    currency: data.currency,
    provider: data.provider,
    providerOrderId: data.provider_order_id,
    providerPaymentId: data.provider_payment_id,
    status: data.status as Payment["status"],
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
