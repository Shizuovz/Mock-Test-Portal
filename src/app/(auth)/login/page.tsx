import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  title: "Log in — Mock Test Portal",
  description: "Sign in to access your NSSB mock test attempts, scores and diagnostic analytics.",
};

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F8FAFC] px-4 py-12 flex items-center justify-center text-[#0F172A]">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-7 sm:p-9 shadow-lg shadow-blue-500/5">
          {/* Top Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 border border-blue-100 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              NSSB ASPIRANT PORTAL
            </span>
          </div>

          <h1 className="headline-lg text-[#0F172A] font-serif leading-tight">
            Log in to Your Account
          </h1>
          <p className="body-sm mt-2 text-[#64748B] leading-relaxed">
            Sign in to access your timed mock tests, view detailed answer keys and track performance history.
          </p>

          <form action={login} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-2xs transition focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-2xs transition focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            {message && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-[#1D4ED8] hover:shadow-md cursor-pointer active:scale-[0.99]"
            >
              Sign In to Portal →
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
            <p className="text-xs text-[#64748B]">
              New to Mock Test Portal?{" "}
              <Link href="/register" className="font-semibold text-[#2563EB] hover:underline">
                Create free account
              </Link>
            </p>
          </div>
        </div>

        {/* Reassurance notes */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Instant Activation
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Secure Authentication
          </span>
        </div>
      </div>
    </main>
  );
}
