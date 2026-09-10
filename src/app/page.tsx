import type { Metadata } from "next";
import Link from "next/link";
import { getPortalAccessStatus } from "@/lib/billing/billing-service";
import { logout } from "@/lib/actions/auth-actions";

import { MainNav } from "@/components/layout/main-nav";
import { CountdownTimer } from "@/components/home/countdown-timer";
import { Subject3DIllustration } from "@/components/home/subject-3d-illustrations";
import { Purpose3DIllustration } from "@/components/home/purpose-3d-illustrations";
import { SubjectPrep3DIllustration } from "@/components/home/subject-prep-3d-illustrations";
import { FreeMockHeroCard } from "@/components/home/free-mock-hero-card";
import { InteractiveStepsSection } from "@/components/home/interactive-steps-section";
import { FinalCtaBanner } from "@/components/home/final-cta-banner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mock Test Portal — NSSB Exam Preparation Platform",
  description:
    "Prepare for NSSB (Nagaland Staff Selection Board) competitive examinations with authentic timed mock tests, exact negative marking, KaTeX math clarity, and comprehensive performance analytics.",
  openGraph: {
    title: "Mock Test Portal — Master NSSB Examinations",
    description:
      "Practice timed mock tests with authentic proctoring, detailed solution keys, and weak topic diagnostic analytics tailored for NSSB aspirants.",
    type: "website",
  },
};

const nssbGeneralPaperAreas = [
  {
    num: "01",
    type: "gk" as const,
    title: "General Knowledge",
    marks: "75 MARKS",
    weight: "37.5% Weight",
    description: "Indian history, culture, polity, geography, economy, science, current affairs, Naga history and culture.",
    cta: "Practice GK",
    href: "/exams" as const,
  },
  {
    num: "02",
    type: "computer" as const,
    title: "Computer Knowledge",
    marks: "40 MARKS",
    weight: "20% Weight",
    description: "Computer fundamentals, operating systems, Word, spreadsheets, PowerPoint, internet and communication.",
    cta: "Practice Computer",
    href: "/exams" as const,
  },
  {
    num: "03",
    type: "english" as const,
    title: "General English",
    marks: "30 MARKS",
    weight: "15% Weight",
    description: "Grammar, vocabulary, spelling, sentence structure, synonyms, antonyms, phrases and common usage.",
    cta: "Practice English",
    href: "/exams" as const,
  },
  {
    num: "04",
    type: "comprehension" as const,
    title: "English Comprehension",
    marks: "25 MARKS",
    weight: "12.5% Weight",
    description: "Reading passages, vocabulary, grammar, logical understanding and passage-based questions.",
    cta: "Practice Comprehension",
    href: "/exams" as const,
  },
  {
    num: "05",
    type: "arithmetic" as const,
    title: "Arithmetic & Reasoning",
    marks: "30 MARKS",
    weight: "15% Weight",
    description: "Numbers, percentages, averages, ratios, data interpretation, analogies and problem solving.",
    cta: "Practice Arithmetic",
    href: "/exams" as const,
  },
];

const nssbPurposeFeatures = [
  {
    type: "nssb_focused" as const,
    title: "NSSB-Focused",
    description: "No unnecessary exam categories. The platform is built around NSSB preparation.",
  },
  {
    type: "subject_tests" as const,
    title: "Subject-Wise Tests",
    description: "Choose exactly what you want to practise and strengthen one area at a time.",
  },
  {
    type: "timed_mocks" as const,
    title: "Timed Mock Tests",
    description: "Practise answering questions under exam-like time pressure.",
  },
  {
    type: "track_performance" as const,
    title: "Track Performance",
    description: "Measure scores, accuracy and subject performance as you practise.",
  },
];

const freeMockTests = [
  {
    title: "NSSB General Knowledge Mock Test — 01",
    meta: "50 Questions • Timed Practice • Instant Results",
    href: "/exams" as const,
  },
  {
    title: "NSSB Computer Awareness Mock Test — 01",
    meta: "40 Questions • Timed Practice • Instant Results",
    href: "/exams" as const,
  },
  {
    title: "NSSB English Mock Test — 01",
    meta: "30 Questions • Timed Practice • Instant Results",
    href: "/exams" as const,
  },
  {
    title: "NSSB Arithmetic & Reasoning Mock Test — 01",
    meta: "30 Questions • Timed Practice • Instant Results",
    href: "/exams" as const,
  },
];

const nssbSubjectPreparation = [
  {
    type: "gk_prep" as const,
    title: "NSSB General Knowledge",
    description: "Practise questions across the major General Knowledge areas relevant to NSSB preparation.",
    tags: [
      "Indian History",
      "Polity",
      "Geography",
      "Economy",
      "General Science",
      "Current Affairs",
      "Naga History",
      "Naga Culture",
    ],
    cta: "Explore GK Questions",
    href: "/exams" as const,
  },
  {
    type: "computer_prep" as const,
    title: "NSSB Computer Awareness",
    description: "Build your computer knowledge with focused practice covering core computer and internet concepts.",
    tags: [
      "Computer Fundamentals",
      "Operating Systems",
      "Word Processing",
      "Spreadsheets",
      "PowerPoint",
      "Internet",
      "WWW",
      "Communication",
    ],
    cta: "Explore Computer Questions",
    href: "/exams" as const,
  },
  {
    type: "english_prep" as const,
    title: "NSSB General English",
    description: "Improve accuracy with focused English practice for grammar, vocabulary and sentence usage.",
    tags: [
      "Grammar",
      "Vocabulary",
      "Spelling",
      "Synonyms",
      "Antonyms",
      "Idioms",
      "Sentence Structure",
    ],
    cta: "Explore English Questions",
    href: "/exams" as const,
  },
  {
    type: "arithmetic_prep" as const,
    title: "NSSB Arithmetic & Reasoning",
    description: "Practise calculation and reasoning concepts with exam-oriented questions.",
    tags: [
      "Number System",
      "Averages",
      "Percentages",
      "Ratio",
      "Data Interpretation",
      "Analogy",
      "Problem Solving",
    ],
    cta: "Explore Practice",
    href: "/exams" as const,
  },
];

const nssbSyllabusMarks = [
  {
    subject: "General Knowledge",
    marks: 75,
    weight: "37.5%",
    barWidth: "37.5%",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    barGradient: "from-blue-600 to-indigo-600",
    icon: "🌍",
  },
  {
    subject: "Basic Computer Knowledge",
    marks: 40,
    weight: "20.0%",
    barWidth: "20%",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    barGradient: "from-indigo-600 to-violet-600",
    icon: "💻",
  },
  {
    subject: "General English",
    marks: 30,
    weight: "15.0%",
    barWidth: "15%",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    barGradient: "from-sky-500 to-blue-600",
    icon: "📖",
  },
  {
    subject: "English Comprehension",
    marks: 25,
    weight: "12.5%",
    barWidth: "12.5%",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    barGradient: "from-teal-500 to-emerald-600",
    icon: "📝",
  },
  {
    subject: "Arithmetic, Intelligence & Reasoning",
    marks: 30,
    weight: "15.0%",
    barWidth: "15%",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    barGradient: "from-amber-500 to-orange-600",
    icon: "🧮",
  },
];

const practicePlanSteps = [
  {
    step: "1",
    title: "Take 1 Free Mock",
    description: "Start your first complete NSSB mock test instantly.",
  },
  {
    step: "2",
    title: "See Your Result",
    description: "Check your score and understand your performance.",
  },
  {
    step: "3",
    title: "Sign Up for +3",
    description: "Create an account and unlock three additional complete mocks for free.",
  },
  {
    step: "4",
    title: "Unlock Full Access",
    description: "Need more practice? Get the complete package for just ₹499.",
  },
];

const practicePlanTiers = [
  {
    title: "First Mock",
    badge: "FREE",
    badgeColor: "bg-[#10B981] text-white",
    price: "₹0",
    priceSub: "",
    description: "See how the platform works before you commit.",
    features: [
      "1 complete NSSB mock",
      "Timed exam experience",
      "Instant result",
      "Score & performance feedback",
    ],
    cta: "Start Free Mock →",
    href: "/exams" as const,
    featured: false,
    buttonStyle: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
  },
  {
    title: "Free After Sign-Up",
    badge: "SIGN UP",
    badgeColor: "bg-[#2563EB] text-white",
    price: "₹0",
    priceSub: "",
    description: "Get more complete practice without paying.",
    features: [
      "3 additional complete mocks",
      "Timed exam experience",
      "Instant results",
      "Performance tracking",
    ],
    cta: "Sign Up & Unlock →",
    href: "/register" as const,
    featured: false,
    buttonStyle: "border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#2563EB]",
  },
  {
    title: "Complete Package",
    badge: "BEST VALUE",
    badgeColor: "bg-[#4F46E5] text-white",
    price: "₹499",
    priceSub: "one package",
    description: "Keep practising when you want the complete NSSB preparation experience.",
    features: [
      "Complete mock-test package",
      "Subject-wise practice",
      "More full-length mocks",
      "Performance tracking",
    ],
    cta: "Unlock Full Package →",
    href: "/pricing" as const,
    featured: true,
    buttonStyle: "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
  },
];

export default async function Home() {
  const access = await getPortalAccessStatus();

  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      {/* 1. Global Navigation Bar */}
      <MainNav access={access} />

      {/* 2. Minimal Hero Section with User's Banner Background */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-[#EEF4FE] min-h-[460px] lg:min-h-[520px] flex items-center">
        {/* Full Image Hero Background */}
        <div
          className="absolute inset-0 bg-cover bg-center lg:bg-right bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/images/hero/mock-hero.png')" }}
        />
        {/* Subtle left gradient overlay for crisp readability across viewports */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#EEF4FE] via-[#EEF4FE]/90 to-transparent lg:via-[#EEF4FE]/70 lg:w-[55%] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:py-20 w-full">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Top Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 px-3 py-1 border border-blue-100/80 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                NAGALAND STAFF SELECTION BOARD
              </span>
            </div>

            <h1 className="headline-xl text-[#0F172A] leading-tight">
              Prepare for NSSB.<br />Practice Like the Real Exam.
            </h1>

            <p className="body-md mt-4 text-[#475569] leading-relaxed max-w-lg">
              NSSB mock tests, subject-wise practice and exam-focused questions designed to help you prepare smarter for the Nagaland Staff Selection Board examinations.
            </p>

            {/* Limited Free Access Promo Card (Only for guest users who haven't signed up) */}
            {access.isGuest ? (
              <div className="relative mt-8 max-w-xl rounded-2xl border border-[#D9E2FC] bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-xs animate-gift-glow overflow-visible">
                    <svg
                      className="w-8 h-8 overflow-visible"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id="giftBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFFBEB" />
                          <stop offset="100%" stopColor="#FEF3C7" />
                        </linearGradient>
                        <linearGradient id="giftLidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" />
                          <stop offset="100%" stopColor="#FEF3C7" />
                        </linearGradient>
                        <linearGradient id="giftRibbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#F43F5E" />
                          <stop offset="100%" stopColor="#BE123C" />
                        </linearGradient>
                        <linearGradient id="giftLightBeam" x1="50%" y1="100%" x2="50%" y2="0%">
                          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Light cone shooting up when lid opens */}
                      <polygon
                        points="13,18 23,18 31,2 5,2"
                        fill="url(#giftLightBeam)"
                        className="animate-gift-light"
                      />

                      {/* Sparkle 1 */}
                      <g className="animate-gift-sparkle-1" style={{ transformOrigin: "18px 18px" }}>
                        <path
                          d="M18 13L19 16L22 17L19 18L18 21L17 18L14 17L17 16Z"
                          fill="#FEF08A"
                        />
                      </g>

                      {/* Sparkle 2 */}
                      <g className="animate-gift-sparkle-2" style={{ transformOrigin: "18px 18px" }}>
                        <path
                          d="M18 13L19 15.5L21.5 16.5L19 17.5L18 20L17 17.5L14.5 16.5L17 15.5Z"
                          fill="#FFFFFF"
                        />
                      </g>

                      {/* Sparkle 3 */}
                      <g className="animate-gift-sparkle-3" style={{ transformOrigin: "18px 18px" }}>
                        <path
                          d="M18 12L19.2 15.2L22.5 16.5L19.2 17.8L18 21L16.8 17.8L13.5 16.5L16.8 15.2Z"
                          fill="#FDE047"
                        />
                      </g>

                      {/* Box Body */}
                      <rect x="7" y="17" width="22" height="15" rx="2.5" fill="url(#giftBoxGrad)" />
                      {/* Base Inner Depth when lid lifts */}
                      <rect x="8.5" y="17" width="19" height="2" fill="#D97706" opacity="0.4" />
                      {/* Vertical Ribbon */}
                      <rect x="15.5" y="17" width="5" height="15" fill="url(#giftRibbonGrad)" />

                      {/* Box Lid (Lifts and opens) */}
                      <g className="animate-gift-lid">
                        {/* Bow Loops */}
                        <path
                          d="M14 10.5C12 7.5 9.5 9 11.5 11.5C13.5 14 17 12.5 17 12.5"
                          fill="url(#giftRibbonGrad)"
                        />
                        <path
                          d="M22 10.5C24 7.5 26.5 9 24.5 11.5C22.5 14 19 12.5 19 12.5"
                          fill="url(#giftRibbonGrad)"
                        />
                        {/* Bow Knot */}
                        <circle cx="18" cy="12" r="2" fill="#9F1239" />

                        {/* Lid Main Bar */}
                        <rect x="5" y="12.5" width="26" height="5" rx="1.5" fill="url(#giftLidGrad)" />
                        {/* Lid Ribbon */}
                        <rect x="15.5" y="12.5" width="5" height="5" fill="url(#giftRibbonGrad)" />
                      </g>
                    </svg>

                    {/* Subtle ping beacon */}
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <CountdownTimer />
                    <h3 className="mt-1.5 text-sm sm:text-[15px] font-bold text-[#0F172A] leading-snug">
                      Start Your First NSSB Mock Test — FREE
                    </h3>
                    <p className="mt-0.5 text-xs text-[#64748B] leading-normal">
                      Take 1 complete mock test instantly (no sign-up required).
                    </p>
                  </div>
                </div>

                <Link
                  href="/exams"
                  className="group relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold !text-white text-white shadow-xs transition duration-200 hover:bg-[#1D4ED8] hover:scale-[1.03] active:scale-[0.98] animate-btn-pulse"
                >
                  {/* Light gloss sweep overlay */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-btn-shimmer" />

                  <span className="relative z-10 flex items-center gap-1.5 !text-white text-white">
                    <span className="!text-white text-white">Start Free</span>
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 animate-arrow-nudge !text-white text-white">
                      →
                    </span>
                  </span>
                </Link>
              </div>
            ) : (
              /* Authenticated User Quick Actions */
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold !text-white text-white shadow-xs transition duration-200 hover:bg-[#1D4ED8] hover:scale-[1.02]"
                >
                  <span>Go to Dashboard</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/exams"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white/90 px-5 py-3 text-sm font-semibold text-[#0F172A] shadow-2xs backdrop-blur-xs transition hover:bg-white hover:border-[#94A3B8]"
                >
                  <span>📝 Mock Tests Catalog</span>
                </Link>
              </div>
            )}

            {/* Subtle Secondary Navigation for Guests */}
            {access.isGuest && (
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="/dashboard/tests"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white/80 px-4 py-2 text-xs font-semibold text-[#334155] shadow-2xs backdrop-blur-xs transition hover:bg-white hover:border-[#94A3B8]"
                >
                  <span>📚</span> Explore Subjects
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white/80 px-4 py-2 text-xs font-semibold text-[#334155] shadow-2xs backdrop-blur-xs transition hover:bg-white hover:border-[#94A3B8]"
                >
                  <span>⭐</span> Pro Pass & Pricing
                </Link>
              </div>
            )}
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

      {/* Benefits Bar */}
      <div className="border-b border-[#E2E8F0] bg-white py-3.5 px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-[13px] text-[#475569] text-center">
          <span>
            <strong className="font-semibold text-[#0F172A]">1 Complete Mock</strong> free to start
          </span>
          <span className="text-[#CBD5E1] hidden sm:inline select-none">•</span>
          <span>
            <strong className="font-semibold text-[#0F172A]">+3 Complete Mocks</strong> free after sign-up
          </span>
          <span className="text-[#CBD5E1] hidden sm:inline select-none">•</span>
          <span>
            <strong className="font-semibold text-[#0F172A]">Full Access ₹499</strong> when you want more
          </span>
        </div>
      </div>

      {/* 3. NSSB General Paper: One Exam. Five Areas to Master. */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <p className="label-sm uppercase tracking-wider text-[#2563EB]">
            KNOW YOUR NSSB GENERAL PAPER
          </p>
          <h2 className="headline-lg text-[#0F172A] mt-2">
            One Exam. Five Areas to Master.
          </h2>
          <p className="body-md text-[#64748B] mt-3 max-w-2xl mx-auto">
            Focus your preparation on the subjects tested in the NSSB General Paper and practise each area systematically.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {nssbGeneralPaperAreas.map((area) => (
            <div
              key={area.num}
              className="group relative flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[#2563EB]/70 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex flex-col flex-1">
                {/* 3D Vector Illustration Header Box with Number Badge */}
                <div className="relative mb-1">
                  <Subject3DIllustration type={area.type} />
                  <span className="absolute top-2.5 left-2.5 label-sm font-mono text-[#2563EB] bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#BFDBFE]/80 shadow-2xs">
                    {area.num}
                  </span>
                </div>

                {/* Subject Title */}
                <h3 className="headline-sm text-[#0F172A] mt-3.5 group-hover:text-[#2563EB] transition-colors leading-snug">
                  {area.title}
                </h3>

                {/* Marks & Weight Badge */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="label-sm inline-flex items-center rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[#2563EB] border border-[#BFDBFE]/50">
                    {area.marks}
                  </span>
                  <span className="body-sm text-[#64748B]">
                    • {area.weight}
                  </span>
                </div>

                {/* Description */}
                <p className="body-sm text-[#475569] mt-2.5 leading-relaxed flex-1">
                  {area.description}
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-5 border-t border-[#F1F5F9] pt-3.5">
                <Link
                  href={area.href}
                  className="flex items-center justify-between label-sm text-[#2563EB]"
                >
                  <span className="group-hover:underline">{area.cta}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[#2563EB] group-hover:text-white">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Purposeful Preparation / Built for NSSB Aspirants */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FAFC]/50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="label-sm uppercase tracking-wider text-[#2563EB]">
              BUILT FOR NSSB ASPIRANTS
            </p>
            <h2 className="headline-lg text-[#0F172A] mt-2">
              Stop Practising Random Questions. Start Preparing With Purpose.
            </h2>
            <p className="body-md text-[#64748B] mt-3 max-w-2xl mx-auto">
              Turn your preparation into measurable practice with focused tests, instant results and performance feedback.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nssbPurposeFeatures.map((item) => (
              <div
                key={item.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-[#2563EB]/70 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div>
                  {/* 3D Vector Illustration Container */}
                  <div className="mb-4">
                    <Purpose3DIllustration type={item.type} />
                  </div>

                  <h3 className="headline-sm text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>
                  <p className="body-sm text-[#64748B] mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Free Mock Banner & Quick Start Sets */}
      <section className="border-t border-[#E2E8F0] bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Featured Hero Card with Mouse Tracker Glow */}
            <FreeMockHeroCard />

            {/* Right List of Mock Tests */}
            <div className="lg:col-span-7 flex flex-col justify-center gap-3.5">
              {freeMockTests.map((test) => (
                <Link
                  key={test.title}
                  href={test.href}
                  className="group flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB]/70 hover:shadow-md hover:shadow-blue-500/5"
                >
                  <div className="flex flex-col pr-4">
                    <h3 className="headline-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {test.title}
                    </h3>
                    <p className="body-sm text-[#64748B] mt-1.5">
                      {test.meta}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 label-sm text-[#2563EB] group-hover:translate-x-1 transition-transform font-semibold">
                    <span>Start</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Prepare for Every Major NSSB Subject */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FAFC]/50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="label-sm uppercase tracking-wider text-[#2563EB]">
              NSSB SUBJECT-WISE PREPARATION
            </p>
            <h2 className="headline-lg text-[#0F172A] mt-2">
              Prepare for Every Major NSSB Subject
            </h2>
            <p className="body-md text-[#64748B] mt-3 max-w-2xl mx-auto">
              Build your preparation around the exact areas you need to master.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {nssbSubjectPreparation.map((subject) => (
              <div
                key={subject.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/70 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div>
                  {/* Compact Header: Title & Description on Left, 3D Art on Right */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="headline-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                        {subject.title}
                      </h3>
                      <p className="body-sm text-[#64748B] mt-1.5 leading-relaxed">
                        {subject.description}
                      </p>
                    </div>

                    {/* Compact 3D Illustration Container */}
                    <div className="shrink-0 h-16 w-20 sm:h-20 sm:w-24">
                      <SubjectPrep3DIllustration type={subject.type} />
                    </div>
                  </div>

                  {/* Topic Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {subject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 text-xs text-[#475569] font-medium transition-colors hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-5 pt-1">
                  <Link
                    href={subject.href}
                    className="label-sm inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 font-bold text-[#0F172A] shadow-2xs hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>{subject.cta}</span>
                    <span className="transition-transform group-hover:translate-x-1 font-bold">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Simple 3-Step Preparation (Interactive Animated Section) */}
      <InteractiveStepsSection />

      {/* 8. NSSB Syllabus at a Glance */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FAFC]/50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="label-sm uppercase tracking-wider text-[#2563EB]">
              NSSB SYLLABUS AT A GLANCE
            </p>
            <h2 className="headline-lg text-[#0F172A] mt-2">
              Know What to Prepare
            </h2>
            <p className="body-md text-[#64748B] mt-3 max-w-2xl mx-auto">
              Use the marks distribution to plan your practice and prioritise your preparation.
            </p>
          </div>

          <div className="mt-10 mx-auto max-w-3xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-500/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 border-b border-blue-100">
                  <th className="px-6 py-4 label-sm text-[#1E3A8A]">
                    SUBJECT
                  </th>
                  <th className="px-6 py-4 label-sm text-[#1E3A8A] text-center hidden sm:table-cell">
                    WEIGHTAGE
                  </th>
                  <th className="px-6 py-4 label-sm text-[#1E3A8A] text-right">
                    MARKS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {nssbSyllabusMarks.map((row) => (
                  <tr
                    key={row.subject}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* Subject Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm group-hover:scale-110 group-hover:border-blue-200 transition-all shadow-2xs">
                          {row.icon}
                        </span>
                        <span className="body-md font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                          {row.subject}
                        </span>
                      </div>
                    </td>

                    {/* Weightage Progress Bar (Tablet & Desktop) */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-2 w-full max-w-[120px] rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${row.barGradient} transition-all duration-500`}
                            style={{ width: row.barWidth }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#64748B] w-12 text-right">
                          {row.weight}
                        </span>
                      </div>
                    </td>

                    {/* Marks Badge Column */}
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-blue-50/90 border border-blue-200/80 px-3.5 py-1 text-sm font-bold text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white group-hover:border-[#2563EB] transition-all shadow-2xs">
                        {row.marks}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] text-white">
                  <td className="px-6 py-4.5 headline-sm text-white flex items-center gap-2">
                    <span>✨</span>
                    <span>Total Exam Weightage</span>
                  </td>
                  <td className="px-6 py-4.5 text-center hidden sm:table-cell">
                    <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white border border-white/30 backdrop-blur-xs">
                      100% Weightage
                    </span>
                  </td>
                  <td className="px-6 py-4.5 headline-sm text-white text-right">
                    <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-sm font-bold text-[#1D4ED8] shadow-xs">
                      200 Marks
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* 9. Your Free NSSB Practice Plan / Pricing */}
      <section className="border-t border-[#E2E8F0] bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="label-sm uppercase tracking-wider text-[#2563EB]">
              YOUR FREE NSSB PRACTICE PLAN
            </p>
            <h2 className="headline-lg text-[#0F172A] mt-2">
              Try It Free. Then Unlock More Practice.
            </h2>
            <p className="body-md text-[#64748B] mt-3 max-w-2xl mx-auto">
              Start without a commitment. Your first complete mock is free, and signing up unlocks three more complete mocks.
            </p>
          </div>

          {/* 4 Steps Row */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {practicePlanSteps.map((item) => (
              <div
                key={item.step}
                className="group flex flex-col items-center text-center rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]/50 p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB]/60 hover:bg-white hover:shadow-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] border border-[#BFDBFE]/70 text-xs font-bold text-[#2563EB]">
                  {item.step}
                </span>
                <h3 className="headline-sm text-[#0F172A] mt-3.5 leading-snug">
                  {item.title}
                </h3>
                <p className="body-sm text-[#64748B] mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* 3 Tier Pricing Cards */}
          <div className="mt-8 grid gap-6 md:grid-cols-3 items-stretch">
            {practicePlanTiers.map((tier) => (
              <div
                key={tier.title}
                className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 transition-all duration-200 ${
                  tier.featured
                    ? "border-2 border-[#6366F1] bg-white shadow-md ring-4 ring-[#6366F1]/5 hover:-translate-y-1"
                    : "border border-[#E2E8F0] bg-white shadow-xs hover:border-[#2563EB]/60 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div>
                  {/* Header & Badge */}
                  <div className="flex items-center justify-between">
                    <h3 className="headline-sm text-[#0F172A]">{tier.title}</h3>
                    <span className={`label-sm uppercase rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tier.badgeColor}`}>
                      {tier.badge}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                      {tier.price}
                    </span>
                    {tier.priceSub && (
                      <span className="body-sm text-[#64748B] ml-2 font-normal">
                        {tier.priceSub}
                      </span>
                    )}
                  </div>

                  <p className="body-sm text-[#64748B] mt-3 leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Bullet features */}
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 body-sm text-[#334155]">
                        <span className="text-[#10B981] font-bold shrink-0 mt-0.5">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 pt-2">
                  <Link
                    href={tier.href}
                    className={`label-md block w-full rounded-xl py-3 px-4 text-center font-semibold transition-all shadow-xs ${tier.buttonStyle}`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final Call to Action Banner (High-Converting Rich Banner) */}
      <FinalCtaBanner />

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
