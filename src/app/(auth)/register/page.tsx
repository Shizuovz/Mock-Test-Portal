import type { Metadata } from "next";
import Link from "next/link";
import { register } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  title: "Create Free Student Account — Mock Test Portal",
  description: "Sign up to unlock your first full-length NSSB mock test with instant scoring and detailed solutions.",
};

type RegisterPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F8FAFC] px-4 py-12 flex items-center justify-center text-[#0F172A]">
      <div className="w-full max-w-md">
        {/* Registration Card */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-7 sm:p-9 shadow-lg shadow-blue-500/5">
          {/* Welcome Promo Banner */}
          <div className="mb-6 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-[#FFFBEB] to-amber-50/50 p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg shadow-2xs">
              🎁
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Unlock +3 Free Complete Mocks
              </p>
              <p className="text-[11px] text-amber-800/90">
                Create a free account to unlock 3 more tests with full analytics
              </p>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="headline-lg text-[#0F172A] font-serif leading-tight">
              Create Your Account
            </h1>
            <p className="body-sm mt-2 text-[#64748B] leading-relaxed">
              Sign up as an aspirant to start your test series and save your diagnostic results.
            </p>
          </div>

          <form action={register} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="e.g. Temjen Jamir"
                className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-2xs transition focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
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
              className="w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-[#1D4ED8] hover:shadow-md cursor-pointer"
            >
              Create Account & Start Test →
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
            <p className="text-xs text-[#64748B]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
                Sign in here
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
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            Instant activation
          </span>
        </div>
      </div>
    </main>
  );
}
