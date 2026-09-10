"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Runtime Error Boundary caught exception]:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-[#0F172A]">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          We encountered an unexpected issue. Any saved exam answers and active test timers remain safe on the server.
        </p>

        {error?.digest && (
          <p className="mt-2 text-xs font-mono text-[#94A3B8]">
            Error Ref: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#4338CA]"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>

          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] transition hover:bg-[#F8FAFC]"
          >
            <Home className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
