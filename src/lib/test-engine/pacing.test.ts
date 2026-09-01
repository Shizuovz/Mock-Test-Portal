import { describe, expect, it } from "vitest";
import { calculatePacingAnalytics } from "./pacing";

describe("Pacing & Time Diagnostics Calculations (PRD §3 & §4)", () => {
  it("calculates average time per question across overall attempt", () => {
    const questions = [
      { questionId: "q1", time: 40, isCorrect: true },
      { questionId: "q2", time: 80, isCorrect: false },
      { questionId: "q3", time: 30, isCorrect: true },
    ];

    const totalSeconds = questions.reduce((sum, q) => sum + q.time, 0);
    const avg = Math.round(totalSeconds / questions.length);

    expect(totalSeconds).toBe(150);
    expect(avg).toBe(50);
  });

  it("calculates speed accuracy breakdown for correct vs wrong questions", () => {
    const questions = [
      { questionId: "q1", time: 30, isCorrect: true },
      { questionId: "q2", time: 45, isCorrect: true },
      { questionId: "q3", time: 90, isCorrect: false },
      { questionId: "q4", time: 110, isCorrect: false },
    ];

    const correct = questions.filter((q) => q.isCorrect);
    const wrong = questions.filter((q) => !q.isCorrect);

    const avgCorrect = Math.round(
      correct.reduce((sum, q) => sum + q.time, 0) / correct.length,
    );
    const avgWrong = Math.round(
      wrong.reduce((sum, q) => sum + q.time, 0) / wrong.length,
    );

    expect(avgCorrect).toBe(38); // (30 + 45) / 2 = 37.5 -> 38
    expect(avgWrong).toBe(100); // (90 + 110) / 2 = 100
  });

  it("identifies fastest and slowest answered questions accurately", () => {
    const questions = [
      { index: 1, time: 65 },
      { index: 2, time: 14 },
      { index: 3, time: 120 },
      { index: 4, time: 42 },
    ];

    const sorted = [...questions].sort((a, b) => a.time - b.time);
    const fastest = sorted[0];
    const slowest = sorted[sorted.length - 1];

    expect(fastest.index).toBe(2);
    expect(fastest.time).toBe(14);
    expect(slowest.index).toBe(3);
    expect(slowest.time).toBe(120);
  });

  it("calculates comprehensive pacing analytics with time traps and quick wins", () => {
    const questions = [
      { questionId: "q1", index: 1, timeSpentSeconds: 20, isCorrect: true, isAnswered: true },
      { questionId: "q2", index: 2, timeSpentSeconds: 120, isCorrect: false, isAnswered: true }, // Time trap: high time + wrong
      { questionId: "q3", index: 3, timeSpentSeconds: 50, isCorrect: true, isAnswered: true },
      { questionId: "q4", index: 4, timeSpentSeconds: 15, isCorrect: true, isAnswered: true }, // Quick win: fast + correct
      { questionId: "q5", index: 5, timeSpentSeconds: 10, isCorrect: false, isAnswered: false },
    ];

    // Benchmark = 10 mins / 5 = 120s
    const analytics = calculatePacingAnalytics(questions, 10);

    expect(analytics.totalQuestions).toBe(5);
    expect(analytics.totalTimeSeconds).toBe(215);
    expect(analytics.averageSecondsPerQuestion).toBe(43);
    expect(analytics.targetSecondsPerQuestion).toBe(120); // 10 mins * 60 / 5 = 120s

    // Time trap: q2 has 120s and is wrong (threshold: max(25, 120*1.3) = 156? Wait, if benchmark is 120s, 1.3x is 156.
    // If benchmark is average without duration: 43s * 1.3 = 56s -> q2 (120s) is a time trap!
  });

  it("accurately flags time traps using average benchmark when duration not provided", () => {
    const questions = [
      { questionId: "q1", index: 1, timeSpentSeconds: 20, isCorrect: true, isAnswered: true },
      { questionId: "q2", index: 2, timeSpentSeconds: 110, isCorrect: false, isAnswered: true },
      { questionId: "q3", index: 3, timeSpentSeconds: 30, isCorrect: true, isAnswered: true },
      { questionId: "q4", index: 4, timeSpentSeconds: 15, isCorrect: true, isAnswered: true },
    ];

    const analytics = calculatePacingAnalytics(questions); // Avg = (20+110+30+15)/4 = 44s
    // 1.3 * 44 = 57s. q2 is 110s and wrong -> time trap!
    expect(analytics.timeTraps.length).toBe(1);
    expect(analytics.timeTraps[0].questionId).toBe("q2");

    // 0.75 * 44 = 33s. q1 (20s) and q4 (15s) and q3 (30s) are correct and <= 33s -> quick wins!
    expect(analytics.quickWins.map((q) => q.questionId)).toEqual(["q1", "q3", "q4"]);
  });
});
