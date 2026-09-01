import {
  AdminCell,
  AdminPageFrame,
  AdminStatus,
  AdminTable,
} from "@/components/admin/admin-page-frame";
import { getAdminAccess, getAdminOverview } from "@/lib/admin/content-read-model";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const access = await getAdminAccess();
  const overview = access.canView ? await getAdminOverview() : null;

  return (
    <AdminPageFrame
      access={access}
      title="Admin dashboard"
      description="Admin overview for content, users, attempts, and platform activity."
    >
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {overview?.stats.map((stat) => (
          <div key={stat.label} className="border border-[#d9dee7] bg-white p-4">
            <p className="text-sm text-[#667085]">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Recent attempts</h2>
        <AdminTable headers={["Test", "User", "Status", "Score", "Submitted"]}>
          {overview?.recentAttempts.map((attempt) => (
            <tr key={attempt.id}>
              <AdminCell>{attempt.testName}</AdminCell>
              <AdminCell>
                <span className="font-mono text-xs">{attempt.userId}</span>
              </AdminCell>
              <AdminCell>
                <AdminStatus active={attempt.status === "submitted"} label={attempt.status} />
              </AdminCell>
              <AdminCell>
                {attempt.score === null || attempt.maxScore === null
                  ? "--"
                  : `${attempt.score}/${attempt.maxScore}`}
              </AdminCell>
              <AdminCell>
                {attempt.submittedAt ? formatDate(attempt.submittedAt) : "--"}
              </AdminCell>
            </tr>
          ))}
        </AdminTable>
      </section>
    </AdminPageFrame>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
