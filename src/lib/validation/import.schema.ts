import { z } from "zod";

export const questionImportRowSchema = z.object({
  exam: z.string().min(1),
  subject: z.string().min(1),
  topic: z.string().min(1),
  questionText: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctOption: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().optional(),
  difficulty: z.string().optional(),
  marks: z.coerce.number().positive().default(1),
  negativeMarks: z.coerce.number().min(0).default(0),
});

export const questionImportSchema = z.array(questionImportRowSchema);
