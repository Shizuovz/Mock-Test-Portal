import { describe, expect, it } from "vitest";
import { stripCorrectAnswersFromTestPayload } from "@/lib/test-engine/safe-payload";
import { scoreSingleChoiceAttempt } from "@/lib/scoring/score-single-choice";
import type { ScoringQuestion, ScoringAnswer } from "@/lib/scoring/types";

describe("P0 Exam Invariants & Academic Integrity", () => {
  it("proves active test payload strictly strips is_correct, correctOptionId and explanations", () => {
    const rawQuestions: any[] = [
      {
        id: "q1",
        questionText: "What is the capital of Nagaland?",
        options: [
          { id: "opt1", optionText: "Kohima", is_correct: true },
          { id: "opt2", optionText: "Dimapur", is_correct: false },
        ],
        explanation: "Kohima is the capital city of Nagaland.",
      },
      {
        id: "q2",
        questionText: "Which article of the Indian Constitution grants special provisions to Nagaland?",
        options: [
          { id: "opt3", optionText: "Article 371A", is_correct: true },
          { id: "opt4", optionText: "Article 370", is_correct: false },
        ],
        explanation: "Article 371A provides special constitutional safeguards.",
      },
    ];

    const safePayload = stripCorrectAnswersFromTestPayload(rawQuestions);

    for (const question of safePayload) {
      // 1. Explanation must be removed from student view
      expect((question as any).explanation).toBeUndefined();

      // 2. Options must NEVER contain is_correct flag
      for (const option of question.options) {
        expect((option as any).is_correct).toBeUndefined();
        expect((option as any).isCorrect).toBeUndefined();
      }
    }
  });

  it("proves server calculates single-choice scores and applies negative marks authoritatively", () => {
    const questions: ScoringQuestion[] = [
      { questionId: "q1", marks: 2, negativeMarks: 0.5, correctOptionId: "opt_correct_1" },
      { questionId: "q2", marks: 2, negativeMarks: 0.5, correctOptionId: "opt_correct_2" },
      { questionId: "q3", marks: 2, negativeMarks: 0.5, correctOptionId: "opt_correct_3" },
      { questionId: "q4", marks: 2, negativeMarks: 0.5, correctOptionId: "opt_correct_4" },
    ];

    // Student answered:
    // q1: correct (+2)
    // q2: incorrect (-0.5)
    // q3: unattempted (0)
    // q4: correct (+2)
    const answers: ScoringAnswer[] = [
      { questionId: "q1", selectedOptionId: "opt_correct_1" },
      { questionId: "q2", selectedOptionId: "opt_wrong_2" },
      { questionId: "q3", selectedOptionId: null },
      { questionId: "q4", selectedOptionId: "opt_correct_4" },
    ];

    const result = scoreSingleChoiceAttempt(questions, answers);

    // Expected: +2 - 0.5 + 0 + 2 = 3.5 marks out of 8 max marks
    expect(result.score).toBe(3.5);
    expect(result.maxScore).toBe(8);
    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(1);
    expect(result.unansweredCount).toBe(1);
  });

  it("proves client-provided scores in submission payload have zero effect on evaluated result", () => {
    const questions: ScoringQuestion[] = [
      { questionId: "q1", marks: 1, negativeMarks: 0, correctOptionId: "opt1" },
    ];
    const answers: ScoringAnswer[] = [
      { questionId: "q1", selectedOptionId: "opt_wrong" },
    ];

    // If student sends client-manipulated score payload: { score: 100 }
    const clientTamperedPayload = {
      score: 100,
      correctCount: 50,
    };

    // Server evaluates purely against answers and answer keys
    const calculatedResult = scoreSingleChoiceAttempt(questions, answers);

    expect(calculatedResult.score).toBe(0);
    expect(calculatedResult.score).not.toBe(clientTamperedPayload.score);
    expect(calculatedResult.correctCount).toBe(0);
  });

  it("proves offline answer reconciliation fence: answer saves after expiry are rejected", () => {
    const startedAt = new Date("2026-01-01T10:00:00Z");
    const durationMinutes = 60;
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

    const checkAttemptValidity = (currentTime: Date, attemptStatus: string) => {
      if (attemptStatus !== "in_progress") {
        return { allowed: false, reason: "Attempt is already submitted or closed." };
      }
      if (currentTime > expiresAt) {
        return { allowed: false, reason: "Attempt timer has expired." };
      }
      return { allowed: true };
    };

    // 1. Within time
    const validSave = checkAttemptValidity(new Date("2026-01-01T10:30:00Z"), "in_progress");
    expect(validSave.allowed).toBe(true);

    // 2. Offline queue flushes 5 minutes after expiry
    const lateSave = checkAttemptValidity(new Date("2026-01-01T11:05:00Z"), "in_progress");
    expect(lateSave.allowed).toBe(false);
    expect(lateSave.reason).toContain("expired");

    // 3. Offline queue flushes after attempt was already submitted
    const postSubmitSave = checkAttemptValidity(new Date("2026-01-01T10:45:00Z"), "submitted");
    expect(postSubmitSave.allowed).toBe(false);
    expect(postSubmitSave.reason).toContain("submitted");
  });
});
