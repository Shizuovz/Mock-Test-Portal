import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogTestById } from "@/lib/content/catalog";

export const dynamic = "force-dynamic";

type TestInstructionsPageProps = {
  params: Promise<{
    testId: string;
  }>;
};

export default async function TestInstructionsPage({
  params,
}: TestInstructionsPageProps) {
  const { testId } = await params;
  const test = await getCatalogTestById(testId);

  if (!test) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
        <div className="border border-[#ccd8d4] bg-[#fbfcfb] p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
            Test instructions
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{test.name}</h1>
          <p className="mt-4 max-w-2xl text-[#475467]">{test.description}</p>

          <div className="mt-8 space-y-4 text-sm leading-6 text-[#34403c]">
            <p>Answers are saved to your active attempt as you choose options.</p>
            <p>
              Official scoring is calculated server-side after submission.
            </p>
            <p>
              Correct answers and explanations are not included in the active
              test payload.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href={`/test/${test.id}`}
              className="rounded-md bg-[#146b5f] px-5 py-3 text-sm font-semibold text-white"
            >
              Start test
            </Link>
          </div>
        </div>

        <aside className="border border-[#ccd8d4] bg-[#fbfcfb] p-5">
          <h2 className="text-lg font-semibold">Test summary</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <SummaryRow label="Questions" value={String(test.questionCount)} />
            <SummaryRow label="Duration" value={`${test.durationMinutes} min`} />
            <SummaryRow label="Total marks" value={String(test.totalMarks)} />
            <SummaryRow label="Negative marking" value="Yes where configured" />
          </dl>
        </aside>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#dbe3e0] pb-3">
      <dt className="text-[#667085]">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
