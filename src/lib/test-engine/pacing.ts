export type PacingQuestionItem = {
  questionId: string;
  index: number;
  timeSpentSeconds: number;
  isCorrect: boolean;
  isAnswered: boolean;
  questionText?: string;
};

export type PacingAnalytics = {
  totalQuestions: number;
  totalTimeSeconds: number;
  averageSecondsPerQuestion: number;
  targetSecondsPerQuestion: number;
  averageCorrectSeconds: number;
  averageWrongSeconds: number;
  fastestQuestion: PacingQuestionItem | null;
  slowestQuestion: PacingQuestionItem | null;
  timeTraps: PacingQuestionItem[];
  quickWins: PacingQuestionItem[];
  timeDistribution: {
    correctSeconds: number;
    correctPercentage: number;
    wrongSeconds: number;
    wrongPercentage: number;
    unansweredSeconds: number;
    unansweredPercentage: number;
  };
};

/**
 * Calculates comprehensive pacing metrics, speed vs accuracy breakdown,
 * identifies Time Traps (high time + wrong/unanswered), and Quick Wins (fast + correct).
 */
export function calculatePacingAnalytics(
  questions: PacingQuestionItem[],
  testDurationMinutes?: number | null,
): PacingAnalytics {
  const totalQuestions = questions.length;
  const totalTimeSeconds = questions.reduce((sum, q) => sum + q.timeSpentSeconds, 0);
  const averageSecondsPerQuestion =
    totalQuestions > 0 ? Math.round(totalTimeSeconds / totalQuestions) : 0;

  const targetSecondsPerQuestion =
    testDurationMinutes && testDurationMinutes > 0 && totalQuestions > 0
      ? Math.round((testDurationMinutes * 60) / totalQuestions)
      : averageSecondsPerQuestion;

  const correctQuestions = questions.filter((q) => q.isCorrect);
  const wrongQuestions = questions.filter((q) => q.isAnswered && !q.isCorrect);
  const unansweredQuestions = questions.filter((q) => !q.isAnswered);

  const correctSeconds = correctQuestions.reduce((sum, q) => sum + q.timeSpentSeconds, 0);
  const wrongSeconds = wrongQuestions.reduce((sum, q) => sum + q.timeSpentSeconds, 0);
  const unansweredSeconds = unansweredQuestions.reduce((sum, q) => sum + q.timeSpentSeconds, 0);

  const averageCorrectSeconds =
    correctQuestions.length > 0
      ? Math.round(correctSeconds / correctQuestions.length)
      : 0;

  const averageWrongSeconds =
    wrongQuestions.length > 0
      ? Math.round(wrongSeconds / wrongQuestions.length)
      : 0;

  const answeredWithTime = questions.filter((q) => q.timeSpentSeconds > 0);
  const sorted = [...answeredWithTime].sort((a, b) => a.timeSpentSeconds - b.timeSpentSeconds);
  const fastestQuestion = sorted[0] ?? null;
  const slowestQuestion = sorted[sorted.length - 1] ?? null;

  // Benchmark pace is target pace if specified, otherwise average
  const benchmarkSeconds = targetSecondsPerQuestion > 0 ? targetSecondsPerQuestion : averageSecondsPerQuestion;

  // Time Trap: spent >= 1.3x benchmark time AND (got it wrong OR left unanswered after spending significant time)
  const timeTraps = questions.filter((q) => {
    if (q.isCorrect) return false;
    const threshold = Math.max(25, Math.round(benchmarkSeconds * 1.3));
    return benchmarkSeconds > 0 && q.timeSpentSeconds >= threshold;
  });

  // Quick Win: answered correctly in <= 75% of benchmark time
  const quickWins = questions.filter((q) => {
    if (!q.isCorrect) return false;
    const threshold = Math.round(benchmarkSeconds * 0.75);
    return benchmarkSeconds > 0 && q.timeSpentSeconds <= threshold;
  });

  const effectiveTotal = totalTimeSeconds > 0 ? totalTimeSeconds : 1;
  const correctPercentage = Math.round((correctSeconds / effectiveTotal) * 100);
  const wrongPercentage = Math.round((wrongSeconds / effectiveTotal) * 100);
  const unansweredPercentage = Math.max(0, 100 - (correctPercentage + wrongPercentage));

  return {
    totalQuestions,
    totalTimeSeconds,
    averageSecondsPerQuestion,
    targetSecondsPerQuestion,
    averageCorrectSeconds,
    averageWrongSeconds,
    fastestQuestion,
    slowestQuestion,
    timeTraps,
    quickWins,
    timeDistribution: {
      correctSeconds,
      correctPercentage,
      wrongSeconds,
      wrongPercentage,
      unansweredSeconds,
      unansweredPercentage,
    },
  };
}
