import { notFound } from "next/navigation";
import Link from "next/link";
import { ActiveTestShell } from "@/components/test/active-test-shell";
import {
  AttemptAuthError,
  AttemptLimitReachedError,
  AttemptNotFoundError,
  AttemptPaymentRequiredError,
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
        <main className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 py-12 text-[#0F172A] flex items-center justify-center">
          <section className="w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm">
            <span className="inline-block rounded-md bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Attempt Limit Reached
            </span>
            <h1 className="headline-md mt-3 text-[#0F172A] font-bold">
              Maximum Attempts Completed
            </h1>
            <p className="body-md mt-3 text-[#64748B] leading-relaxed">
              This examination allows a maximum of {error.maxAttempts} attempt
              {error.maxAttempts === 1 ? "" : "s"}. You have completed all
              allocated attempts for this test.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/test/${testId}/result`}
                className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition"
              >
                Review Past Results →
              </Link>
              <Link
                href="/exams"
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-semibold text-[#334155] shadow-2xs hover:bg-[#F8FAFC] transition"
              >
                Browse Other NSSB Tests
              </Link>
            </div>
          </section>
        </main>
      );
    }

    if (error instanceof AttemptAuthError) {
      return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 py-12 text-[#0F172A] flex items-center justify-center">
          <section className="w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
              🎁 Free Guest Test Completed
            </div>
            <h1 className="headline-md mt-3 text-[#0F172A] font-bold">
              Sign up to unlock 3 more free tests
            </h1>
            <p className="body-md mt-3 text-[#64748B] leading-relaxed">
              You have completed your 1 free guest mock test. Create a free account now to instantly unlock <strong>3 additional full-length NSSB mock tests</strong>, complete with detailed performance analytics and solution keys.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition"
              >
                Create Free Account (+3 Mocks) →
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-semibold text-[#334155] shadow-2xs hover:bg-[#F8FAFC] transition"
              >
                Log In
              </Link>
            </div>
          </section>
        </main>
      );
    }

    if (error instanceof AttemptPaymentRequiredError) {
      return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 py-12 text-[#0F172A] flex items-center justify-center">
          <section className="w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
              ⭐ All 3 Free Tests Completed
            </div>
            <h1 className="headline-md mt-3 text-[#0F172A] font-bold">
              Unlock Unlimited NSSB Tests for ₹499
            </h1>
            <p className="body-md mt-3 text-[#64748B] leading-relaxed">
              You have used all 3 free mock tests included with your account. Upgrade to our 1-Year Pro Pass for ₹499 to get unlimited attempts on all NSSB mock tests, full solutions, and diagnostic rankings.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition"
              >
                Unlock Pro Pass (₹499 / Year) →
              </Link>
              <Link
                href="/dashboard/tests"
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-semibold text-[#334155] shadow-2xs hover:bg-[#F8FAFC] transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </section>
        </main>
      );
    }

    throw error;
  }

  return (
    <ActiveTestShell
      attemptId={attempt.attemptId}
      guestSessionId={attempt.guestSessionId}
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
