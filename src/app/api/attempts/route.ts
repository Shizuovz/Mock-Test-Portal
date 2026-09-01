import { NextResponse } from "next/server";
import {
  AttemptAuthError,
  AttemptNotFoundError,
  startAttempt,
} from "@/lib/test-engine/start-attempt";

export async function GET() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 });
}

export async function POST(request: Request) {
  try {
    const attempt = await startAttempt(await request.json());

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    if (error instanceof AttemptAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AttemptNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: "Unable to start attempt" }, { status: 400 });
  }
}
