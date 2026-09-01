import type { Question } from "@/types/models";

export function canMeaningfullyEditQuestion(question: Question, attemptsExist: boolean) {
  if (question.status !== "published") {
    return true;
  }

  return !attemptsExist;
}

export function getPublishedQuestionEditGuidance(attemptsExist: boolean) {
  if (!attemptsExist) {
    return "Published question can be edited before attempts exist.";
  }

  return "Archive and copy this question instead of changing answers, marks, options, or meaning.";
}
