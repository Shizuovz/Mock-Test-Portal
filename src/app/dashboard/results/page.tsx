import Link from "next/link";
import type { AttemptHistoryItem } from "@/lib/dashboard/attempt-history";
import { getAttemptHistory } from "@/lib/dashboard/attempt-history";

export const dynamic = "force-dynamic";

export default async function DashboardResultsPage() {
  const { attempts, summary } = await getAttemptHistory();

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-6xl">
        <div className="border-b border-[#d9dee7] pb-5">
          <Link href="/dashboard" className="text-sm font-semibold text-[#146b5f]">
            Back to dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">Attempt results</h1>
          <p className="mt-3 max-w-2xl text-[#475467]">
            Every submitted or expired attempt is listed here with its stored
            server-calculated result.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Completed" value={String(summary.testsCompleted)} />
          <SummaryCard
            label="Average score"
            value={
              summary.averageScorePercent === null
                ? "--"
                : `${summary.averageScorePercent}%`
            }
          />
          <SummaryCard
            label="Questions attempted"
            value={String(summary.questionsAttempted)}
          />
          <SummaryCard
            label="Best score"
            value={
              summary.bestScorePercent === null ? "--" : `${summary.bestScorePercent}%`
            }
          />
        </div>

        <div className="mt-8 grid gap-3">
          {attempts.length > 0 ? (
            attempts.map((attempt) => (
              <AttemptResultRow key={attempt.id} attempt={attempt} />
            ))
          ) : (
            <div className="border border-[#d9dee7] bg-white p-5">
              <p className="text-sm text-[#475467]">
                No completed attempts yet. Start a published mock test from the exam
                catalog.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#d9dee7] bg-white p-5">
      <p className="text-sm text-[#667085]">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function AttemptResultRow({ attempt }: { attempt: AttemptHistoryItem }) {
  const percentage =
    attempt.maxScore > 0 ? Math.round((attempt.score / attempt.maxScore) * 100) : 0;

  return (
    <article className="grid gap-4 border border-[#d9dee7] bg-white p-5 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
          {attempt.status}
        </p>
        <h2 className="mt-2 text-xl font-semibold">{attempt.testName}</h2>
        <p className="mt-2 text-sm text-[#667085]">
          {attempt.submittedAt ? formatDate(attempt.submittedAt) : "Not submitted"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="border border-[#d9dee7] px-3 py-2">
            Correct: {attempt.correctCount}
          </span>
          <span className="border border-[#d9dee7] px-3 py-2">
            Wrong: {attempt.wrongCount}
          </span>
          <span className="border border-[#d9dee7] px-3 py-2">
            Unanswered: {attempt.unansweredCount}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-start justify-center gap-3 lg:items-end">
        <p className="text-2xl font-semibold">
          {attempt.score}/{attempt.maxScore}
        </p>
        <p className="text-sm font-medium text-[#475467]">{percentage}%</p>
        <Link
          href={`/test/${attempt.testId}/result?attemptId=${attempt.id}`}
          className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
        >
          Review answers
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
