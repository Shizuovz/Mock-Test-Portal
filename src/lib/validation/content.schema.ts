import { z } from "zod";

export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const examSchema = z.object({
  name: z.string().min(2).max(160),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

export const subjectSchema = z.object({
  examId: z.string().uuid(),
  name: z.string().min(2).max(160),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export const topicSchema = z.object({
  subjectId: z.string().uuid(),
  name: z.string().min(2).max(160),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export const questionOptionSchema = z.object({
  optionText: z.string().min(1).max(2000),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().min(0),
});

export const singleChoiceQuestionSchema = z
  .object({
    topicId: z.string().uuid(),
    questionText: z.string().min(1),
    difficulty: z.string().max(60).optional(),
    explanation: z.string().optional(),
    defaultMarks: z.number().positive().default(1),
    defaultNegativeMarks: z.number().min(0).default(0),
    options: z.array(questionOptionSchema).min(2),
  })
  .refine(
    (question) => question.options.filter((option) => option.isCorrect).length === 1,
    "Single-choice questions must have exactly one correct option.",
  );

export const testSchema = z.object({
  examId: z.string().uuid(),
  name: z.string().min(2).max(180),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  durationMinutes: z.number().int().positive(),
  passingMarks: z.number().min(0).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  maxAttempts: z.number().int().positive().nullable().optional(),
  scoreDisplayMode: z.enum(["best", "latest"]).default("best"),
});
