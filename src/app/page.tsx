import type { Metadata } from "next";
import Link from "next/link";

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

const foundationItems = [
  "Next.js App Router",
  "TypeScript strict mode",
  "Tailwind CSS",
  "Supabase-ready structure",
  "Server-side scoring module",
];

const mvpFlow = [
  "Browse exam",
  "Start timed test",
  "Autosave answers",
  "Submit securely",
  "Review result",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#15171a]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-[#d9dee7] pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
              Mock Test Portal
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Project scaffold is ready.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/exams"
              className="rounded-md border border-[#d9dee7] bg-white px-4 py-2 text-sm font-semibold text-[#34403c] hover:bg-[#f7f8fa]"
            >
              Browse exams
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115b51]"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="flex flex-col justify-center">
            <p className="max-w-2xl text-lg leading-8 text-[#475467]">
              The first build will prove the core student journey:
              authentication, published tests, timed attempts, autosave,
              server-side scoring, and answer review.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {foundationItems.map((item) => (
                <div
                  key={item}
                  className="border-l-4 border-[#146b5f] bg-white px-4 py-3 shadow-sm"
                >
                  <p className="font-medium text-[#15171a]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-center border border-[#d9dee7] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">First-slice user flow</h2>
            <ol className="mt-5 space-y-3">
              {mvpFlow.map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-[#475467]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#146b5f] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/exams"
                className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115b51]"
              >
                View exam directory
              </Link>
              <Link
                href="/admin"
                className="rounded-md border border-[#d9dee7] px-4 py-2 text-sm font-semibold text-[#34403c] hover:bg-[#f7f8fa]"
              >
                Admin overview
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
