import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AttemptAuthError } from "@/lib/test-engine/start-attempt";
import type { ResultPayload } from "@/components/test/result-review-shell";

export async function getLatestSubmittedResultForTest(testId: string) {
  return getSubmittedResult({ testId });
}

export async function getSubmittedResultForAttempt(attemptId: string) {
  return getSubmittedResult({ attemptId });
}

async function getSubmittedResult({
  testId,
  attemptId,
}: {
  testId?: string;
  attemptId?: string;
}) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AttemptAuthError("You must be signed in to view results.");
  }

  const db = createSupabaseAdminClient();
  let query = db
    .from("test_attempts")
    .select(
      "id, test_id, status, started_at, submitted_at, score, max_score, correct_count, wrong_count, unanswered_count, time_taken_seconds, tests(name)",
    )
    .eq("user_id", user.id)
    .in("status", ["submitted", "expired"])
    .order("submitted_at", { ascending: false })
    .limit(1);

  if (attemptId) {
    query = query.eq("id", attemptId);
  }

  if (testId) {
    query = query.eq("test_id", testId);
  }

  const { data: attempt, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Unable to load result.");
  }

  if (!attempt) {
    return null;
  }

  const test = Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests;

  return {
    attemptId: attempt.id,
    testId: attempt.test_id,
    testName: test?.name ?? "Mock Test",
    submittedAt: attempt.submitted_at,
    result: {
      score: attempt.score ?? 0,
      maxScore: attempt.max_score ?? 0,
      correctCount: attempt.correct_count ?? 0,
      wrongCount: attempt.wrong_count ?? 0,
      unansweredCount: attempt.unanswered_count ?? 0,
    },
    timeTakenSeconds: attempt.time_taken_seconds ?? 0,
    review: await getReviewQuestions(db, attempt.test_id, attempt.id),
  } satisfies ResultPayload;
}

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function getReviewQuestions(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  testId: string,
  attemptId: string,
) {
  const { data: rows, error } = await supabase
    .from("test_questions")
    .select(
      `
      question_id,
      order_index,
      questions (
        id,
        question_text,
        explanation,
        question_options (
          id,
          option_text,
          is_correct,
          order_index
        )
      )
    `,
    )
    .eq("test_id", testId)
    .order("order_index", { ascending: true });

  if (error || !rows) {
    throw new Error("Unable to load review questions.");
  }

  let { data: answers, error: answersError } = await supabase
    .from("user_answers")
    .select("question_id, selected_option_id, time_spent_seconds")
    .eq("attempt_id", attemptId);

  if (
    answersError &&
    (answersError.code === "PGRST204" ||
      answersError.message.includes("does not exist") ||
      answersError.message.includes("Could not find the"))
  ) {
    const retry = await supabase
      .from("user_answers")
      .select("question_id, selected_option_id")
      .eq("attempt_id", attemptId);
    answers = retry.data as typeof answers;
    answersError = retry.error;
  }

  if (answersError || !answers) {
    throw new Error("Unable to load review answers.");
  }

  const answersByQuestionId = new Map(
    answers.map((answer) => [
      answer.question_id,
      {
        selectedOptionId: answer.selected_option_id,
        timeSpentSeconds: Number((answer as Record<string, unknown>).time_spent_seconds ?? 0),
      },
    ]),
  );

  return rows.map((row) => {
    const question = Array.isArray(row.questions)
      ? row.questions[0]
      : row.questions;
    const options = Array.isArray(question?.question_options)
      ? question.question_options
      : [];
    const correctOption = options.find((option) => option.is_correct);
    const answerData = answersByQuestionId.get(row.question_id);
    const selectedOptionId = answerData?.selectedOptionId ?? null;
    const timeSpentSeconds = answerData?.timeSpentSeconds ?? 0;
    const selectedOption = options.find((option) => option.id === selectedOptionId);

    if (!question || !correctOption) {
      throw new Error(`Missing review data for question ${row.question_id}`);
    }

    return {
      questionId: question.id,
      questionText: question.question_text,
      explanation: question.explanation,
      correctOptionId: correctOption.id,
      correctOptionText: correctOption.option_text,
      selectedOptionId,
      selectedOptionText: selectedOption?.option_text ?? null,
      isCorrect: selectedOptionId === correctOption.id,
      timeSpentSeconds,
    };
  });
}
