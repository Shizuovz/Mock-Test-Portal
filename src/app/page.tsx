import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedExamCatalog } from "@/lib/content/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mock Test Portal — NSSB, SSC & NPSC Exam Preparation Platform",
  description:
    "Prepare for NSSB (Nagaland Staff Selection Board), SSC, and NPSC competitive examinations with authentic timed mock tests, exact negative marking, KaTeX math clarity, and comprehensive performance analytics.",
  openGraph: {
    title: "Mock Test Portal — Master NSSB, SSC & NPSC Examinations",
    description:
      "Practice timed mock tests with authentic proctoring, detailed solution keys, and weak topic diagnostic analytics tailored for NSSB, SSC, and NPSC aspirants.",
    type: "website",
  },
};

const examHighlights = [
  {
    badge: "NSSB",
    title: "Nagaland Staff Selection Board",
    description:
      "Full-length mocks and sectionals for NSSB Combined Graduate Level (CGL), Higher Secondary Level (CHSL), and Junior Division posts with authentic syllabus weightage.",
    icon: "🏛️",
  },
  {
    badge: "NPSC",
    title: "Nagaland Public Service Commission",
    description:
      "Comprehensive test series for NPSC Civil Services (NCS, NPS, NSS & Allied), Combined Technical Services, and Departmental Examinations with Nagaland General Studies.",
    icon: "📜",
  },
  {
    badge: "SSC",
    title: "Staff Selection Commission",
    description:
      "Targeted CBT mocks for SSC CGL Tier-I & Tier-II, SSC CHSL, GD Constable, and MTS with real-time negative marking simulation and instant percentile ranking.",
    icon: "🎯",
  },
];

const cbtFeatures = [
  {
    icon: "⏱️",
    title: "Authentic CBT Exam Interface",
    description:
      "Experience the realistic Computer-Based Test environment modeled after national examination terminals with exact countdown timer pressure.",
  },
  {
    icon: "🎯",
    title: "Exam-Accurate Negative Marking",
    description:
      "Strict server-side scoring enforces exact negative mark deductions (+2.0 / -0.5 or +1 / -0.25) to mirror actual exam cutoffs.",
  },
  {
    icon: "⚡",
    title: "Pacing Diagnostics & Time Traps",
    description:
      "Visual question-by-question time analytics detect time traps and quick wins, empowering smart time allocation strategies.",
  },
  {
    icon: "📐",
    title: "KaTeX Math & Formula Precision",
    description:
      "Crystal-clear rendering of complex mathematical equations, fractions, matrices, and scientific notation for quantitative aptitude.",
  },
];

export default async function Home() {
  const exams = await getPublishedExamCatalog();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F46E5] text-lg font-bold text-white shadow-xs">
              🎯
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#0F172A]">
                MockTest<span className="text-[#4F46E5]">Portal</span>
              </span>
              <span className="ml-2 rounded-md bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
                NSSB &bull; SSC &bull; NPSC
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/exams"
              className="text-sm font-semibold text-[#64748B] transition hover:text-[#4F46E5]"
            >
              Browse exams
            </Link>
            <Link
              href="/dashboard/tests"
              className="text-sm font-semibold text-[#64748B] transition hover:text-[#4F46E5]"
            >
              Test Library
            </Link>
            <Link
              href="/dashboard/performance"
              className="text-sm font-semibold text-[#64748B] transition hover:text-[#4F46E5]"
            >
              Performance Analytics
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#64748B] transition hover:text-[#0F172A]"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#4338CA]"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs font-semibold text-[#4F46E5] shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#4F46E5] animate-ping" />
            Dedicated Examination Portal for NSSB, SSC & NPSC Aspirants
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
            Ace NSSB, SSC & NPSC with{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] bg-clip-text text-transparent">
              Realistic Mock Tests
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[#64748B] sm:text-lg">
            Practice with authentic Computer-Based Test (CBT) simulations aligned with the latest syllabus
            of <strong>Nagaland Staff Selection Board (NSSB)</strong>, <strong>Staff Selection Commission (SSC)</strong>,
            and <strong>Nagaland Public Service Commission (NPSC)</strong>. Master time pressure, negative marking, and state GK.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#4338CA] hover:shadow-lg"
            >
              Explore Exam Catalog
              <span>➔</span>
            </Link>
            <Link
              href="/dashboard/tests"
              className="inline-flex items-center rounded-xl border border-[#E2E8F0] bg-white px-6 py-3.5 text-base font-semibold text-[#0F172A] shadow-xs transition hover:border-[#4F46E5] hover:bg-[#EEF2FF]/30"
            >
              Available Mock Tests
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center rounded-xl border border-transparent px-4 py-3.5 text-sm font-semibold text-[#64748B] transition hover:text-[#0F172A]"
            >
              Admin Portal
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 gap-4 border-t border-[#E2E8F0] pt-8 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-[#4F46E5]">NSSB & NPSC</p>
              <p className="text-xs font-medium text-[#64748B]">State Exam Aligned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#4F46E5]">SSC CGL/CHSL</p>
              <p className="text-xs font-medium text-[#64748B]">National Tier Simulations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#16A34A]">&plusmn; Exact</p>
              <p className="text-xs font-medium text-[#64748B]">Negative Marking Logic</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#4F46E5]">KaTeX</p>
              <p className="text-xs font-medium text-[#64748B]">Formula & Math Clarity</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Target Exam Series */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
            Target Examination Series
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
            Built Specifically for State & National Aspirants
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            From General Studies and Nagaland State GK to Quantitative Aptitude and English Comprehension, practice with test series modeled on actual examination patterns.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {examHighlights.map((track) => (
            <div
              key={track.badge}
              className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition hover:border-[#4F46E5] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-[#EEF2FF] px-2.5 py-1 text-xs font-bold text-[#4F46E5]">
                    {track.badge}
                  </span>
                  <span className="text-2xl">{track.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#0F172A]">{track.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">{track.description}</p>
              </div>

              <div className="mt-6 border-t border-[#F1F5F9] pt-4">
                <Link
                  href="/exams"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
                >
                  Explore {track.badge} Test Series ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Active Catalog Quick View */}
      {exams.length > 0 && (
        <section className="border-t border-[#E2E8F0] bg-white px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                  Active Exam Directory
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
                  Published Mock Test Tracks
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Select an examination track to begin high-yield full mocks and chapter-wise tests.
                </p>
              </div>
              <Link
                href="/exams"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:underline"
              >
                Explore all examinations ➔
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {exams.slice(0, 6).map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-[#4F46E5] hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[#EEF2FF] px-2.5 py-1 text-xs font-bold text-[#4F46E5]">
                        {exam.testCount} {exam.testCount === 1 ? "Test" : "Tests"}
                      </span>
                      <span className="text-xs font-medium text-[#64748B]">
                        📚 {exam.questionCount} Questions
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                      {exam.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                      {exam.description ?? "Complete syllabus mock tests with authentic timer and negative marking."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#E2E8F0] pt-4 text-xs font-semibold text-[#4F46E5]">
                    <span>Start Practice Set</span>
                    <span className="group-hover:translate-x-1 transition-transform">➔</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Platform Advantages */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Examination Engineering
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Engineered for Competitive Advantage
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#64748B]">
              Built with zero client answer leaks, tamper-proof server scoring, and proctored time tracking.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cbtFeatures.map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition hover:border-[#4F46E5]"
              >
                <div className="text-3xl">{feat.icon}</div>
                <h3 className="mt-4 text-base font-bold text-[#0F172A]">{feat.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#64748B]">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="border-t border-[#E2E8F0] bg-gradient-to-r from-[#4F46E5] to-[#4338CA] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to test your exam readiness?</h2>
            <p className="mt-1 text-sm text-indigo-100">
              Start an authentic timed NSSB, SSC, or NPSC test series today and identify your weak topics before exam day.
            </p>
          </div>
          <Link
            href="/dashboard/tests"
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#4F46E5] shadow-md transition hover:bg-[#EEF2FF]"
          >
            Launch Mock Test ➔
          </Link>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white px-6 py-10 text-xs text-[#64748B]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A]">MockTestPortal</span>
            <span>&bull;</span>
            <span>NSSB &bull; SSC &bull; NPSC Examination System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/exams" className="hover:text-[#0F172A]">
              Exam Directory
            </Link>
            <Link href="/dashboard/tests" className="hover:text-[#0F172A]">
              Test Library
            </Link>
            <Link href="/dashboard" className="hover:text-[#0F172A]">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-[#0F172A]">
              Sign In
            </Link>
            <Link href="/admin" className="hover:text-[#0F172A]">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
