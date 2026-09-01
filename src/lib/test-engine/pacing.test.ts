import { describe, expect, it } from "vitest";

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
});
