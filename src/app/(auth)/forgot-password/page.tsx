import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth-actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error, success } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-md border border-[#ccd8d4] bg-[#fbfcfb] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
          Mock Test Portal
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Reset password</h1>
        <p className="mt-3 text-sm leading-6 text-[#475467]">
          Enter your registered email address and we will send you instructions to reset your password.
        </p>

        <form action={requestPasswordReset} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="border border-[#ccd8d4] bg-white px-3 py-2 text-sm focus:border-[#146b5f] focus:outline-none"
            />
          </label>

          {error ? (
            <p className="border border-[#efc9c0] bg-[#f8e9e5] px-3 py-2 text-sm font-medium text-[#a3412f]">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm font-medium text-[#166534]">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f544a]"
          >
            Send reset instructions
          </button>
        </form>

        <div className="mt-6 border-t border-[#f0f2f5] pt-4 text-center text-sm text-[#475467]">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[#146b5f] hover:underline">
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
