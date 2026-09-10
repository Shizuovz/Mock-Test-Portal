import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogTestById } from "@/lib/content/catalog";
import { getPortalAccessStatus } from "@/lib/billing/billing-service";

export const dynamic = "force-dynamic";

type TestInstructionsPageProps = {
  params: Promise<{
    testId: string;
  }>;
};

export async function generateMetadata({
  params,
}: TestInstructionsPageProps): Promise<Metadata> {
  const { testId } = await params;
  const test = await getCatalogTestById(testId);

  if (!test) {
    return { title: "Test Instructions" };
  }

  return {
    title: `${test.name} — Test Instructions & Guidelines`,
    description: `Read examination instructions, duration, negative marking scheme, and rules before beginning ${test.name}.`,
  };
}

export default async function TestInstructionsPage({
  params,
}: TestInstructionsPageProps) {
  const { testId } = await params;
  const test = await getCatalogTestById(testId);

  if (!test) {
    notFound();
  }

  const access = await getPortalAccessStatus();

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 py-8 text-[#0F172A]">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            ← Back to NSSB Mock Catalog
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Instructions Card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-xs">
            {/* Top Eyebrow & Access Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F46E5]">
                NSSB Examination Instructions
              </span>

              {access.hasActiveSubscription ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                  ⭐ Pro Pass Active (Unlimited)
                </span>
              ) : !access.isGuest ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                  🎓 Free Account: {access.freeAttemptsRemaining} of 3 tests remaining
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
                  🎁 Guest Mode: 1 Free Test Available
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="mt-4">
              <h1 className="headline-lg text-[#0F172A] font-bold">
                {test.name}
              </h1>
              <p className="body-md mt-2 text-[#475569] leading-relaxed">
                {test.description ??
                  "Practice with authentic NSSB syllabus weightage, countdown timer pressure, and exact negative marking."}
              </p>
            </div>

            {/* Key Examination Guidelines */}
            <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">
                Important Guidelines:
              </h2>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#334155]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#2563EB] font-bold shrink-0">✓</span>
                  <span>
                    <strong>Auto-Save in Real-Time:</strong> Answers are securely recorded to your attempt immediately as you click options.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#2563EB] font-bold shrink-0">✓</span>
                  <span>
                    <strong>Negative Marking:</strong> Official exam negative mark deductions apply to wrong selections upon submission.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#2563EB] font-bold shrink-0">✓</span>
                  <span>
                    <strong>Timer Pressure:</strong> The countdown clock runs continuously once started. Unanswered questions receive 0 marks.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#2563EB] font-bold shrink-0">✓</span>
                  <span>
                    <strong>Detailed Solutions & Diagnostics:</strong> Complete explanations, correct keys, and topic pacing analytics appear right after finishing.
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons / Upgrade Prompts */}
            <div className="mt-8">
              {access.canStartAttempt ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Link
                    href={`/test/${test.id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-8 py-3.5 text-sm font-bold text-white shadow-xs transition duration-200 hover:bg-[#1D4ED8] hover:shadow-md cursor-pointer"
                  >
                    Start Test Now →
                  </Link>

                  {access.isGuest && (
                    <p className="text-xs text-[#64748B]">
                      Taking your 1 free mock test.{" "}
                      <Link
                        href="/register"
                        className="font-semibold text-[#2563EB] hover:underline"
                      >
                        Sign up free
                      </Link>{" "}
                      to unlock +3 more complete tests!
                    </p>
                  )}
                </div>
              ) : access.isGuest ? (
                /* Guest has already used their 1 free mock test */
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/40 p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <h3 className="text-sm font-bold text-amber-950">
                      Guest Free Mock Test Completed
                    </h3>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
                    You have finished your 1 free guest mock test. Create a free student account now to immediately unlock <strong>+3 additional complete NSSB mock tests</strong> with progress tracking and solutions!
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href="/register"
                      className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#1D4ED8]"
                    >
                      Create Free Account (+3 Mocks) →
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-semibold text-[#334155] shadow-2xs hover:bg-[#F8FAFC]"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                /* Registered user has used all 3 free tests */
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <h3 className="text-sm font-bold text-blue-950">
                      All 3 Free Mock Tests Completed
                    </h3>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-blue-900 leading-relaxed">
                    You have completed all 3 free mock tests included with your account. Upgrade to the <strong>1-Year Pro Pass for ₹499</strong> to unlock unlimited full-length exams, subject-wise sets, and detailed weak-topic analytics!
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href="/pricing"
                      className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#1D4ED8]"
                    >
                      Unlock Pro Pass for ₹499 →
                    </Link>
                    <Link
                      href="/dashboard/results"
                      className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-semibold text-[#334155] shadow-2xs hover:bg-[#F8FAFC]"
                    >
                      Review Past Test Results
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Specifications */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#475569] border-b border-[#F1F5F9] pb-3">
                Exam Summary
              </h2>

              <dl className="mt-4 divide-y divide-[#F1F5F9] text-xs sm:text-sm">
                <SummaryRow label="📝 Questions" value={`${test.questionCount} MCQs`} />
                <SummaryRow label="⏱️ Duration" value={`${test.durationMinutes} Minutes`} />
                <SummaryRow label="🎯 Total Marks" value={`${test.totalMarks} Marks`} />
                <SummaryRow label="⚖️ Negative Marks" value="Exam-Accurate" />
                <SummaryRow label="🏛️ Board" value="NSSB Nagaland" />
              </dl>
            </div>

            {/* Value Prompt Card */}
            <div className="rounded-2xl border border-[#D9E2FC] bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-5 shadow-2xs">
              <p className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                NSSB Preparation Pass
              </p>
              <h3 className="mt-1 text-sm font-bold text-[#0F172A]">
                Full Access for ₹499 / Year
              </h3>
              <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                Unlimited timed mocks, subject sectionals, formula sheets, and national percentiles.
              </p>
              <Link
                href="/pricing"
                className="mt-3 inline-block text-xs font-bold text-[#2563EB] hover:underline"
              >
                View Plans & Features →
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-[#64748B]">{label}</dt>
      <dd className="font-semibold text-[#0F172A]">{value}</dd>
    </div>
  );
}
