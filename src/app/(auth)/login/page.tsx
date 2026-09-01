import Link from "next/link";
import { login } from "@/lib/actions/auth-actions";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-md border border-[#ccd8d4] bg-[#fbfcfb] p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
          Mock Test Portal
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Log in</h1>
        <p className="mt-3 text-sm leading-6 text-[#475467]">
          Sign in to start timed attempts and save answers to Supabase.
        </p>

        <form action={login} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              className="border border-[#ccd8d4] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <div className="flex justify-between items-center">
              <span>Password</span>
              <Link href="/forgot-password" className="text-xs text-[#146b5f] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              className="border border-[#ccd8d4] bg-white px-3 py-2"
            />
          </label>
          {message ? (
            <p className="border border-[#efc9c0] bg-[#f8e9e5] px-3 py-2 text-sm font-medium text-[#a3412f]">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
          >
            Log in
          </button>
        </form>

        <p className="mt-5 text-sm text-[#475467]">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[#146b5f]">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
