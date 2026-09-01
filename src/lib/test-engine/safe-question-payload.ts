import type { Question, QuestionOption, SafeQuestionPayload } from "@/types/models";

type BuildSafeQuestionPayloadInput = {
  question: Question;
  options: QuestionOption[];
  marks?: number | null;
  negativeMarks?: number | null;
};

export function buildSafeQuestionPayload({
  question,
  options,
  marks,
  negativeMarks,
}: BuildSafeQuestionPayloadInput): SafeQuestionPayload {
  return {
    id: question.id,
    questionText: question.questionText,
    questionType: question.questionType,
    marks: marks ?? question.defaultMarks,
    negativeMarks: negativeMarks ?? question.defaultNegativeMarks,
    options: options
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((option) => ({
        id: option.id,
        optionText: option.optionText,
        orderIndex: option.orderIndex,
      })),
  };
}
