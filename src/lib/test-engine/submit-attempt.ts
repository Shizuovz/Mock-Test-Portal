import { submitAttemptSchema } from "@/lib/validation/attempt.schema";
import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scoreSingleChoiceAttempt } from "@/lib/scoring/score-single-choice";
import type { ScoringAnswer, ScoringQuestion } from "@/lib/scoring/types";
import { AttemptAuthError, AttemptNotFoundError } from "@/lib/test-engine/start-attempt";

export async function submitAttempt(input: unknown) {
  const parsed = submitAttemptSchema.parse(input);

  if (!hasSupabaseConfig()) {
    throw new AttemptNotFoundError("Local attempts are submitted by the local route.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AttemptAuthError("You must be signed in to submit a test.");
  }

  const db = createSupabaseAdminClient();
  const { data: attempt, error: attemptError } = await db
    .from("test_attempts")
    .select(
      "id, user_id, test_id, status, started_at, expires_at, submitted_at, score, max_score, correct_count, wrong_count, unanswered_count, time_taken_seconds, tests(name)",
    )
    .eq("id", parsed.attemptId)
    .single();

  if (attemptError || !attempt || attempt.user_id !== user.id) {
    throw new AttemptNotFoundError("Attempt not found.");
  }

  if (attempt.status === "submitted") {
    return buildStoredResultPayload(db, attempt);
  }

  if (attempt.status !== "in_progress") {
    throw new AttemptStateError("This attempt cannot be submitted.");
  }

  const submittedAt = new Date();
  const expired = submittedAt >= new Date(attempt.expires_at);
  const scoringQuestions = await getScoringQuestions(db, attempt.test_id);
  const answers = await getScoringAnswers(db, attempt.id);
  const result = scoreSingleChoiceAttempt(scoringQuestions, answers);
  const timeTakenSeconds = Math.max(
    0,
    Math.floor((submittedAt.getTime() - new Date(attempt.started_at).getTime()) / 1000),
  );
  const { data: updatedAttempt, error: updateError } = await db
    .from("test_attempts")
    .update({
      status: expired ? "expired" : "submitted",
      submitted_at: submittedAt.toISOString(),
      score: result.score,
      max_score: result.maxScore,
      correct_count: result.correctCount,
      wrong_count: result.wrongCount,
      unanswered_count: result.unansweredCount,
      time_taken_seconds: timeTakenSeconds,
      updated_at: submittedAt.toISOString(),
    })
    .eq("id", attempt.id)
    .eq("status", "in_progress")
    .select(
      "id, user_id, test_id, status, started_at, expires_at, submitted_at, score, max_score, correct_count, wrong_count, unanswered_count, time_taken_seconds, tests(name)",
    )
    .single();

  if (updateError || !updatedAttempt) {
    const { data: storedAttempt } = await db
      .from("test_attempts")
      .select(
        "id, user_id, test_id, status, started_at, expires_at, submitted_at, score, max_score, correct_count, wrong_count, unanswered_count, time_taken_seconds, tests(name)",
      )
      .eq("id", attempt.id)
      .single();

    if (storedAttempt?.status === "submitted" || storedAttempt?.status === "expired") {
      return buildStoredResultPayload(db, storedAttempt);
    }

    throw new Error("Unable to submit attempt.");
  }

  if (parsed.questionTimeSpent) {
    const entries = Object.entries(parsed.questionTimeSpent);
    if (entries.length > 0) {
      await Promise.allSettled(
        entries.map(([qId, timeSpent]) =>
          db
            .from("user_answers")
            .update({ time_spent_seconds: timeSpent })
            .eq("attempt_id", attempt.id)
            .eq("question_id", qId),
        ),
      );
    }
  }

  return buildStoredResultPayload(db, updatedAttempt);
}

export class AttemptStateError extends Error {}

type StoredAttempt = {
  id: string;
  test_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
  correct_count: number | null;
  wrong_count: number | null;
  unanswered_count: number | null;
  time_taken_seconds: number | null;
  tests: { name: string } | { name: string }[] | null;
};

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function getScoringQuestions(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  testId: string,
): Promise<ScoringQuestion[]> {
  const { data, error } = await supabase
    .from("test_questions")
    .select(
      `
      question_id,
      marks,
      negative_marks,
      questions (
        default_marks,
        default_negative_marks,
        question_options (
          id,
          is_correct
        )
      )
    `,
    )
    .eq("test_id", testId);

  if (error || !data) {
    throw new Error("Unable to load scoring questions.");
  }

  return data.map((row) => {
    const question = Array.isArray(row.questions)
      ? row.questions[0]
      : row.questions;
    const options = Array.isArray(question?.question_options)
      ? question.question_options
      : [];
    const correctOption = options.find((option) => option.is_correct);

    if (!question || !correctOption) {
      throw new Error(`Missing correct option for question ${row.question_id}`);
    }

    return {
      questionId: row.question_id,
      correctOptionId: correctOption.id,
      marks: row.marks ?? question.default_marks,
      negativeMarks: row.negative_marks ?? question.default_negative_marks,
    };
  });
}

async function getScoringAnswers(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  attemptId: string,
): Promise<ScoringAnswer[]> {
  const { data, error } = await supabase
    .from("user_answers")
    .select("question_id, selected_option_id")
    .eq("attempt_id", attemptId);

  if (error || !data) {
    throw new Error("Unable to load answers.");
  }

  return data.map((answer) => ({
    questionId: answer.question_id,
    selectedOptionId: answer.selected_option_id,
  }));
}

async function buildStoredResultPayload(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  attempt: StoredAttempt,
) {
  const test = Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests;
  const review = await getReviewQuestions(supabase, attempt.test_id, attempt.id);

  return {
    attemptId: attempt.id,
    testId: attempt.test_id,
    testName: test?.name ?? "Mock Test",
    startedAt: attempt.started_at,
    submittedAt: attempt.submitted_at,
    result: {
      score: attempt.score ?? 0,
      maxScore: attempt.max_score ?? 0,
      correctCount: attempt.correct_count ?? 0,
      wrongCount: attempt.wrong_count ?? 0,
      unansweredCount: attempt.unanswered_count ?? 0,
    },
    timeTakenSeconds: attempt.time_taken_seconds ?? 0,
    review,
  };
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

  if (answersError && answersError.message.includes("does not exist")) {
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
