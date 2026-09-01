import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedExamCatalog } from "@/lib/content/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mock Test Portal — Real-time Competitive Exam Prep Platform",
  description:
    "Prepare for competitive examinations with realistic timed mock tests, instant server scoring, negative marking calculation, and comprehensive performance analytics.",
  openGraph: {
    title: "Mock Test Portal — Master Your Competitive Exams",
    description:
      "Practice timed mock tests with strict proctoring, detailed solution keys, and weak topic diagnostic analytics.",
    type: "website",
  },
};

const cbtFeatures = [
  {
    icon: "⏱️",
    title: "Realistic CBT Simulation",
    description:
      "Authentic Computer-Based Test environment modeled after national examination terminals (TCS iON / NTA) with exact timer pressure.",
  },
  {
    icon: "🎯",
    title: "Strict Negative Marking",
    description:
      "Server-side scoring engine applies exam-accurate negative mark deductions (+2.0 / -0.5) to mirror actual exam cutoffs.",
  },
  {
    icon: "⚡",
    title: "Pacing & Time Traps",
    description:
      "Visual question-by-question time analytics detect time traps and quick wins, empowering smart time allocation strategies.",
  },
  {
    icon: "📐",
    title: "KaTeX Math Clarity",
    description:
      "Crystal-clear rendering of complex mathematical equations, fractions, matrices, and scientific notation.",
  },
];

export default async function Home() {
  const exams = await getPublishedExamCatalog();

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#15171a]">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#d9dee7] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#146b5f] text-lg font-bold text-white shadow-sm">
              🎯
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#15171a]">
                MockTest<span className="text-[#146b5f]">Portal</span>
              </span>
              <span className="ml-2 rounded bg-[#eef5f3] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#146b5f]">
                CBT 2.0
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/exams"
              className="text-sm font-semibold text-[#475467] transition hover:text-[#146b5f]"
            >
              Browse exams
            </Link>
            <Link
              href="/dashboard/tests"
              className="text-sm font-semibold text-[#475467] transition hover:text-[#146b5f]"
            >
              Test Series
            </Link>
            <Link
              href="/dashboard/performance"
              className="text-sm font-semibold text-[#475467] transition hover:text-[#146b5f]"
            >
              Analytics
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#475467] transition hover:text-[#15171a]"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f544a]"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden border-b border-[#d9dee7] bg-gradient-to-b from-white via-[#fbfcfb] to-[#f4f6f5] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ccd8d4] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#146b5f] shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#146b5f] animate-ping" />
            National-Level Computer-Based Test Simulation Platform
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#15171a] sm:text-5xl lg:text-6xl">
            Master Competitive Exams with{" "}
            <span className="bg-gradient-to-r from-[#146b5f] to-[#0f766e] bg-clip-text text-transparent">
              Realistic Mock Tests
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#475467] sm:text-lg">
            Experience authentic examination conditions for SSC, Banking, Railways, and State exams.
            Practice with strict countdown timers, negative marking, instant solutions, and actionable pacing analytics.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 rounded-xl bg-[#146b5f] px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#0f544a] hover:shadow-lg"
            >
              Explore Exam Catalog
              <span>➔</span>
            </Link>
            <Link
              href="/dashboard/tests"
              className="inline-flex items-center rounded-xl border border-[#ccd8d4] bg-white px-6 py-3.5 text-base font-semibold text-[#34403c] shadow-xs transition hover:border-[#146b5f] hover:bg-[#fbfcfb]"
            >
              Available Mock Tests
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center rounded-xl border border-transparent px-4 py-3.5 text-sm font-semibold text-[#667085] transition hover:text-[#15171a]"
            >
              Admin Portal
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 gap-4 border-t border-[#e2e8f0] pt-8 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-[#146b5f]">100%</p>
              <p className="text-xs font-medium text-[#667085]">Authentic CBT Simulator</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#146b5f]">5-State</p>
              <p className="text-xs font-medium text-[#667085]">TCS iON Question Palette</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#146b5f]">&plusmn; Exact</p>
              <p className="text-xs font-medium text-[#667085]">Negative Mark Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#146b5f]">KaTeX</p>
              <p className="text-xs font-medium text-[#667085]">Math & Formula Clarity</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Examination Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#146b5f]">
              Exam Directory
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#15171a] sm:text-3xl">
              Target Your Dream Examination
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              Select your examination track to begin high-yield full mocks and chapter-wise tests.
            </p>
          </div>
          <Link
            href="/exams"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#146b5f] hover:underline"
          >
            Explore all examinations ➔
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.slice(0, 6).map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[#d9dee7] bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-[#146b5f] hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[#eef5f3] px-2.5 py-1 text-xs font-bold text-[#146b5f]">
                    {exam.testCount} {exam.testCount === 1 ? "Test" : "Tests"}
                  </span>
                  <span className="text-xs font-medium text-[#667085]">
                    📚 {exam.questionCount} Qs
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#15171a] group-hover:text-[#146b5f] transition-colors">
                  {exam.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-[#475467]">
                  {exam.description ?? "Complete syllabus mock tests with authentic timer and negative marking."}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#f0f2f5] pt-4 text-xs font-semibold text-[#146b5f]">
                <span>Start Practice Set</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Platform Architectural Advantages */}
      <section className="border-t border-[#d9dee7] bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[#146b5f]">
              High-Stakes Architecture
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#15171a] sm:text-3xl">
              Engineered for Competitive Advantage
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#667085]">
              Built with zero client answer leaks, tamper-proof server scoring, and proctored time tracking.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cbtFeatures.map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-[#e2e8f0] bg-[#fbfcfb] p-6 shadow-xs transition hover:border-[#146b5f]"
              >
                <div className="text-3xl">{feat.icon}</div>
                <h3 className="mt-4 text-base font-bold text-[#15171a]">{feat.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475467]">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Student Call to Action */}
      <section className="border-t border-[#d9dee7] bg-gradient-to-r from-[#146b5f] to-[#0f544a] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to test your readiness?</h2>
            <p className="mt-1 text-sm text-emerald-100">
              Start an authentic timed test series today and identify your weak topics before exam day.
            </p>
          </div>
          <Link
            href="/dashboard/tests"
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#146b5f] shadow-md transition hover:bg-[#eef5f3]"
          >
            Launch Mock Test ➔
          </Link>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-[#d9dee7] bg-[#f7f8fa] px-6 py-10 text-xs text-[#667085]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#15171a]">MockTestPortal</span>
            <span>&bull;</span>
            <span>Computer-Based Examination System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/exams" className="hover:text-[#15171a]">
              Exam Directory
            </Link>
            <Link href="/dashboard" className="hover:text-[#15171a]">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-[#15171a]">
              Student Login
            </Link>
            <Link href="/admin" className="hover:text-[#15171a]">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
