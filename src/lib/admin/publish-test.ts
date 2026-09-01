type PublishTestValidationInput = {
  questionCount: number;
  durationMinutes: number;
  invalidSingleChoiceQuestionCount: number;
};

export function validateTestBeforePublish({
  questionCount,
  durationMinutes,
  invalidSingleChoiceQuestionCount,
}: PublishTestValidationInput) {
  const errors: string[] = [];

  if (questionCount < 1) {
    errors.push("A published test must contain at least one question.");
  }

  if (durationMinutes < 1) {
    errors.push("A published test must have a positive duration.");
  }

  if (invalidSingleChoiceQuestionCount > 0) {
    errors.push("Each single-choice question must have exactly one correct option.");
  }

  return {
    canPublish: errors.length === 0,
    errors,
  };
}
