import { z } from "zod";

export const startAttemptSchema = z.object({
  testId: z.string().uuid(),
});

export const saveAnswerSchema = z.object({
  attemptId: z.string().uuid(),
  questionId: z.string().uuid(),
  selectedOptionId: z.string().uuid().nullable(),
  isMarkedForReview: z.boolean().default(false),
  timeSpentSeconds: z.number().int().nonnegative().optional(),
});

export const submitAttemptSchema = z.object({
  attemptId: z.string().uuid(),
  questionTimeSpent: z.record(z.string().uuid(), z.number().int().nonnegative()).optional(),
});

export const localSubmitAttemptSchema = z.object({
  testId: z.string().uuid(),
  answers: z.record(z.string().uuid(), z.string().nullable()),
  submittedAt: z.string().datetime(),
  startedAt: z.string().datetime(),
  questionTimeSpent: z.record(z.string().uuid(), z.number().int().nonnegative()).optional(),
});
