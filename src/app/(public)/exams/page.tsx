import type { Metadata } from "next";
import { getPublishedExamCatalog } from "@/lib/content/catalog";
import { ExamCatalogBrowser } from "@/components/catalog/exam-catalog-browser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NSSB Mock Test Series & Practice Exams — Nagaland Staff Selection Board",
  description:
    "Browse full-length competitive mock tests and subject-wise practice for Nagaland Staff Selection Board (NSSB) examinations with realistic timer simulation, exact negative marking, and detailed solutions.",
  openGraph: {
    title: "NSSB Mock Test Series — Nagaland Staff Selection Board",
    description:
      "Practice authentic timed NSSB mock tests with negative marking, KaTeX math clarity, and comprehensive solutions.",
  },
};

export default async function ExamsPage() {
  const exams = await getPublishedExamCatalog();

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 py-6 text-[#0F172A]">
      <section className="mx-auto max-w-6xl">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#4F46E5]">
              NAGALAND STAFF SELECTION BOARD
            </p>
            <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold text-[#0F172A]">
              NSSB Mock Test Series
            </h1>
          </div>
          <p className="text-xs text-[#64748B]">
            Authentic timed CBT mocks & sectionals with instant scoring.
          </p>
        </div>

        <ExamCatalogBrowser initialExams={exams} />
      </section>
    </main>
  );
}
