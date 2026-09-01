import { NextResponse } from "next/server";
import {
  getAnswerReviewForTest,
  getScoringQuestionsForTest,
  getTestById,
} from "@/lib/content/mock-data";
import { scoreSingleChoiceAttempt } from "@/lib/scoring/score-single-choice";
import { submitAttempt, AttemptStateError } from "@/lib/test-engine/submit-attempt";
import {
  AttemptAuthError,
  AttemptNotFoundError,
} from "@/lib/test-engine/start-attempt";
import { localSubmitAttemptSchema } from "@/lib/validation/attempt.schema";

type SubmitAttemptRouteContext = {
  params: Promise<{
    attemptId: string;
  }>;
};

export async function POST(request: Request, context: SubmitAttemptRouteContext) {
  const { attemptId } = await context.params;
  let bodyJson: Record<string, unknown> = {};
  try {
    bodyJson = await request.json();
  } catch {
    // No body or empty body
  }

  if (!attemptId.startsWith("local-")) {
    try {
      const result = await submitAttempt({
        attemptId,
        questionTimeSpent: bodyJson.questionTimeSpent,
      });

      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof AttemptAuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      if (error instanceof AttemptNotFoundError) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      if (error instanceof AttemptStateError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }

      return NextResponse.json({ error: "Unable to submit attempt" }, { status: 400 });
    }
  }

  const body = localSubmitAttemptSchema.parse(bodyJson);
  const test = getTestById(body.testId);

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const scoringQuestions = getScoringQuestionsForTest(test.id);
  const answers = scoringQuestions.map((question) => ({
    questionId: question.questionId,
    selectedOptionId: body.answers[question.questionId] ?? null,
  }));
  const result = scoreSingleChoiceAttempt(scoringQuestions, answers);
  const review = getAnswerReviewForTest(test.id).map((question) => {
    const selectedOptionId = body.answers[question.questionId] ?? null;
    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );
    const timeSpentSeconds = body.questionTimeSpent?.[question.questionId] ?? 0;

    return {
      ...question,
      selectedOptionId,
      selectedOptionText: selectedOption?.optionText ?? null,
      isCorrect: selectedOptionId === question.correctOptionId,
      timeSpentSeconds,
    };
  });

  return NextResponse.json({
    attemptId,
    testId: test.id,
    testName: test.name,
    startedAt: body.startedAt,
    submittedAt: body.submittedAt,
    result,
    questionTimeSpent: body.questionTimeSpent ?? {},
    review,
  });
}
