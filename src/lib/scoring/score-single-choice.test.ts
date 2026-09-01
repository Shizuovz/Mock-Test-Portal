import { describe, expect, it } from "vitest";
import { scoreSingleChoiceAttempt } from "./score-single-choice";

describe("scoreSingleChoiceAttempt", () => {
  it("scores correct, wrong, and unanswered single-choice answers", () => {
    const result = scoreSingleChoiceAttempt(
      [
        {
          questionId: "q1",
          correctOptionId: "a",
          marks: 2,
          negativeMarks: 0.5,
        },
        {
          questionId: "q2",
          correctOptionId: "b",
          marks: 2,
          negativeMarks: 0.5,
        },
        {
          questionId: "q3",
          correctOptionId: "c",
          marks: 2,
          negativeMarks: 0.5,
        },
      ],
      [
        { questionId: "q1", selectedOptionId: "a" },
        { questionId: "q2", selectedOptionId: "z" },
        { questionId: "q3", selectedOptionId: null },
      ],
    );

    expect(result).toEqual({
      score: 1.5,
      maxScore: 6,
      correctCount: 1,
      wrongCount: 1,
      unansweredCount: 1,
    });
  });

  it("handles all questions wrong leading to negative total score", () => {
    const result = scoreSingleChoiceAttempt(
      [
        { questionId: "q1", correctOptionId: "a", marks: 2, negativeMarks: 1 },
        { questionId: "q2", correctOptionId: "b", marks: 2, negativeMarks: 1 },
      ],
      [
        { questionId: "q1", selectedOptionId: "x" },
        { questionId: "q2", selectedOptionId: "y" },
      ],
    );

    expect(result).toEqual({
      score: -2,
      maxScore: 4,
      correctCount: 0,
      wrongCount: 2,
      unansweredCount: 0,
    });
  });

  it("handles 100% unanswered attempt without penalties", () => {
    const result = scoreSingleChoiceAttempt(
      [
        { questionId: "q1", correctOptionId: "a", marks: 3, negativeMarks: 1 },
        { questionId: "q2", correctOptionId: "b", marks: 3, negativeMarks: 1 },
      ],
      [
        { questionId: "q1", selectedOptionId: null },
        { questionId: "q2", selectedOptionId: null },
      ],
    );

    expect(result).toEqual({
      score: 0,
      maxScore: 6,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 2,
    });
  });
});
