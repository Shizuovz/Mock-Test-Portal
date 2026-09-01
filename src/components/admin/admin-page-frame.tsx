import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminAccess } from "@/lib/admin/content-read-model";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/exams", label: "Exams" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/topics", label: "Topics" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/tests", label: "Tests" },
] as const;

type AdminPageFrameProps = {
  access: AdminAccess;
  title: string;
  description: string;
  children: ReactNode;
};

export function AdminPageFrame({
  access,
  title,
  description,
  children,
}: AdminPageFrameProps) {
  if (!access.canView) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-6 py-8 text-[#15171a]">
        <section className="mx-auto max-w-4xl border border-[#d9dee7] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
            Admin access
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Permission required</h1>
          <p className="mt-4 max-w-2xl text-[#475467]">
            Sign in with an editor or admin account to view content management
            screens.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-7xl">
        <div className="border-b border-[#d9dee7] pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
          <p className="mt-3 max-w-3xl text-[#475467]">{description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-sm font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </section>
    </main>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="mt-6 overflow-x-auto border border-[#d9dee7] bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[#f4f6f5] text-[#475467]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-[#d9dee7] px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminCell({ children }: { children: ReactNode }) {
  return <td className="border-b border-[#eef1f0] px-4 py-3">{children}</td>;
}

export function AdminStatus({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-[#e6f3ef] text-[#146b5f]" : "bg-[#f0ede6] text-[#765a22]"
      }`}
    >
      {label}
    </span>
  );
}
