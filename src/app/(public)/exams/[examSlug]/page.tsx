import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogExamBySlug } from "@/lib/content/catalog";

export const dynamic = "force-dynamic";

type ExamDetailPageProps = {
  params: Promise<{
    examSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ExamDetailPageProps): Promise<Metadata> {
  const { examSlug } = await params;
  const exam = await getCatalogExamBySlug(examSlug);

  if (!exam) {
    return {
      title: "Exam Not Found",
    };
  }

  const title = `${exam.name} Mock Tests & Practice Series`;
  const description =
    exam.description ??
    `Practice full-length online mock tests for ${exam.name}. Real-time timing, negative marking, and detailed solutions.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { examSlug } = await params;
  const exam = await getCatalogExamBySlug(examSlug);

  if (!exam) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${exam.name} Mock Test Series`,
    description: exam.description ?? `Full length mock tests for ${exam.name}`,
    provider: {
      "@type": "Organization",
      name: "Mock Test Portal",
    },
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-8 text-[#0F172A]">
      {/* Google Search Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-6xl">
        <div className="border-b border-[#E2E8F0] pb-6">
          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4F46E5] hover:underline"
          >
            ← Back to Exam Directory
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0F172A]">{exam.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">{exam.description}</p>
        </div>

        <div className="mt-8 grid gap-4">
          {exam.tests.map((test) => (
            <article
              key={test.id}
              className="grid gap-5 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition hover:border-[#4F46E5] md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                  Published CBT Mock Test
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#0F172A]">{test.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
                  {test.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 font-semibold text-[#0F172A]">
                    📚 {test.questionCount} Questions
                  </span>
                  <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 font-semibold text-[#0F172A]">
                    ⏱️ {test.durationMinutes} Minutes
                  </span>
                  <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 font-semibold text-[#0F172A]">
                    🎯 {test.totalMarks} Total Marks
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href={`/test/${test.id}/instructions`}
                  className="inline-flex items-center justify-center rounded-xl bg-[#4F46E5] px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#4338CA]"
                >
                  Start Test ➔
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
