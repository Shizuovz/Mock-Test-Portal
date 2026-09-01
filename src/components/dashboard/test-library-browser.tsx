"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AvailableTestCard } from "@/lib/dashboard/available-tests";

type TestLibraryBrowserProps = {
  initialTests: AvailableTestCard[];
  exams: { name: string; slug: string }[];
  initialSearch?: string;
  initialExam?: string;
  initialStatus?: "all" | "completed" | "uncompleted";
};

export function TestLibraryBrowser({
  initialTests,
  exams,
  initialSearch = "",
  initialExam = "all",
  initialStatus = "all",
}: TestLibraryBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedExam, setSelectedExam] = useState(initialExam);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "completed" | "uncompleted" | "in_progress">(
    initialStatus === "all" ? "all" : initialStatus,
  );
  const [durationFilter, setDurationFilter] = useState<"all" | "quick" | "standard" | "full">("all");

  // Sync with URL when filters change (shallow/replace)
  function updateUrl(q: string, exam: string, status: string) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (exam !== "all") params.set("exam", exam);
    if (status !== "all") params.set("status", status);

    const qs = params.toString();
    const newPath = qs ? `/dashboard/tests?${qs}` : "/dashboard/tests";
    window.history.replaceState(null, "", newPath);
  }

  function handleSearchChange(newVal: string) {
    setSearchQuery(newVal);
    updateUrl(newVal, selectedExam, selectedStatus);
  }

  function handleExamChange(newExam: string) {
    setSelectedExam(newExam);
    updateUrl(searchQuery, newExam, selectedStatus);
  }

  function handleStatusChange(newStatus: "all" | "completed" | "uncompleted" | "in_progress") {
    setSelectedStatus(newStatus);
    updateUrl(searchQuery, selectedExam, newStatus);
  }

  function handleReset() {
    setSearchQuery("");
    setSelectedExam("all");
    setSelectedStatus("all");
    setDurationFilter("all");
    router.replace("/dashboard/tests");
  }

  // Filter calculations
  const filteredTests = useMemo(() => {
    return initialTests.filter((test) => {
      // Exam pill filter
      if (selectedExam !== "all" && test.examSlug !== selectedExam) {
        return false;
      }

      // Status pill filter
      if (selectedStatus === "completed" && test.attemptStatus !== "submitted") {
        return false;
      }
      if (selectedStatus === "uncompleted" && (test.attemptStatus === "submitted" || test.attemptStatus === "in_progress")) {
        return false;
      }
      if (selectedStatus === "in_progress" && test.attemptStatus !== "in_progress") {
        return false;
      }

      // Duration pill filter
      if (durationFilter === "quick" && test.durationMinutes > 15) {
        return false;
      }
      if (durationFilter === "standard" && (test.durationMinutes <= 15 || test.durationMinutes > 60)) {
        return false;
      }
      if (durationFilter === "full" && test.durationMinutes <= 60) {
        return false;
      }

      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = test.name.toLowerCase().includes(q);
        const matchExam = test.examName.toLowerCase().includes(q);
        const matchDesc = (test.description ?? "").toLowerCase().includes(q);
        return matchName || matchExam || matchDesc;
      }

      return true;
    });
  }, [initialTests, selectedExam, selectedStatus, durationFilter, searchQuery]);

  // Counts for pills
  const completedCount = initialTests.filter((t) => t.attemptStatus === "submitted").length;
  const inProgressCount = initialTests.filter((t) => t.attemptStatus === "in_progress").length;
  const uncompletedCount = initialTests.filter((t) => t.attemptStatus !== "submitted" && t.attemptStatus !== "in_progress").length;

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedExam !== "all" ||
    selectedStatus !== "all" ||
    durationFilter !== "all";

  return (
    <div className="mt-6 space-y-6">
      {/* 1. Filter Hub Frame */}
      <div className="rounded-xl border border-[#d9dee7] bg-white p-5 shadow-sm space-y-4">
        {/* Search input with live clear button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#98a2b3]">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search tests by title, topic, or exam (e.g. Percentage, SSC, Mini Mock)..."
              className="w-full rounded-lg border border-[#ccd8d4] bg-[#fbfcfb] py-2.5 pl-10 pr-10 text-sm placeholder-[#98a2b3] transition focus:border-[#146b5f] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#146b5f]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-[#667085] hover:text-[#15171a]"
              >
                ✕
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#146b5f] hover:underline whitespace-nowrap self-end sm:self-auto"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* 2. Exam Category Filter Pills */}
        <div className="border-t border-[#f0f2f5] pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Exam Category:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExamChange("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedExam === "all"
                  ? "bg-[#146b5f] text-white shadow-sm"
                  : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5] hover:text-[#15171a]"
              }`}
            >
              All Exams ({initialTests.length})
            </button>
            {exams.map((exam) => {
              const count = initialTests.filter((t) => t.examSlug === exam.slug).length;
              const isSelected = selectedExam === exam.slug;
              return (
                <button
                  key={exam.slug}
                  type="button"
                  onClick={() => handleExamChange(isSelected ? "all" : exam.slug)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-[#146b5f] text-white shadow-sm"
                      : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5] hover:text-[#15171a]"
                  }`}
                >
                  {exam.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Status & Duration Filter Pills Row */}
        <div className="border-t border-[#f0f2f5] pt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Pills */}
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#667085]">
              Attempt Status:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedStatus === "all"
                    ? "bg-[#15171a] text-white"
                    : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5]"
                }`}
              >
                All ({initialTests.length})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("uncompleted")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedStatus === "uncompleted"
                    ? "bg-[#146b5f] text-white"
                    : "border border-[#ccd8d4] bg-white text-[#146b5f] hover:bg-[#eef5f3]"
                }`}
              >
                ⚡ Ready to Attempt ({uncompletedCount})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("completed")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedStatus === "completed"
                    ? "bg-[#027a48] text-white"
                    : "border border-[#ccd8d4] bg-white text-[#027a48] hover:bg-[#ecfdf3]"
                }`}
              >
                ✓ Completed ({completedCount})
              </button>
              {inProgressCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleStatusChange("in_progress")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedStatus === "in_progress"
                      ? "bg-[#b42318] text-white"
                      : "border border-[#fecdca] bg-[#fffbfa] text-[#b42318] hover:bg-[#fee4e2]"
                  }`}
                >
                  ● In Progress ({inProgressCount})
                </button>
              )}
            </div>
          </div>

          {/* Duration Pills */}
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#667085]">
              Test Duration:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDurationFilter("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "all"
                    ? "bg-[#15171a] text-white"
                    : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("quick")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "quick"
                    ? "bg-[#146b5f] text-white"
                    : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5]"
                }`}
              >
                Quick (≤15m)
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("standard")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "standard"
                    ? "bg-[#146b5f] text-white"
                    : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5]"
                }`}
              >
                Standard (16-60m)
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("full")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "full"
                    ? "bg-[#146b5f] text-white"
                    : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5]"
                }`}
              >
                Full Mock (&gt;60m)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Counter Banner */}
      <div className="flex items-center justify-between text-xs font-medium text-[#667085]">
        <span>
          Showing <strong className="text-[#15171a]">{filteredTests.length}</strong> of{" "}
          {initialTests.length} tests
        </span>
        {searchQuery && (
          <span>
            Matching query: &ldquo;<strong>{searchQuery}</strong>&rdquo;
          </span>
        )}
      </div>

      {/* 4. Tests Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <article
              key={test.id}
              className="flex flex-col justify-between rounded-xl border border-[#d9dee7] bg-white p-5 shadow-sm transition hover:border-[#146b5f] hover:shadow-md"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-[#f4f6f5] px-2.5 py-0.5 text-xs font-semibold text-[#146b5f]">
                    {test.examName}
                  </span>
                  {test.maxAttempts !== null && (
                    <span className="inline-flex items-center rounded-full bg-[#f0ede6] px-2 py-0.5 text-[11px] font-medium text-[#765a22]">
                      {test.maxAttempts === 1 ? "1 Attempt Only" : `Max ${test.maxAttempts} Attempts`}
                    </span>
                  )}
                  {test.isAttemptLimitReached && (
                    <span className="inline-flex items-center rounded-full bg-[#fef3f2] px-2 py-0.5 text-[11px] font-medium text-[#b42318]">
                      Limit Reached
                    </span>
                  )}
                  {test.attemptStatus === "in_progress" && (
                    <span className="inline-flex items-center rounded-full bg-[#fef3f2] px-2 py-0.5 text-[11px] font-medium text-[#b42318]">
                      ● In Progress
                    </span>
                  )}
                  {test.attemptStatus === "submitted" && !test.isAttemptLimitReached && (
                    <span className="inline-flex items-center rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[11px] font-medium text-[#027a48]">
                      ✓ Completed
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-bold text-[#15171a] leading-6">{test.name}</h2>
                {test.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-[#475467]">
                    {test.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#f0f2f5] pt-3 text-xs text-[#667085]">
                  <div>
                    <span>Duration: </span>
                    <strong className="text-[#15171a]">{test.durationMinutes} mins</strong>
                  </div>
                  <div>
                    <span>Questions: </span>
                    <strong className="text-[#15171a]">{test.questionCount}</strong>
                  </div>
                  <div>
                    <span>Total marks: </span>
                    <strong className="text-[#15171a]">{test.totalMarks ?? "--"}</strong>
                  </div>
                  <div>
                    <span>Passing: </span>
                    <strong className="text-[#15171a]">{test.passingMarks ?? "--"}</strong>
                  </div>
                </div>

                {test.highlightScorePercent !== null && (
                  <div className="mt-3 rounded-lg bg-[#f7f8fa] p-2.5 text-xs text-[#475467] flex items-center justify-between">
                    <span>{test.highlightScoreLabel}:</span>
                    <span className="font-bold text-[#146b5f]">
                      {test.highlightScorePercent}% ({test.attemptsCount} attempt{test.attemptsCount > 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-[#f0f2f5] pt-4">
                {test.attemptStatus === "in_progress" ? (
                  <Link
                    href={`/test/${test.id}`}
                    className="block w-full rounded-lg bg-[#146b5f] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0f544a]"
                  >
                    Resume Attempt
                  </Link>
                ) : test.isAttemptLimitReached ? (
                  <Link
                    href={`/test/${test.id}/result`}
                    className="block w-full rounded-lg border border-[#146b5f] py-2.5 text-center text-sm font-semibold text-[#146b5f] transition hover:bg-[#e6f3ef]"
                  >
                    Review Past Results (Limit Reached)
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href={`/test/${test.id}/instructions`}
                      className="flex-1 rounded-lg bg-[#146b5f] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0f544a]"
                    >
                      {test.attemptsCount > 0 ? "Retake Test" : "Start Test"}
                    </Link>
                    {test.attemptsCount > 0 && (
                      <Link
                        href={`/test/${test.id}/result`}
                        className="rounded-lg border border-[#ccd8d4] px-3.5 py-2.5 text-center text-sm font-semibold text-[#475467] transition hover:bg-[#f4f6f5]"
                      >
                        Result
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#ccd8d4] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f6f5] text-xl text-[#667085]">
            🔍
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#15171a]">No tests match your criteria</h3>
          <p className="mt-1 text-sm text-[#475467]">
            Try adjusting your search terms or filter pills to discover available tests.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-5 inline-flex items-center rounded-lg bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f544a]"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
