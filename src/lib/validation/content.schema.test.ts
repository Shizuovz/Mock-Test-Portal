import { describe, expect, it } from "vitest";
import {
  singleChoiceQuestionSchema,
  testSchema,
  slugSchema,
} from "./content.schema";

describe("Content Validation Schemas", () => {
  it("validates that a single choice question must have exactly one correct option", () => {
    const valid = singleChoiceQuestionSchema.safeParse({
      topicId: "11111111-1111-4111-8111-111111111111",
      questionText: "What is 2 + 2?",
      defaultMarks: 1,
      defaultNegativeMarks: 0.25,
      options: [
        { optionText: "3", isCorrect: false, orderIndex: 1 },
        { optionText: "4", isCorrect: true, orderIndex: 2 },
        { optionText: "5", isCorrect: false, orderIndex: 3 },
        { optionText: "6", isCorrect: false, orderIndex: 4 },
      ],
    });
    expect(valid.success).toBe(true);

    // Multiple correct options should fail
    const multipleCorrect = singleChoiceQuestionSchema.safeParse({
      topicId: "11111111-1111-4111-8111-111111111111",
      questionText: "What is 2 + 2?",
      options: [
        { optionText: "4", isCorrect: true, orderIndex: 1 },
        { optionText: "Four", isCorrect: true, orderIndex: 2 },
      ],
    });
    expect(multipleCorrect.success).toBe(false);

    // Zero correct options should fail
    const zeroCorrect = singleChoiceQuestionSchema.safeParse({
      topicId: "11111111-1111-4111-8111-111111111111",
      questionText: "What is 2 + 2?",
      options: [
        { optionText: "3", isCorrect: false, orderIndex: 1 },
        { optionText: "5", isCorrect: false, orderIndex: 2 },
      ],
    });
    expect(zeroCorrect.success).toBe(false);
  });

  it("enforces test duration must be positive", () => {
    const invalidDuration = testSchema.safeParse({
      examId: "11111111-1111-4111-8111-111111111111",
      name: "Speed Test",
      slug: "speed-test",
      durationMinutes: -10,
    });
    expect(invalidDuration.success).toBe(false);

    const validTest = testSchema.safeParse({
      examId: "11111111-1111-4111-8111-111111111111",
      name: "Standard Mock Test",
      slug: "standard-mock-test",
      durationMinutes: 60,
    });
    expect(validTest.success).toBe(true);
  });

  it("validates slug format strictly", () => {
    expect(slugSchema.safeParse("ssc-cgl-tier-1").success).toBe(true);
    expect(slugSchema.safeParse("SSC CGL").success).toBe(false);
    expect(slugSchema.safeParse("ssc_cgl").success).toBe(false);
    expect(slugSchema.safeParse("-invalid-").success).toBe(false);
  });

  it("validates maxAttempts and scoreDisplayMode retake policy fields", () => {
    // Valid: unlimited attempts (null) with best score
    const unlimited = testSchema.safeParse({
      examId: "11111111-1111-4111-8111-111111111111",
      name: "Practice Test",
      slug: "practice-test",
      durationMinutes: 30,
      maxAttempts: null,
      scoreDisplayMode: "best",
    });
    expect(unlimited.success).toBe(true);

    // Valid: single attempt with latest score
    const singleAttempt = testSchema.safeParse({
      examId: "11111111-1111-4111-8111-111111111111",
      name: "Final Mock Exam",
      slug: "final-mock-exam",
      durationMinutes: 60,
      maxAttempts: 1,
      scoreDisplayMode: "latest",
    });
    expect(singleAttempt.success).toBe(true);

    // Invalid: negative or zero maxAttempts
    const zeroAttempts = testSchema.safeParse({
      examId: "11111111-1111-4111-8111-111111111111",
      name: "Zero Test",
      slug: "zero-test",
      durationMinutes: 30,
      maxAttempts: 0,
    });
    expect(zeroAttempts.success).toBe(false);

    // Invalid: invalid scoreDisplayMode
    const invalidMode = testSchema.safeParse({
      examId: "11111111-1111-4111-8111-111111111111",
      name: "Mode Test",
      slug: "mode-test",
      durationMinutes: 30,
      scoreDisplayMode: "average",
    });
    expect(invalidMode.success).toBe(false);
  });
});
