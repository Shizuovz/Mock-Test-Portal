import { NextResponse } from "next/server";
import { saveAnswer, AttemptStateError } from "@/lib/test-engine/save-answer";
import {
  AttemptAuthError,
  AttemptNotFoundError,
} from "@/lib/test-engine/start-attempt";

type SaveAnswerRouteContext = {
  params: Promise<{
    attemptId: string;
  }>;
};

export async function POST(request: Request, context: SaveAnswerRouteContext) {
  const { attemptId } = await context.params;

  if (attemptId.startsWith("local-")) {
    const body = await request.json();

    return NextResponse.json({
      attemptId,
      questionId: body.questionId,
      selectedOptionId: body.selectedOptionId ?? null,
      isMarkedForReview: Boolean(body.isMarkedForReview),
      savedAt: new Date().toISOString(),
      mode: "local",
    });
  }

  try {
    const savedAnswer = await saveAnswer({
      ...(await request.json()),
      attemptId,
    });

    return NextResponse.json(savedAnswer);
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

    return NextResponse.json({ error: "Unable to save answer" }, { status: 400 });
  }
}
