import { startAttemptSchema } from "@/lib/validation/attempt.schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateGuestSessionId } from "@/lib/auth/guest-session";
import type { SafeQuestionPayload } from "@/types/models";

export class AttemptAuthError extends Error {}
export class AttemptNotFoundError extends Error {}
export class AttemptPaymentRequiredError extends Error {
  constructor(message?: string) {
    super(
      message ??
        "You've used all 3 free mock tests. Unlock all mock tests for ₹499.",
    );
    this.name = "AttemptPaymentRequiredError";
  }
}
export class AttemptLimitReachedError extends Error {
  constructor(
    public readonly maxAttempts: number,
    message?: string,
  ) {
    super(
      message ??
        `Attempt limit reached. This test allows a maximum of ${maxAttempts} attempt${maxAttempts === 1 ? "" : "s"}.`,
    );
    this.name = "AttemptLimitReachedError";
  }
}

export async function startAttempt(input: unknown) {
  const parsed = startAttemptSchema.parse(input);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = createSupabaseAdminClient();

  // 1. Verify that test exists and is published
  const { data: test, error: testError } = await db
    .from("tests")
    .select("id, name, duration_minutes, is_published, max_attempts")
    .eq("id", parsed.testId)
    .eq("is_published", true)
    .single();

  if (testError || !test) {
    throw new AttemptNotFoundError("Published test not found.");
  }

  let attemptRow: {
    id: string;
    started_at: string;
    expires_at: string;
    guest_session_id?: string | null;
  };

  if (!user) {
    // 2. Guest Flow: 1 free attempt tracked via guest_sessions
    const guestSessionId = await getOrCreateGuestSessionId();
    const { data: attempt, error: rpcError } = await db.rpc(
      "start_guest_free_attempt",
      {
        p_guest_session_id: guestSessionId,
        p_test_id: test.id,
      },
    );

    if (rpcError) {
      if (rpcError.message.includes("GUEST_ATTEMPT_LIMIT_REACHED")) {
        throw new AttemptAuthError(
          "You've completed your free mock test. Create a free account to unlock 3 additional mock tests.",
        );
      }
      if (rpcError.message.includes("TEST_NOT_FOUND")) {
        throw new AttemptNotFoundError("Published test not found.");
      }
      throw new Error(`Unable to start guest attempt: ${rpcError.message}`);
    }

    attemptRow = attempt as unknown as {
      id: string;
      started_at: string;
      expires_at: string;
    };
  } else {
    // 3. Registered Flow
    const nowIso = new Date().toISOString();
    const { data: activeSub } = await db
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .lte("starts_at", nowIso)
      .gt("expires_at", nowIso)
      .limit(1)
      .maybeSingle();

    if (activeSub) {
      // 3a. Paid Subscriber Flow: unlimited attempts while subscription is valid
      const { data: attempt, error: rpcError } = await db.rpc(
        "start_subscription_attempt",
        {
          p_user_id: user.id,
          p_test_id: test.id,
        },
      );

      if (rpcError) {
        if (rpcError.message.includes("TEST_MAX_ATTEMPTS_REACHED")) {
          const maxAttempts = Number(test.max_attempts) || 1;
          throw new AttemptLimitReachedError(maxAttempts);
        }
        if (rpcError.message.includes("TEST_NOT_FOUND")) {
          throw new AttemptNotFoundError("Published test not found.");
        }
        throw new Error(`Unable to start subscription attempt: ${rpcError.message}`);
      }

      attemptRow = attempt as unknown as {
        id: string;
        started_at: string;
        expires_at: string;
      };
    } else {
      // 3b. Registered Free User Flow: up to 3 free attempts
      const { data: attempt, error: rpcError } = await db.rpc(
        "start_registered_free_attempt",
        {
          p_user_id: user.id,
          p_test_id: test.id,
        },
      );

      if (rpcError) {
        if (rpcError.message.includes("FREE_ATTEMPT_LIMIT_REACHED")) {
          throw new AttemptPaymentRequiredError(
            "You've used all 3 free mock tests. Unlock all mock tests for ₹499.",
          );
        }
        if (rpcError.message.includes("TEST_MAX_ATTEMPTS_REACHED")) {
          const maxAttempts = Number(test.max_attempts) || 1;
          throw new AttemptLimitReachedError(maxAttempts);
        }
        if (rpcError.message.includes("TEST_NOT_FOUND")) {
          throw new AttemptNotFoundError("Published test not found.");
        }
        throw new Error(`Unable to start free attempt: ${rpcError.message}`);
      }

      attemptRow = attempt as unknown as {
        id: string;
        started_at: string;
        expires_at: string;
      };
    }
  }

  // 4. Fetch questions and saved answer state (if resumed attempt)
  const [questions, initialAnswers] = await Promise.all([
    getSafeQuestionsFromSupabase(db, test.id),
    getSavedAttemptStateFromSupabase(db, attemptRow.id),
  ]);

  return {
    attemptId: attemptRow.id,
    testId: test.id,
    testName: test.name,
    startedAt: attemptRow.started_at,
    expiresAt: attemptRow.expires_at,
    guestSessionId: attemptRow.guest_session_id ?? null,
    questions,
    initialAnswers: initialAnswers.answers,
    initialMarkedForReview: initialAnswers.markedForReview,
    mode: "supabase" as const,
  };
}

export type StartedAttempt = Awaited<ReturnType<typeof startAttempt>>;

async function getSafeQuestionsFromSupabase(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  testId: string,
): Promise<SafeQuestionPayload[]> {
  const { data, error } = await supabase
    .from("test_questions")
    .select(
      `
      question_id,
      order_index,
      marks,
      negative_marks,
      questions (
        id,
        question_text,
        question_type,
        default_marks,
        default_negative_marks,
        question_options (
          id,
          option_text,
          order_index
        )
      )
    `,
    )
    .eq("test_id", testId)
    .order("order_index", { ascending: true });

  if (error || !data) {
    throw new Error("Unable to load test questions.");
  }

  return data.map((row) => {
    const question = Array.isArray(row.questions)
      ? row.questions[0]
      : row.questions;

    if (!question) {
      throw new Error(`Missing question ${row.question_id}`);
    }

    const options = Array.isArray(question.question_options)
      ? question.question_options
      : [];

    return {
      id: question.id,
      questionText: question.question_text,
      questionType: question.question_type,
      marks: row.marks ?? question.default_marks,
      negativeMarks: row.negative_marks ?? question.default_negative_marks,
      options: options
        .sort((a, b) => a.order_index - b.order_index)
        .map((option) => ({
          id: option.id,
          optionText: option.option_text,
          orderIndex: option.order_index,
        })),
    };
  });
}

async function getSavedAttemptStateFromSupabase(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  attemptId: string,
) {
  const { data, error } = await supabase
    .from("user_answers")
    .select("question_id, selected_option_id, is_marked_for_review")
    .eq("attempt_id", attemptId);

  if (error || !data) {
    throw new Error("Unable to load saved answers.");
  }

  return {
    answers: Object.fromEntries(
      data
        .filter((answer) => answer.selected_option_id)
        .map((answer) => [answer.question_id, answer.selected_option_id as string]),
    ),
    markedForReview: Object.fromEntries(
      data
        .filter((answer) => answer.is_marked_for_review)
        .map((answer) => [answer.question_id, true]),
    ),
  };
}
