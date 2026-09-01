import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedExamCatalog } from "@/lib/content/catalog";

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
            Start with a published mock test. Catalog data is loaded from the
            Supabase content model when configured.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.slug}`}
              className="border border-[#ccd8d4] bg-[#fbfcfb] p-5 transition hover:border-[#146b5f]"
            >
              <p className="text-sm font-semibold text-[#146b5f]">
                {exam.testCount} published test{exam.testCount === 1 ? "" : "s"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{exam.name}</h2>
              <p className="mt-3 text-sm leading-6 text-[#475467]">
                {exam.description}
              </p>
              <p className="mt-5 text-sm font-medium">
                {exam.questionCount} question{exam.questionCount === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
