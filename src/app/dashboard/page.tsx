import Link from "next/link";
import { logout } from "@/lib/actions/auth-actions";
import type { AttemptHistoryItem } from "@/lib/dashboard/attempt-history";
import { getAttemptHistory } from "@/lib/dashboard/attempt-history";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { attempts, summary } = await getAttemptHistory(5);
  const stats = [
    { label: "Tests completed", value: String(summary.testsCompleted) },
    {
      label: "Average score",
      value:
        summary.averageScorePercent === null
          ? "--"
          : `${summary.averageScorePercent}%`,
    },
    { label: "Questions attempted", value: String(summary.questionsAttempted) },
    {
      label: "Best score",
      value:
        summary.bestScorePercent === null ? "--" : `${summary.bestScorePercent}%`,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-6xl">
        <div className="border-b border-[#d9dee7] pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
            Student Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Preparation overview</h1>
          <p className="mt-3 max-w-2xl text-[#475467]">
            {user
              ? `Signed in as ${user.email}. Your completed attempts are summarized below.`
              : "Sign in to start tests and save attempts to Supabase."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/tests"
              className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f544a]"
            >
              Take a test
            </Link>
            <Link
              href="/dashboard/performance"
              className="rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#15171a] hover:bg-[#f4f6f5]"
            >
              Weak topics & performance
            </Link>
            <Link
              href="/dashboard/bookmarks"
              className="rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#15171a] hover:bg-[#f4f6f5]"
            >
              Saved bookmarks
            </Link>
            <Link
              href="/exams"
              className="rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#15171a] hover:bg-[#f4f6f5]"
            >
              Browse exams
            </Link>
            {user ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md border border-[#ccd8d4] px-4 py-2 text-sm font-semibold text-[#475467] hover:bg-[#f4f6f5]"
                >
                  Log out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-md border border-[#ccd8d4] px-4 py-2 text-sm font-semibold"
              >
                Log in
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-[#d9dee7] bg-white p-5">
              <p className="text-sm text-[#667085]">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <div className="flex flex-col gap-3 border-b border-[#d9dee7] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent attempts</h2>
              <p className="mt-2 text-sm text-[#475467]">
                Review submitted and expired attempts from your account.
              </p>
            </div>
            <Link
              href="/dashboard/results"
              className="text-sm font-semibold text-[#146b5f]"
            >
              View all results
            </Link>
          </div>
          <div className="mt-4">
            {attempts.length > 0 ? (
              <div className="grid gap-3">
                {attempts.map((attempt) => (
                  <AttemptRow key={attempt.id} attempt={attempt} />
                ))}
              </div>
            ) : (
              <div className="border border-[#d9dee7] bg-white p-5">
                <p className="text-sm text-[#475467]">
                  No completed attempts yet. Take the seeded mock test to see results
                  here.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function AttemptRow({ attempt }: { attempt: AttemptHistoryItem }) {
  const percentage =
    attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;

  return (
    <article className="grid gap-4 border border-[#d9dee7] bg-white p-4 md:grid-cols-[1fr_auto]">
      <div>
        <p className="text-sm font-semibold text-[#146b5f]">{attempt.testName}</p>
        <p className="mt-2 text-sm text-[#667085]">
          {attempt.submittedAt ? formatDate(attempt.submittedAt) : "Not submitted"}
          {" | "}
          {attempt.status}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">
          {attempt.score}/{attempt.maxScore} ({percentage}%)
        </span>
        <Link
          href={`/test/${attempt.testId}/result?attemptId=${attempt.id}`}
          className="rounded-md border border-[#ccd8d4] px-3 py-2 text-sm font-semibold"
        >
          Review
        </Link>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
