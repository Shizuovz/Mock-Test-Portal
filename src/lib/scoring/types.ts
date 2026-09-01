export type ScoringQuestion = {
  questionId: string;
  correctOptionId: string;
  marks: number;
  negativeMarks: number;
};

export type ScoringAnswer = {
  questionId: string;
  selectedOptionId: string | null;
};

export type ScoreResult = {
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
};
