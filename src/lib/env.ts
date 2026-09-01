import { z } from "zod";

const optionalEnvValue = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional(),
  ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalEnvValue,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalEnvValue,
  SUPABASE_SERVICE_ROLE_KEY: optionalEnvValue,
  SUPABASE_DATABASE_URL: optionalEnvValue,
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
});

export function getSupabasePublishableKey() {
  return env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
