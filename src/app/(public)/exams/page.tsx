import type { Metadata } from "next";
import { getPublishedExamCatalog } from "@/lib/content/catalog";
import { ExamCatalogBrowser } from "@/components/catalog/exam-catalog-browser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NSSB, SSC & NPSC Examination Directory — Mock Test Series",
  description:
    "Browse full-length competitive mock tests for NSSB, SSC, and NPSC examinations with realistic timer simulation, negative marking, and detailed solutions.",
  openGraph: {
    title: "Exam Directory — NSSB, SSC & NPSC Mock Test Portal",
    description:
      "Browse available mock tests for NSSB, SSC, and NPSC, attempt practice sets, and track your performance curve.",
  },
};

export default async function ExamsPage() {
  const exams = await getPublishedExamCatalog();

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-8 text-[#0F172A]">
      <section className="mx-auto max-w-6xl">
        <div className="border-b border-[#E2E8F0] pb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
            Target Examination Directory
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A]">Choose an Exam: NSSB, SSC & NPSC Series</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748B]">
            Select an examination track to practice full-length mock tests and sectionals. Search by exam name or filter by category to begin test simulations with authentic time pressure and negative marking.
          </p>
        </div>

        <ExamCatalogBrowser initialExams={exams} />
      </section>
    </main>
  );
}
