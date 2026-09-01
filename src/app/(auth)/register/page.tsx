import Link from "next/link";
import { register } from "@/lib/actions/auth-actions";

type RegisterPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-md border border-[#ccd8d4] bg-[#fbfcfb] p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
          Mock Test Portal
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Create account</h1>
        <p className="mt-3 text-sm leading-6 text-[#475467]">
          Register as a student to take the seeded mock test.
        </p>

        <form action={register} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Full name
            <input
              name="fullName"
              type="text"
              required
              className="border border-[#ccd8d4] bg-white px-3 py-2"
            />
          </label>
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
            Password
            <input
              name="password"
              type="password"
              required
              minLength={6}
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
            Create account
          </button>
        </form>

        <p className="mt-5 text-sm text-[#475467]">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-[#146b5f]">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
