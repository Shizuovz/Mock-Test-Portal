import type { Metadata } from "next";
import { getPublishedExamCatalog } from "@/lib/content/catalog";
import { ExamCatalogBrowser } from "@/components/catalog/exam-catalog-browser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Competitive Exams & Mock Test Series",
  description:
    "Browse full-length competitive mock tests for SSC, Banking, Railway, and State exams with realistic timer simulation, negative marking, and instant solutions.",
  openGraph: {
    title: "Exam Directory — Mock Test Portal",
    description:
      "Browse available mock tests, attempt practice sets, and track your performance curve.",
  },
};

export default async function ExamsPage() {
  const exams = await getPublishedExamCatalog();

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-6xl">
        <div className="border-b border-[#ccd8d4] pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
            Exam directory
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Choose an exam</h1>
          <p className="mt-4 max-w-2xl text-[#475467]">
            Start with a published mock test. Search by examination or filter by category to explore available test series.
          </p>
        </div>

        <ExamCatalogBrowser initialExams={exams} />
      </section>
    </main>
  );
}
