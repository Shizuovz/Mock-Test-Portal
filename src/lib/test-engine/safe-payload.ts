import type { SafeQuestionPayload } from "@/types/models";

/**
 * Pure sanitizer that guarantees zero answer keys, correctness flags, or explanations
 * leak in payloads delivered to students during active attempts.
 */
export function stripCorrectAnswersFromTestPayload(questions: any[]): SafeQuestionPayload[] {
  return questions.map((q) => ({
    id: q.id,
    questionText: q.question_text || q.questionText,
    questionType: q.question_type || q.questionType || "single_choice",
    defaultMarks: q.default_marks ?? q.defaultMarks ?? 1,
    marks: q.marks ?? q.default_marks ?? q.defaultMarks ?? 1,
    negativeMarks: q.negative_marks ?? q.negativeMarks ?? q.default_negative_marks ?? q.defaultNegativeMarks ?? 0,
    options: (q.options || []).map((opt: any, idx: number) => ({
      id: opt.id,
      optionText: opt.option_text || opt.optionText,
      orderIndex: opt.order_index ?? opt.orderIndex ?? idx,
    })),
  }));
}
