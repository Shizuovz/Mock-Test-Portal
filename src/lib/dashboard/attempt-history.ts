import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AttemptHistoryItem = {
  id: string;
  testId: string;
  testName: string;
  status: "submitted" | "expired";
  submittedAt: string | null;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeTakenSeconds: number;
};

export type AttemptHistorySummary = {
  testsCompleted: number;
  averageScorePercent: number | null;
  questionsAttempted: number;
  bestScorePercent: number | null;
};

export async function getAttemptHistory(limit?: number) {
  if (!hasSupabaseConfig()) {
    return {
      attempts: [],
      summary: emptySummary,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      attempts: [],
      summary: emptySummary,
    };
  }

  const db = createSupabaseAdminClient();
  let query = db
    .from("test_attempts")
    .select(
      "id, test_id, status, submitted_at, score, max_score, correct_count, wrong_count, unanswered_count, time_taken_seconds, tests(name)",
    )
    .eq("user_id", user.id)
    .in("status", ["submitted", "expired"])
    .order("submitted_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new Error("Unable to load attempt history.");
  }

  const attempts = data.map((attempt) => {
    const test = Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests;

    return {
      id: attempt.id,
      testId: attempt.test_id,
      testName: test?.name ?? "Mock Test",
      status: attempt.status,
      submittedAt: attempt.submitted_at,
      score: attempt.score ?? 0,
      maxScore: attempt.max_score ?? 0,
      correctCount: attempt.correct_count ?? 0,
      wrongCount: attempt.wrong_count ?? 0,
      unansweredCount: attempt.unanswered_count ?? 0,
      timeTakenSeconds: attempt.time_taken_seconds ?? 0,
    } satisfies AttemptHistoryItem;
  });

  return {
    attempts,
    summary: summarizeAttempts(attempts),
  };
}

const emptySummary: AttemptHistorySummary = {
  testsCompleted: 0,
  averageScorePercent: null,
  questionsAttempted: 0,
  bestScorePercent: null,
};

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function summarizeAttempts(attempts: AttemptHistoryItem[]): AttemptHistorySummary {
  if (attempts.length === 0) {
    return emptySummary;
  }

  const percentages = attempts
    .filter((attempt) => attempt.maxScore > 0)
    .map((attempt) => Math.round((attempt.score / attempt.maxScore) * 100));
  const averageScorePercent =
    percentages.length > 0
      ? Math.round(
          percentages.reduce((total, percentage) => total + percentage, 0) /
            percentages.length,
        )
      : null;

  return {
    testsCompleted: attempts.length,
    averageScorePercent,
    questionsAttempted: attempts.reduce(
      (total, attempt) =>
        total +
        attempt.correctCount +
        attempt.wrongCount +
        attempt.unansweredCount,
      0,
    ),
    bestScorePercent:
      percentages.length > 0 ? Math.max(...percentages) : null,
  };
}
