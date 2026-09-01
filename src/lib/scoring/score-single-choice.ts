import type { ScoreResult, ScoringAnswer, ScoringQuestion } from "./types";

export function scoreSingleChoiceAttempt(
  questions: ScoringQuestion[],
  answers: ScoringAnswer[],
): ScoreResult {
  const answersByQuestionId = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  );

  return questions.reduce<ScoreResult>(
    (result, question) => {
      const answer = answersByQuestionId.get(question.questionId);
      result.maxScore += question.marks;

      if (!answer?.selectedOptionId) {
        result.unansweredCount += 1;
        return result;
      }

      if (answer.selectedOptionId === question.correctOptionId) {
        result.correctCount += 1;
        result.score += question.marks;
        return result;
      }

      result.wrongCount += 1;
      result.score -= question.negativeMarks;
      return result;
    },
    {
      score: 0,
      maxScore: 0,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 0,
    },
  );
}
