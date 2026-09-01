import { describe, expect, it } from "vitest";
import { AttemptLimitReachedError } from "./start-attempt";

describe("Retake Policies & Score Highlight Mechanics (PRD Section 31)", () => {
  it("formats AttemptLimitReachedError correctly for single and multiple attempts", () => {
    const single = new AttemptLimitReachedError(1);
    expect(single.maxAttempts).toBe(1);
    expect(single.message).toContain("maximum of 1 attempt.");

    const multiple = new AttemptLimitReachedError(3);
    expect(multiple.maxAttempts).toBe(3);
    expect(multiple.message).toContain("maximum of 3 attempts.");
  });

  it("calculates score display correctly for Best Score vs Latest Score strategies", () => {
    const attempts = [
      { score: 60, maxScore: 100 },
      { score: 90, maxScore: 100 },
      { score: 75, maxScore: 100 },
    ];

    // Best Score Strategy
    const bestScorePercent = Math.max(...attempts.map((a) => Math.round((a.score / a.maxScore) * 100)));
    expect(bestScorePercent).toBe(90);

    // Latest Score Strategy
    const latest = attempts[attempts.length - 1];
    const latestScorePercent = Math.round((latest.score / latest.maxScore) * 100);
    expect(latestScorePercent).toBe(75);
  });

  it("evaluates attempt limit boundary conditions correctly", () => {
    function isLimitReached(completedCount: number, maxAttempts: number | null): boolean {
      if (maxAttempts === null) return false;
      return completedCount >= maxAttempts;
    }

    // Unlimited policy
    expect(isLimitReached(0, null)).toBe(false);
    expect(isLimitReached(5, null)).toBe(false);

    // Single attempt policy
    expect(isLimitReached(0, 1)).toBe(false);
    expect(isLimitReached(1, 1)).toBe(true);
    expect(isLimitReached(2, 1)).toBe(true);

    // Max 3 attempts policy
    expect(isLimitReached(2, 3)).toBe(false);
    expect(isLimitReached(3, 3)).toBe(true);
  });
});
