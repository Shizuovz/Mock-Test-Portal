import { startAttemptSchema } from "@/lib/validation/attempt.schema";
import { getSafeQuestionsForTest, getTestById } from "@/lib/content/mock-data";
import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateExpiresAt } from "@/lib/test-engine/timer";
import type { SafeQuestionPayload } from "@/types/models";

export async function startAttempt(input: unknown) {
  const parsed = startAttemptSchema.parse(input);

  if (!hasSupabaseConfig()) {
    return startLocalAttempt(parsed.testId);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AttemptAuthError("You must be signed in to start a test.");
  }

  const db = createSupabaseAdminClient();
  let { data: test, error: testError } = await db
    .from("tests")
    .select("id, name, duration_minutes, is_published, max_attempts")
    .eq("id", parsed.testId)
    .eq("is_published", true)
    .single();

  if (testError && testError.message.includes("does not exist")) {
    const retry = await db
      .from("tests")
      .select("id, name, duration_minutes, is_published")
      .eq("id", parsed.testId)
      .eq("is_published", true)
      .single();
    test = retry.data as typeof test;
    testError = retry.error;
  }

  if (testError || !test) {
    throw new AttemptNotFoundError("Published test not found.");
  }

  const { data: existingAttempt, error: existingAttemptError } = await db
    .from("test_attempts")
    .select("id, started_at, expires_at")
    .eq("user_id", user.id)
    .eq("test_id", test.id)
    .eq("status", "in_progress")
    .gt("expires_at", new Date().toISOString())
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAttemptError) {
    throw new Error("Unable to load active attempt.");
  }

  if (existingAttempt) {
    const [questions, initialAnswers] = await Promise.all([
      getSafeQuestionsFromSupabase(db, test.id),
      getSavedAttemptStateFromSupabase(db, existingAttempt.id),
    ]);

    return {
      attemptId: existingAttempt.id,
      testId: test.id,
      testName: test.name,
      startedAt: existingAttempt.started_at,
      expiresAt: existingAttempt.expires_at,
      questions,
      initialAnswers: initialAnswers.answers,
      initialMarkedForReview: initialAnswers.markedForReview,
      mode: "supabase" as const,
    };
  }

  const testRecord = test as unknown as Record<string, unknown>;
  const maxAttempts =
    testRecord.max_attempts !== undefined && testRecord.max_attempts !== null
      ? Number(testRecord.max_attempts)
      : null;

  if (maxAttempts !== null && maxAttempts > 0) {
    const { count, error: countError } = await db
      .from("test_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("test_id", test.id)
      .in("status", ["submitted", "expired"]);

    if (!countError && count !== null && count >= maxAttempts) {
      throw new AttemptLimitReachedError(
        maxAttempts,
        `Attempt limit reached. This test allows a maximum of ${maxAttempts} attempt${maxAttempts === 1 ? "" : "s"}.`,
      );
    }
  }

  const startedAt = new Date();
  const expiresAt = calculateExpiresAt(startedAt, test.duration_minutes);
  const { data: attempt, error: attemptError } = await db
    .from("test_attempts")
    .insert({
      user_id: user.id,
      test_id: test.id,
      status: "in_progress",
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select("id, started_at, expires_at")
    .single();

  if (attemptError || !attempt) {
    throw new Error("Unable to create test attempt.");
  }

  const questions = await getSafeQuestionsFromSupabase(db, test.id);

  return {
    attemptId: attempt.id,
    testId: test.id,
    testName: test.name,
    startedAt: attempt.started_at,
    expiresAt: attempt.expires_at,
    questions,
    initialAnswers: {},
    initialMarkedForReview: {},
    mode: "supabase" as const,
  };
}

export type StartedAttempt = Awaited<ReturnType<typeof startAttempt>>;

export class AttemptAuthError extends Error {}
export class AttemptNotFoundError extends Error {}
export class AttemptLimitReachedError extends Error {
  constructor(
    public readonly maxAttempts: number,
    message?: string,
  ) {
    super(
      message ??
        `Attempt limit reached. This test allows a maximum of ${maxAttempts} attempt${maxAttempts === 1 ? "" : "s"}.`,
    );
    this.name = "AttemptLimitReachedError";
  }
}

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function startLocalAttempt(testId: string) {
  const test = getTestById(testId);

  if (!test) {
    throw new AttemptNotFoundError("Published test not found.");
  }

  const startedAt = new Date();
  const expiresAt = calculateExpiresAt(startedAt, test.durationMinutes);

  return {
    attemptId: `local-${test.id}`,
    testId: test.id,
    testName: test.name,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    questions: getSafeQuestionsForTest(test.id),
    initialAnswers: {},
    initialMarkedForReview: {},
    mode: "local" as const,
  };
}

async function getSafeQuestionsFromSupabase(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  testId: string,
): Promise<SafeQuestionPayload[]> {
  const { data, error } = await supabase
    .from("test_questions")
    .select(
      `
      question_id,
      order_index,
      marks,
      negative_marks,
      questions (
        id,
        question_text,
        question_type,
        default_marks,
        default_negative_marks,
        question_options (
          id,
          option_text,
          order_index
        )
      )
    `,
    )
    .eq("test_id", testId)
    .order("order_index", { ascending: true });

  if (error || !data) {
    throw new Error("Unable to load test questions.");
  }

  return data.map((row) => {
    const question = Array.isArray(row.questions)
      ? row.questions[0]
      : row.questions;

    if (!question) {
      throw new Error(`Missing question ${row.question_id}`);
    }

    const options = Array.isArray(question.question_options)
      ? question.question_options
      : [];

    return {
      id: question.id,
      questionText: question.question_text,
      questionType: question.question_type,
      marks: row.marks ?? question.default_marks,
      negativeMarks: row.negative_marks ?? question.default_negative_marks,
      options: options
        .sort((a, b) => a.order_index - b.order_index)
        .map((option) => ({
          id: option.id,
          optionText: option.option_text,
          orderIndex: option.order_index,
        })),
    };
  });
}

async function getSavedAttemptStateFromSupabase(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  attemptId: string,
) {
  const { data, error } = await supabase
    .from("user_answers")
    .select("question_id, selected_option_id, is_marked_for_review")
    .eq("attempt_id", attemptId);

  if (error || !data) {
    throw new Error("Unable to load saved answers.");
  }

  return {
    answers: Object.fromEntries(
      data
        .filter((answer) => answer.selected_option_id)
        .map((answer) => [answer.question_id, answer.selected_option_id as string]),
    ),
    markedForReview: Object.fromEntries(
      data
        .filter((answer) => answer.is_marked_for_review)
        .map((answer) => [answer.question_id, true]),
    ),
  };
}
