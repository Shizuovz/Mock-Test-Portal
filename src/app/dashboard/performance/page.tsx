import Link from "next/link";
import { getStudentPerformance } from "@/lib/dashboard/performance";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const perf = await getStudentPerformance();

  const metrics = [
    { label: "Overall accuracy", value: `${perf.overallAccuracyPercent}%` },
    { label: "Average score", value: `${perf.averageScorePercent}%` },
    { label: "Tests completed", value: String(perf.totalAttempts) },
    { label: "Practice time", value: `${perf.totalTimeMinutes} mins` },
  ];

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
            <span className="text-[#667085]">Performance Analytics</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold">Performance & weak areas</h1>
          <p className="mt-2 max-w-2xl text-[#475467]">
            Diagnose your strengths and areas needing improvement based on your actual test responses and topics.
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#15171a]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Weak Topics Warning Section */}
        <div className="mt-8">
          {perf.weakTopics.length > 0 ? (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fee4e2] text-xs font-bold text-[#d92d20]">
                  !
                </span>
                <h2 className="text-lg font-semibold text-[#b42318]">
                  Identified Weak Topics (&lt;60% accuracy)
                </h2>
              </div>
              <p className="mt-2 text-sm text-[#7a271a]">
                Prioritize these topics in your upcoming study sessions to maximize your exam score:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {perf.weakTopics.map((topic) => (
                  <div
                    key={topic.topicId}
                    className="rounded-md border border-[#fecdca] bg-white p-4"
                  >
                    <span className="text-xs font-medium uppercase tracking-wider text-[#667085]">
                      {topic.subjectName}
                    </span>
                    <h3 className="mt-1 font-semibold text-[#15171a]">{topic.topicName}</h3>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-[#d92d20]">
                        {topic.accuracyPercent}% Accuracy
                      </span>
                      <span className="text-xs text-[#667085]">
                        {topic.correctCount}/{topic.totalAttempted} correct
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-5">
              <p className="text-sm font-medium text-[#166534]">
                {perf.totalAttempts > 0
                  ? "Great job! None of your attempted topics currently fall into the weak zone (<60%)."
                  : "Complete mock tests to generate automated weak-topic recommendations."}
              </p>
            </div>
          )}
        </div>

        {/* Strong Topics */}
        {perf.strongTopics.length > 0 && (
          <div className="mt-8 rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#146b5f]">
              Strong Topics (≥75% accuracy)
            </h2>
            <p className="mt-1 text-sm text-[#475467]">
              You consistently demonstrate mastery in these areas:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {perf.strongTopics.map((topic) => (
                <span
                  key={topic.topicId}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf3] px-3.5 py-1 text-xs font-semibold text-[#027a48]"
                >
                  <span>✓ {topic.topicName}</span>
                  <span className="rounded-full bg-[#027a48] px-1.5 py-0.2 text-[10px] text-white">
                    {topic.accuracyPercent}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Topic Breakdown Table */}
        <div className="mt-8 rounded-lg border border-[#d9dee7] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#d9dee7] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#15171a]">All topic breakdowns</h2>
            <p className="mt-1 text-xs text-[#667085]">
              Aggregated across all submitted attempts
            </p>
          </div>
          {perf.allTopics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#eaecf0] bg-[#f9fafb] text-xs font-semibold text-[#475467]">
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Topic</th>
                    <th className="px-6 py-3">Questions</th>
                    <th className="px-6 py-3">Correct</th>
                    <th className="px-6 py-3">Accuracy</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaecf0]">
                  {perf.allTopics.map((t) => (
                    <tr key={t.topicId} className="hover:bg-[#f8f9fa]">
                      <td className="px-6 py-4 font-medium text-[#15171a]">{t.subjectName}</td>
                      <td className="px-6 py-4 text-[#344054]">{t.topicName}</td>
                      <td className="px-6 py-4 text-[#475467]">{t.totalAttempted}</td>
                      <td className="px-6 py-4 text-[#475467]">{t.correctCount}</td>
                      <td className="px-6 py-4 font-semibold text-[#15171a]">
                        {t.accuracyPercent}%
                      </td>
                      <td className="px-6 py-4">
                        {t.status === "weak" ? (
                          <span className="rounded-full bg-[#fef3f2] px-2.5 py-0.5 text-xs font-semibold text-[#b42318]">
                            Needs Practice
                          </span>
                        ) : t.status === "strong" ? (
                          <span className="rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-xs font-semibold text-[#027a48]">
                            Strong
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#f2f4f7] px-2.5 py-0.5 text-xs font-semibold text-[#344054]">
                            Average
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-[#475467]">
              No topic attempts recorded yet. Take mock tests to see your breakdown.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
