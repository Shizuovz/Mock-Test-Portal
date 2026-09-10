import type { Metadata } from "next";
import Link from "next/link";
import { updatePassword } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  title: "Set New Password — Mock Test Portal",
  description: "Set a new secure password for your Mock Test Portal account.",
};

type UpdatePasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function UpdatePasswordPage({ searchParams }: UpdatePasswordPageProps) {
  const { error } = await searchParams;

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[#F8FAFC] px-4 py-12 flex items-center justify-center text-[#0F172A]">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-7 sm:p-9 shadow-lg shadow-blue-500/5">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 border border-blue-100 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              ACCOUNT SECURITY
            </span>
          </div>

          <h1 className="headline-lg text-[#0F172A] font-serif leading-tight">
            Set New Password
          </h1>
          <p className="body-sm mt-2 text-[#64748B] leading-relaxed">
            Please enter and confirm your new secure account password below.
          </p>

          <form action={updatePassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                New Password
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                Confirm New Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-2xs transition focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-[#1D4ED8] hover:shadow-md cursor-pointer active:scale-[0.99]"
            >
              Update Password &amp; Sign In →
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#F1F5F9] text-center">
            <p className="text-xs text-[#64748B]">
              Remember your old password?{" "}
              <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
