import { describe, expect, it } from "vitest";
import { getSafeQuestionsForTest, mockTests } from "@/lib/content/mock-data";

describe("Safe Question Payload (Architecture & PRD compliance)", () => {
  it("never includes is_correct in student question options", () => {
    const questions = getSafeQuestionsForTest(mockTests[0].id);
    expect(questions.length).toBeGreaterThan(0);

    for (const q of questions) {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("questionText");
      expect(q).toHaveProperty("options");

      // Critical architecture rule: correct answers must NEVER leak in active payloads
      expect(q).not.toHaveProperty("is_correct");
      expect(q).not.toHaveProperty("correctOptionId");
      expect(q).not.toHaveProperty("explanation");

      for (const opt of q.options) {
        expect(opt).toHaveProperty("id");
        expect(opt).toHaveProperty("optionText");
        expect(opt).toHaveProperty("orderIndex");
        expect(opt).not.toHaveProperty("is_correct");
        expect(opt).not.toHaveProperty("isCorrect");
      }
    }
  });
});
