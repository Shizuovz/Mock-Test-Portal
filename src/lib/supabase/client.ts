import { createBrowserClient } from "@supabase/ssr";
import { env, getSupabasePublishableKey } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const supabaseKey = getSupabasePublishableKey();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey,
  );
}
