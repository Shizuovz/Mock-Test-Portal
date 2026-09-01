import { saveAnswerSchema } from "@/lib/validation/attempt.schema";
import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasAttemptExpired } from "@/lib/test-engine/timer";
import { AttemptAuthError, AttemptNotFoundError } from "@/lib/test-engine/start-attempt";

export async function saveAnswer(input: unknown) {
  const parsed = saveAnswerSchema.parse(input);

  if (!hasSupabaseConfig()) {
    return {
      attemptId: parsed.attemptId,
      questionId: parsed.questionId,
      selectedOptionId: parsed.selectedOptionId,
      isMarkedForReview: parsed.isMarkedForReview,
      savedAt: new Date().toISOString(),
      mode: "local" as const,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AttemptAuthError("You must be signed in to save answers.");
  }

  const db = createSupabaseAdminClient();
  const { data: attempt, error: attemptError } = await db
    .from("test_attempts")
    .select("id, user_id, test_id, status, expires_at")
    .eq("id", parsed.attemptId)
    .single();

  if (attemptError || !attempt || attempt.user_id !== user.id) {
    throw new AttemptNotFoundError("Attempt not found.");
  }

  if (attempt.status !== "in_progress") {
    throw new AttemptStateError("This attempt is no longer in progress.");
  }

  if (hasAttemptExpired(new Date(attempt.expires_at))) {
    await db
      .from("test_attempts")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", parsed.attemptId)
      .eq("status", "in_progress");

    throw new AttemptStateError("This attempt has expired.");
  }

  await assertQuestionBelongsToTest(db, attempt.test_id, parsed.questionId);

  if (parsed.selectedOptionId) {
    await assertOptionBelongsToQuestion(
      db,
      parsed.questionId,
      parsed.selectedOptionId,
    );
  }

  const savedAt = new Date().toISOString();
  const upsertPayload: Record<string, unknown> = {
    attempt_id: parsed.attemptId,
    question_id: parsed.questionId,
    selected_option_id: parsed.selectedOptionId,
    is_marked_for_review: parsed.isMarkedForReview,
    answered_at: parsed.selectedOptionId ? savedAt : null,
    updated_at: savedAt,
  };

  if (parsed.timeSpentSeconds !== undefined) {
    upsertPayload.time_spent_seconds = parsed.timeSpentSeconds;
  }

  let { error: saveError } = await db.from("user_answers").upsert(
    upsertPayload,
    { onConflict: "attempt_id,question_id" },
  );

  if (saveError && saveError.message.includes("does not exist")) {
    delete upsertPayload.time_spent_seconds;
    const retry = await db.from("user_answers").upsert(
      upsertPayload,
      { onConflict: "attempt_id,question_id" },
    );
    saveError = retry.error;
  }

  if (saveError) {
    throw new Error("Unable to save answer.");
  }

  return {
    attemptId: parsed.attemptId,
    questionId: parsed.questionId,
    selectedOptionId: parsed.selectedOptionId,
    isMarkedForReview: parsed.isMarkedForReview,
    savedAt,
    mode: "supabase" as const,
  };
}

export class AttemptStateError extends Error {}

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function assertQuestionBelongsToTest(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  testId: string,
  questionId: string,
) {
  const { data, error } = await supabase
    .from("test_questions")
    .select("id")
    .eq("test_id", testId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (error || !data) {
    throw new AttemptStateError("Question does not belong to this test.");
  }
}

async function assertOptionBelongsToQuestion(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  questionId: string,
  selectedOptionId: string,
) {
  const { data, error } = await supabase
    .from("question_options")
    .select("id")
    .eq("id", selectedOptionId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (error || !data) {
    throw new AttemptStateError("Selected option does not belong to this question.");
  }
}
