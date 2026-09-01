import { notFound } from "next/navigation";
import Link from "next/link";
import { ActiveTestShell } from "@/components/test/active-test-shell";
import {
  AttemptAuthError,
  AttemptLimitReachedError,
  AttemptNotFoundError,
  startAttempt,
} from "@/lib/test-engine/start-attempt";
import { getRemainingSeconds } from "@/lib/test-engine/timer";

type ActiveTestPageProps = {
  params: Promise<{
    testId: string;
  }>;
};

export default async function ActiveTestPage({ params }: ActiveTestPageProps) {
  const { testId } = await params;
  let attempt;

  try {
    attempt = await startAttempt({ testId });
  } catch (error) {
    if (error instanceof AttemptNotFoundError) {
      notFound();
    }

    if (error instanceof AttemptLimitReachedError) {
      return (
        <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
          <section className="mx-auto max-w-3xl border border-[#ccd8d4] bg-[#fbfcfb] p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#a3412f]">
              Attempt limit reached
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Maximum attempts completed</h1>
            <p className="mt-4 text-[#475467]">
              This examination allows a maximum of {error.maxAttempts} attempt
              {error.maxAttempts === 1 ? "" : "s"}. You have already completed all
              allocated attempts for this test.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/test/${testId}/result`}
                className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f544a]"
              >
                Review past results
              </Link>
              <Link
                href="/dashboard/tests"
                className="rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#34403c] hover:bg-[#f4f6f5]"
              >
                Browse other tests
              </Link>
            </div>
          </section>
        </main>
      );
    }

    if (error instanceof AttemptAuthError) {
      return (
        <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
          <section className="mx-auto max-w-3xl border border-[#ccd8d4] bg-[#fbfcfb] p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
              Sign in required
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Log in to start this test</h1>
            <p className="mt-4 text-[#475467]">
              Attempts are tied to your account so answers, timing, and results can
              be saved securely.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
            >
              Go to login
            </Link>
          </section>
        </main>
      );
    }

    throw error;
  }

  return (
    <ActiveTestShell
      attemptId={attempt.attemptId}
      testId={attempt.testId}
      testName={attempt.testName}
      startedAt={attempt.startedAt}
      expiresAt={attempt.expiresAt}
      initialRemainingSeconds={getRemainingSeconds(new Date(attempt.expiresAt))}
      questions={attempt.questions}
      initialAnswers={attempt.initialAnswers}
      initialMarkedForReview={attempt.initialMarkedForReview}
    />
  );
}
