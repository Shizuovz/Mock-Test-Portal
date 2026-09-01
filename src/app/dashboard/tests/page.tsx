import Link from "next/link";
import { getAvailableTests } from "@/lib/dashboard/available-tests";

export const dynamic = "force-dynamic";

type DashboardTestsPageProps = {
  searchParams: Promise<{
    exam?: string;
    status?: "all" | "completed" | "uncompleted";
    q?: string;
  }>;
};

export default async function DashboardTestsPage({ searchParams }: DashboardTestsPageProps) {
  const params = await searchParams;
  const { tests, exams } = await getAvailableTests({
    examSlug: params.exam,
    status: params.status,
    search: params.q,
  });

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-6xl">
        {/* Navigation & Header */}
        <div className="border-b border-[#d9dee7] pb-5">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="font-semibold text-[#146b5f] hover:underline">
              Dashboard
            </Link>
            <span className="text-[#98a2b3]">/</span>
            <span className="text-[#667085]">Available Tests</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold">Available mock tests</h1>
          <p className="mt-2 max-w-2xl text-[#475467]">
            Select an exam-aligned test, review duration and instructions, and test your readiness under strict timed conditions.
          </p>
        </div>

        {/* Filter bar */}
        <form method="GET" className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-[#d9dee7] bg-white p-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="q" className="sr-only">
              Search tests
            </label>
            <input
              type="search"
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search by test name, exam, topic..."
              className="w-full rounded-md border border-[#ccd8d4] px-3 py-2 text-sm focus:border-[#146b5f] focus:outline-none"
            />
          </div>

          <div className="min-w-[160px]">
            <label htmlFor="exam" className="sr-only">
              Filter by Exam
            </label>
            <select
              id="exam"
              name="exam"
              defaultValue={params.exam ?? "all"}
              className="w-full rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-sm focus:border-[#146b5f] focus:outline-none"
            >
              <option value="all">All Exams</option>
              {exams.map((exam) => (
                <option key={exam.slug} value={exam.slug}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label htmlFor="status" className="sr-only">
              Filter by status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={params.status ?? "all"}
              className="w-full rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-sm focus:border-[#146b5f] focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="uncompleted">Not attempted</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f544a]"
          >
            Apply Filters
          </button>

          {(params.q || params.exam || params.status) && (
            <Link
              href="/dashboard/tests"
              className="rounded-md border border-[#ccd8d4] px-3 py-2 text-sm text-[#475467] hover:bg-[#f4f6f5]"
            >
              Reset
            </Link>
          )}
        </form>

        {/* Tests Grid */}
        <div className="mt-8">
          {tests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <article
                  key={test.id}
                  className="flex flex-col justify-between rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#f4f6f5] px-2 py-0.5 text-xs font-medium text-[#146b5f]">
                        {test.examName}
                      </span>
                      {test.maxAttempts !== null && (
                        <span className="inline-flex items-center rounded-full bg-[#f0ede6] px-2 py-0.5 text-xs font-medium text-[#765a22]">
                          {test.maxAttempts === 1 ? "1 Attempt Only" : `Max ${test.maxAttempts} Attempts`}
                        </span>
                      )}
                      {test.isAttemptLimitReached && (
                        <span className="inline-flex items-center rounded-full bg-[#fef3f2] px-2 py-0.5 text-xs font-medium text-[#b42318]">
                          Limit Reached
                        </span>
                      )}
                      {test.attemptStatus === "in_progress" && (
                        <span className="inline-flex items-center rounded-full bg-[#fef3f2] px-2 py-0.5 text-xs font-medium text-[#b42318]">
                          ● In Progress
                        </span>
                      )}
                      {test.attemptStatus === "submitted" && !test.isAttemptLimitReached && (
                        <span className="inline-flex items-center rounded-full bg-[#ecfdf3] px-2 py-0.5 text-xs font-medium text-[#027a48]">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-[#15171a]">{test.name}</h2>
                    {test.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-[#475467]">
                        {test.description}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#f0f2f5] pt-3 text-xs text-[#667085]">
                      <div>
                        <span>Duration: </span>
                        <strong className="text-[#15171a]">{test.durationMinutes} mins</strong>
                      </div>
                      <div>
                        <span>Questions: </span>
                        <strong className="text-[#15171a]">{test.questionCount}</strong>
                      </div>
                      <div>
                        <span>Total marks: </span>
                        <strong className="text-[#15171a]">{test.totalMarks ?? "--"}</strong>
                      </div>
                      <div>
                        <span>Passing: </span>
                        <strong className="text-[#15171a]">{test.passingMarks ?? "--"}</strong>
                      </div>
                    </div>

                    {test.highlightScorePercent !== null && (
                      <div className="mt-3 rounded bg-[#f7f8fa] p-2 text-xs text-[#475467]">
                        {test.highlightScoreLabel}: <strong className="text-[#146b5f]">{test.highlightScorePercent}%</strong> ({test.attemptsCount} attempt{test.attemptsCount > 1 ? "s" : ""})
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-[#f0f2f5] pt-4">
                    {test.attemptStatus === "in_progress" ? (
                      <Link
                        href={`/test/${test.id}`}
                        className="block w-full rounded-md bg-[#146b5f] py-2 text-center text-sm font-semibold text-white hover:bg-[#0f544a]"
                      >
                        Resume Attempt
                      </Link>
                    ) : test.isAttemptLimitReached ? (
                      <div className="flex gap-2">
                        <Link
                          href={`/test/${test.id}/result`}
                          className="flex-1 rounded-md border border-[#146b5f] py-2 text-center text-sm font-semibold text-[#146b5f] hover:bg-[#e6f3ef]"
                        >
                          Review Past Results (Limit Reached)
                        </Link>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Link
                          href={`/test/${test.id}/instructions`}
                          className="flex-1 rounded-md bg-[#146b5f] py-2 text-center text-sm font-semibold text-white hover:bg-[#0f544a]"
                        >
                          {test.attemptsCount > 0 ? "Retake Test" : "Start Test"}
                        </Link>
                        {test.attemptsCount > 0 && (
                          <Link
                            href={`/test/${test.id}/result`}
                            className="rounded-md border border-[#ccd8d4] px-3 py-2 text-center text-sm font-semibold text-[#475467] hover:bg-[#f4f6f5]"
                          >
                            Result
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#ccd8d4] bg-white p-12 text-center">
              <h3 className="text-base font-semibold text-[#15171a]">No tests match your criteria</h3>
              <p className="mt-1 text-sm text-[#475467]">
                Try adjusting your search terms or filters to discover tests.
              </p>
              <Link
                href="/dashboard/tests"
                className="mt-4 inline-block rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
