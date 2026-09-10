"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Fatal Global Error Boundary caught exception]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 text-[#0F172A] font-sans antialiased">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
            <AlertOctagon className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
            Application Error
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            A critical error occurred while loading the application.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#4338CA]"
          >
            <RotateCcw className="h-4 w-4" /> Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
