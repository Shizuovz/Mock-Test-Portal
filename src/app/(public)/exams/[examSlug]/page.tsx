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
    <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
      {/* Google Search Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-6xl">
        <div className="border-b border-[#ccd8d4] pb-6">
          <Link href="/exams" className="text-sm font-semibold text-[#146b5f]">
            Back to exams
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">{exam.name}</h1>
          <p className="mt-4 max-w-2xl text-[#475467]">{exam.description}</p>
        </div>

        <div className="mt-8 grid gap-4">
          {exam.tests.map((test) => (
            <article
              key={test.id}
              className="grid gap-5 border border-[#ccd8d4] bg-[#fbfcfb] p-5 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
                  Published mock test
                </p>
                <h2 className="mt-3 text-2xl font-semibold">{test.name}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#475467]">
                  {test.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  <span className="border border-[#ccd8d4] bg-white px-3 py-2">
                    {test.questionCount} questions
                  </span>
                  <span className="border border-[#ccd8d4] bg-white px-3 py-2">
                    {test.durationMinutes} minutes
                  </span>
                  <span className="border border-[#ccd8d4] bg-white px-3 py-2">
                    {test.totalMarks} marks
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href={`/test/${test.id}/instructions`}
                  className="inline-flex rounded-md bg-[#146b5f] px-5 py-3 text-sm font-semibold text-white"
                >
                  Start test
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
