import { AdminPageFrame } from "@/components/admin/admin-page-frame";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import { getAdminPlatformReport } from "@/lib/admin/admin-management";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const access = await getAdminAccess();
  const report = access.canView ? await getAdminPlatformReport() : {
    totalUsers: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    inProgressAttempts: 0,
    expiredAttempts: 0,
    averageScorePercent: 0,
    totalQuestions: 0,
    totalTests: 0,
    questionsByDifficulty: [],
    attemptsByTest: [],
  };

  const completionRate =
    report.totalAttempts > 0
      ? Math.round((report.completedAttempts / report.totalAttempts) * 100)
      : 0;

  const kpis = [
    { label: "Total Students", value: String(report.totalUsers) },
    { label: "Total Attempts", value: String(report.totalAttempts) },
    { label: "Completion Rate", value: `${completionRate}%` },
    { label: "Average Score", value: `${report.averageScorePercent}%` },
    { label: "Published Tests", value: String(report.totalTests) },
    { label: "Question Bank Size", value: String(report.totalQuestions) },
  ];

  return (
    <AdminPageFrame
      access={access}
      title="Platform Performance Reports"
      description="Holistic overview of system utilization, attempt completion dynamics, and question bank metrics."
    >
      {/* Top KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-[#667085]">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#15171a]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Attempt Status Breakdown */}
        <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#15171a]">Attempt Status Breakdown</h2>
          <p className="mt-1 text-xs text-[#667085]">
            Distribution of all recorded test attempts
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#027a48]">Submitted ({report.completedAttempts})</span>
                <span>{completionRate}%</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full rounded-full bg-[#f2f4f7] overflow-hidden">
                <div
                  className="h-full bg-[#027a48]"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#b42318]">In Progress ({report.inProgressAttempts})</span>
                <span>
                  {report.totalAttempts > 0
                    ? Math.round((report.inProgressAttempts / report.totalAttempts) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full rounded-full bg-[#f2f4f7] overflow-hidden">
                <div
                  className="h-full bg-[#b42318]"
                  style={{
                    width: `${
                      report.totalAttempts > 0
                        ? (report.inProgressAttempts / report.totalAttempts) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#475467]">Expired ({report.expiredAttempts})</span>
                <span>
                  {report.totalAttempts > 0
                    ? Math.round((report.expiredAttempts / report.totalAttempts) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full rounded-full bg-[#f2f4f7] overflow-hidden">
                <div
                  className="h-full bg-[#475467]"
                  style={{
                    width: `${
                      report.totalAttempts > 0
                        ? (report.expiredAttempts / report.totalAttempts) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Bank by Difficulty */}
        <div className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#15171a]">Questions by Difficulty</h2>
          <p className="mt-1 text-xs text-[#667085]">
            Distribution of questions available in the question bank
          </p>

          <div className="mt-6">
            {report.questionsByDifficulty.length > 0 ? (
              <div className="space-y-3">
                {report.questionsByDifficulty.map((d) => (
                  <div
                    key={d.difficulty}
                    className="flex items-center justify-between border-b border-[#f2f4f7] pb-2 text-sm"
                  >
                    <span className="capitalize font-medium text-[#344054]">{d.difficulty}</span>
                    <span className="font-semibold text-[#146b5f]">
                      {d.count} {d.count === 1 ? "question" : "questions"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#667085]">No questions loaded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Attempts by Mock Test */}
      <div className="mt-8 rounded-lg border border-[#d9dee7] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#d9dee7] px-6 py-4">
          <h2 className="text-base font-semibold text-[#15171a]">Attempts by Mock Test</h2>
          <p className="mt-1 text-xs text-[#667085]">Most popular tests taken by students</p>
        </div>

        {report.attemptsByTest.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#eaecf0] bg-[#f9fafb] font-semibold text-[#475467]">
                <tr>
                  <th className="px-6 py-3">Mock Test</th>
                  <th className="px-6 py-3">Total Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {report.attemptsByTest.map((t) => (
                  <tr key={t.testName} className="hover:bg-[#f8f9fa]">
                    <td className="px-6 py-4 font-medium text-[#15171a]">{t.testName}</td>
                    <td className="px-6 py-4 font-semibold text-[#146b5f]">{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#475467]">
            No test attempts recorded yet.
          </div>
        )}
      </div>
    </AdminPageFrame>
  );
}
