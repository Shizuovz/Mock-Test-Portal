import Link from "next/link";
import { AdminPageFrame } from "@/components/admin/admin-page-frame";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import { getAdminAttempts } from "@/lib/admin/admin-management";

export const dynamic = "force-dynamic";

type AdminAttemptsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function AdminAttemptsPage({ searchParams }: AdminAttemptsPageProps) {
  const { status } = await searchParams;
  const access = await getAdminAccess();
  const attempts = access.canView ? await getAdminAttempts(status) : [];

  return (
    <AdminPageFrame
      access={access}
      title="Test Attempts Monitor"
      description="Inspect active and submitted student test sessions, score distributions, and time spent."
    >
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#d9dee7] pb-4">
        {[
          { label: "All Attempts", val: "all" },
          { label: "Submitted", val: "submitted" },
          { label: "In Progress", val: "in_progress" },
          { label: "Expired", val: "expired" },
        ].map((tab) => {
          const isActive = (!status && tab.val === "all") || status === tab.val;
          return (
            <Link
              key={tab.val}
              href={`/admin/attempts?status=${tab.val}`}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                isActive
                  ? "bg-[#146b5f] text-white"
                  : "bg-white border border-[#ccd8d4] text-[#475467] hover:bg-[#f4f6f5]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Attempts Table */}
      <div className="mt-6 rounded-lg border border-[#d9dee7] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#d9dee7] px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#15171a]">
            Recorded Attempts ({attempts.length})
          </h2>
        </div>

        {attempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#eaecf0] bg-[#f9fafb] font-semibold text-[#475467]">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Test</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Correct / Wrong</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {attempts.map((att) => {
                  const scorePct =
                    att.maxScore && att.maxScore > 0 && att.score !== null
                      ? Math.round((att.score / att.maxScore) * 100)
                      : null;

                  return (
                    <tr key={att.id} className="hover:bg-[#f8f9fa]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#15171a]">{att.userFullName}</div>
                        {att.userEmail && (
                          <div className="text-[#667085]">{att.userEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#15171a]">
                        {att.testName}
                      </td>
                      <td className="px-6 py-4">
                        {att.status === "in_progress" && (
                          <span className="rounded-full bg-[#fef3f2] px-2.5 py-0.5 font-semibold text-[#b42318]">
                            In Progress
                          </span>
                        )}
                        {att.status === "submitted" && (
                          <span className="rounded-full bg-[#ecfdf3] px-2.5 py-0.5 font-semibold text-[#027a48]">
                            Submitted
                          </span>
                        )}
                        {att.status === "expired" && (
                          <span className="rounded-full bg-[#f2f4f7] px-2.5 py-0.5 font-semibold text-[#475467]">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {att.score !== null ? (
                          <div>
                            <span className="font-semibold text-[#15171a]">
                              {att.score} / {att.maxScore}
                            </span>
                            {scorePct !== null && (
                              <span className="ml-1.5 text-[#146b5f]">({scorePct}%)</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#98a2b3]">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#475467]">
                        <span className="text-[#027a48] font-medium">{att.correctCount}✓</span>
                        <span className="mx-1">/</span>
                        <span className="text-[#b42318] font-medium">{att.wrongCount}✗</span>
                        <span className="text-[#98a2b3] ml-1">({att.unansweredCount} unans)</span>
                      </td>
                      <td className="px-6 py-4 text-[#667085]">
                        {att.timeTakenSeconds
                          ? `${Math.round(att.timeTakenSeconds / 60)}m ${att.timeTakenSeconds % 60}s`
                          : "--"}
                      </td>
                      <td className="px-6 py-4 text-[#667085]">
                        {new Date(att.startedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {att.status !== "in_progress" && (
                          <Link
                            href={`/test/${att.testId}/result?attemptId=${att.id}`}
                            className="font-semibold text-[#146b5f] hover:underline"
                          >
                            Review result
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#475467]">
            No attempts matching this filter.
          </div>
        )}
      </div>
    </AdminPageFrame>
  );
}
