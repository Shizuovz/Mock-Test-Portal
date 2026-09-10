import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Distributed rate limiter backed by PostgreSQL check_rate_limit function.
 * Safe for serverless environments (Vercel) without external Redis requirement.
 */
export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.warn(`[RateLimit] RPC warning for key "${key}":`, error.message);
      // Fail-open on DB connection hiccup to avoid blocking legitimate users, but log warning
      return true;
    }

    return Boolean(data);
  } catch (err) {
    console.error(`[RateLimit] Exception for key "${key}":`, err);
    return true;
  }
}

/**
 * Helper to build composite rate limit keys.
 */
export function buildRateLimitKey(
  endpointClass: string,
  identityType: "user" | "ip" | "attempt",
  identifier: string
): string {
  return `${endpointClass}:${identityType}:${identifier}`;
}
