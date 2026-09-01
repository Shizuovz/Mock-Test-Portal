import { submitAttemptSchema } from "@/lib/validation/attempt.schema";

export async function expireAttempt(input: unknown) {
  const parsed = submitAttemptSchema.parse(input);

  throw new Error(
    `expireAttempt is not wired to Supabase yet. Received attemptId: ${parsed.attemptId}`,
  );
}
