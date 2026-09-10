"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth-actions";

export interface MainNavProps {
  access: {
    isGuest: boolean;
    hasActiveSubscription: boolean;
    freeAttemptsRemaining: number;
  };
}

export function MainNav({ access }: MainNavProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isNssb = pathname.startsWith("/exams");
  const isSubjects = pathname.startsWith("/dashboard/tests") || pathname.startsWith("/subjects");
  const isPyq = pathname.includes("previous-year") || pathname.includes("pyq");
  const isSyllabus = pathname.includes("syllabus");

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Left: Brand + Main Nav */}
        <div className="flex items-center gap-6 xl:gap-9 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-sm font-bold text-white shadow-xs">
              🎯
            </div>
            <span className="text-lg xl:text-xl font-bold tracking-tight text-[#0F172A]">
              MockTest<span className="text-[#4F46E5]">Portal</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm xl:text-[15px] font-normal text-[#334155]">
            <Link
              href="/"
              className={`whitespace-nowrap transition ${
                isHome ? "font-bold text-[#2563EB]" : "hover:text-[#0F172A]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/exams"
              className={`whitespace-nowrap transition ${
                isNssb ? "font-bold text-[#2563EB]" : "hover:text-[#0F172A]"
              }`}
            >
              NSSB Mock Tests
            </Link>
            <Link
              href="/dashboard/tests"
              className={`whitespace-nowrap transition ${
                isSubjects ? "font-bold text-[#2563EB]" : "hover:text-[#0F172A]"
              }`}
            >
              Subjects
            </Link>
            <Link
              href="/exams"
              className={`whitespace-nowrap transition ${
                isPyq ? "font-bold text-[#2563EB]" : "hover:text-[#0F172A]"
              }`}
            >
              Previous Year Questions
            </Link>
            <Link
              href="/exams"
              className={`whitespace-nowrap transition ${
                isSyllabus ? "font-bold text-[#2563EB]" : "hover:text-[#0F172A]"
              }`}
            >
              Syllabus
            </Link>
          </nav>
        </div>

        {/* Right: Search & User Controls */}
        <div className="flex items-center gap-3 xl:gap-4 shrink-0">
          {/* Header Search Input */}
          <form action="/exams" method="GET" className="relative hidden md:block w-36 lg:w-44 xl:w-56">
            <input
              type="text"
              name="q"
              placeholder="Search exams..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-3 pr-8 text-xs text-[#0F172A] placeholder-[#94A3B8] transition focus:border-[#4F46E5] focus:bg-white focus:outline-none"
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

          {access.isGuest ? (
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Link
                href="/login"
                className="whitespace-nowrap text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition px-1"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8]"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {!access.hasActiveSubscription ? (
                <Link
                  href="/pricing"
                  className="whitespace-nowrap rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1D4ED8]"
                >
                  Go Pro
                </Link>
              ) : (
                <span className="whitespace-nowrap inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-0.5 text-xs font-semibold text-[#047857]">
                  ⭐ Pro
                </span>
              )}
              <Link
                href="/dashboard"
                className="whitespace-nowrap text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition"
              >
                Dashboard
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="whitespace-nowrap text-xs font-semibold text-[#64748B] hover:text-[#DC2626] transition"
                >
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
