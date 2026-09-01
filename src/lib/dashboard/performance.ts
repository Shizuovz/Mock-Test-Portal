import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TopicPerformance = {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalAttempted: number;
  correctCount: number;
  accuracyPercent: number;
  status: "weak" | "average" | "strong";
};

export type OverallPerformance = {
  totalAttempts: number;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  overallAccuracyPercent: number;
  averageScorePercent: number;
  totalTimeMinutes: number;
  weakTopics: TopicPerformance[];
  strongTopics: TopicPerformance[];
  allTopics: TopicPerformance[];
  recentScores: {
    testName: string;
    scorePercent: number;
    date: string;
  }[];
};

export async function getStudentPerformance(): Promise<OverallPerformance> {
  const defaultPerformance: OverallPerformance = {
    totalAttempts: 0,
    totalQuestionsAttempted: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalUnanswered: 0,
    overallAccuracyPercent: 0,
    averageScorePercent: 0,
    totalTimeMinutes: 0,
    weakTopics: [],
    strongTopics: [],
    allTopics: [],
    recentScores: [],
  };

  if (!hasSupabaseConfig()) {
    return defaultPerformance;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return defaultPerformance;
  }

  const db = createSupabaseAdminClient();

  // Load all submitted/expired attempts
  const { data: attempts, error: attemptError } = await db
    .from("test_attempts")
    .select(`
      id,
      score,
      max_score,
      correct_count,
      wrong_count,
      unanswered_count,
      time_taken_seconds,
      submitted_at,
      tests (
        name
      )
    `)
    .eq("user_id", user.id)
    .in("status", ["submitted", "expired"])
    .order("submitted_at", { ascending: true });

  if (attemptError || !attempts || attempts.length === 0) {
    return defaultPerformance;
  }

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnanswered = 0;
  let totalTimeSeconds = 0;
  let scorePercentSum = 0;
  let validScoreCount = 0;

  const recentScores = attempts.map((a) => {
    const test = Array.isArray(a.tests) ? a.tests[0] : a.tests;
    const testName = test?.name ?? "Mock Test";
    const pct =
      a.max_score && a.max_score > 0
        ? Math.round(((a.score ?? 0) / a.max_score) * 100)
        : 0;

    totalCorrect += a.correct_count ?? 0;
    totalWrong += a.wrong_count ?? 0;
    totalUnanswered += a.unanswered_count ?? 0;
    totalTimeSeconds += a.time_taken_seconds ?? 0;

    if (a.max_score && a.max_score > 0) {
      scorePercentSum += pct;
      validScoreCount += 1;
    }

    return {
      testName,
      scorePercent: pct,
      date: a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "",
    };
  });

  totalQuestions = totalCorrect + totalWrong;
  const overallAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const averageScore =
    validScoreCount > 0 ? Math.round(scorePercentSum / validScoreCount) : 0;

  // Now compute topic-level metrics
  const attemptIds = attempts.map((a) => a.id);
  const { data: userAnswers } = await db
    .from("user_answers")
    .select(`
      selected_option_id,
      questions (
        id,
        topic_id,
        topics (
          id,
          name,
          subjects (
            name
          )
        ),
        question_options (
          id,
          is_correct
        )
      )
    `)
    .in("attempt_id", attemptIds);

  const topicAgg = new Map<
    string,
    {
      topicName: string;
      subjectName: string;
      attempted: number;
      correct: number;
    }
  >();

  if (userAnswers) {
    for (const ua of userAnswers) {
      const q = Array.isArray(ua.questions) ? ua.questions[0] : ua.questions;
      if (!q) continue;

      const topic = Array.isArray(q.topics) ? q.topics[0] : q.topics;
      if (!topic) continue;

      const subject = Array.isArray(topic.subjects)
        ? topic.subjects[0]
        : topic.subjects;

      const topicId = topic.id;
      const topicName = topic.name;
      const subjectName = subject?.name ?? "General";

      const current = topicAgg.get(topicId) ?? {
        topicName,
        subjectName,
        attempted: 0,
        correct: 0,
      };

      if (ua.selected_option_id) {
        current.attempted += 1;
        const opts = q.question_options ?? [];
        const chosen = opts.find(
          (opt: { id: string; is_correct: boolean }) =>
            opt.id === ua.selected_option_id,
        );
        if (chosen?.is_correct) {
          current.correct += 1;
        }
      }

      topicAgg.set(topicId, current);
    }
  }

  const allTopics: TopicPerformance[] = [];
  for (const [topicId, data] of topicAgg.entries()) {
    if (data.attempted > 0) {
      const accuracy = Math.round((data.correct / data.attempted) * 100);
      let status: TopicPerformance["status"] = "average";
      if (accuracy < 60) {
        status = "weak";
      } else if (accuracy >= 75) {
        status = "strong";
      }

      allTopics.push({
        topicId,
        topicName: data.topicName,
        subjectName: data.subjectName,
        totalAttempted: data.attempted,
        correctCount: data.correct,
        accuracyPercent: accuracy,
        status,
      });
    }
  }

  // Sort topics by accuracy
  allTopics.sort((a, b) => a.accuracyPercent - b.accuracyPercent);

  const weakTopics = allTopics.filter((t) => t.status === "weak");
  const strongTopics = allTopics.filter((t) => t.status === "strong").reverse();

  return {
    totalAttempts: attempts.length,
    totalQuestionsAttempted: totalQuestions,
    totalCorrect,
    totalWrong,
    totalUnanswered,
    overallAccuracyPercent: overallAccuracy,
    averageScorePercent: averageScore,
    totalTimeMinutes: Math.round(totalTimeSeconds / 60),
    weakTopics,
    strongTopics,
    allTopics,
    recentScores,
  };
}

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
