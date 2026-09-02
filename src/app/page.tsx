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
    <div className="min-h-screen bg-white text-[#0F172A]">
      {/* 1. Global Navigation Bar (Matching Reference Clean Design) */}
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-sm font-bold text-white shadow-xs">
                🎯
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                MockTest<span className="text-[#4F46E5]">Portal</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-6 lg:flex text-sm font-medium text-[#64748B]">
              <Link href="/exams" className="transition hover:text-[#0F172A]">
                Exams ▾
              </Link>
              <Link
                href="/exams"
                className="text-[#4F46E5] font-semibold border-b-2 border-[#4F46E5] pb-0.5"
              >
                Test Series
              </Link>
              <Link href="/exams" className="transition hover:text-[#0F172A]">
                Browse exams
              </Link>
              <Link href="/dashboard/tests" className="transition hover:text-[#0F172A]">
                Test Library
              </Link>
              <Link href="/dashboard/performance" className="transition hover:text-[#0F172A]">
                Performance
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Header Search Input */}
            <form action="/exams" method="GET" className="relative hidden md:block w-52 lg:w-64">
              <input
                type="text"
                name="q"
                placeholder="Search"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-3 pr-8 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#4F46E5] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#94A3B8] hover:text-[#4F46E5]"
                aria-label="Search"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <Link
              href="/login"
              className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition"
            >
              Sign In
            </Link>
            {/* <Link
              href="/dashboard"
              className="rounded-lg bg-[#16A34A] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#15803D]"
            >
              Get Started
            </Link> */}
          </div>
        </div>
      </header>

      {/* 2. Minimal Hero Section with User's Banner Background */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-[#EEF4FE] min-h-[460px] lg:min-h-[520px] flex items-center">
        {/* Full Image Hero Background */}
        <div
          className="absolute inset-0 bg-cover bg-center lg:bg-right bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/images/hero/hero.png')" }}
        />
        {/* Subtle left gradient overlay for crisp readability across viewports */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#EEF4FE] via-[#EEF4FE]/90 to-transparent lg:via-[#EEF4FE]/70 lg:w-[55%] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:py-16 w-full">
          <div className="max-w-md lg:max-w-lg">
            <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl leading-tight">
              Nagaland&apos;s Structured Online Test Series Platform
            </h1>

            <p className="mt-3 text-base text-[#64748B]">
              Practice timed mock tests for NSSB, SSC &amp; NPSC exams.
            </p>

            {/* Minimal Search Bar */}
            <form action="/exams" method="GET" className="relative mt-6 max-w-md">
              <input
                type="text"
                name="q"
                placeholder="Search for your Exam"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-4 pr-12 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-xs transition focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#94A3B8] hover:text-[#4F46E5] transition"
                aria-label="Search Exam"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Floating WhatsApp Quick Support Bubble */}
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          title="Student Support & Exam Queries"
          className="absolute bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
        >
          <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
          </svg>
        </a>
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
        <section className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-16">
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
                  className="group flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-[#4F46E5] hover:shadow-md"
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
      <section className="border-t border-[#E2E8F0] bg-white px-6 py-16">
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
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-xs transition hover:border-[#4F46E5]"
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
