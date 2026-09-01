import Link from "next/link";
import { getAvailableTests } from "@/lib/dashboard/available-tests";
import { TestLibraryBrowser } from "@/components/dashboard/test-library-browser";

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
          <h1 className="mt-4 text-3xl font-semibold">Available Mock Tests</h1>
          <p className="mt-2 max-w-2xl text-[#475467]">
            Select an exam-aligned test, review duration and instructions, and test your readiness under strict timed conditions.
          </p>
        </div>

        {/* Interactive Filter Pills & Test Browser */}
        <TestLibraryBrowser
          initialTests={tests}
          exams={exams}
          initialSearch={params.q ?? ""}
          initialExam={params.exam ?? "all"}
          initialStatus={params.status ?? "all"}
        />
      </section>
    </main>
  );
}
