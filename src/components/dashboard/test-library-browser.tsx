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
        const matchDesc = (test.description ?? "").toLowerCase().includes(q);
        const matchExam = test.examName.toLowerCase().includes(q);
        return matchName || matchDesc || matchExam;
      }

      return true;
    });
  }, [initialTests, selectedExam, selectedStatus, durationFilter, searchQuery]);

  const completedCount = initialTests.filter((t) => t.attemptStatus === "submitted").length;
  const uncompletedCount = initialTests.filter((t) => t.attemptStatus === "not_started").length;
  const inProgressCount = initialTests.filter((t) => t.attemptStatus === "in_progress").length;
  const hasActiveFilters = searchQuery.trim() !== "" || selectedExam !== "all" || selectedStatus !== "all" || durationFilter !== "all";

  return (
    <div className="mt-8 space-y-6">
      {/* 1. Search Bar & Controls Frame */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Instant Search Input */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search tests by title, topic, or exam (e.g. NSSB, SSC CGL, Nagaland GK)..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-10 text-sm text-[#0F172A] placeholder-[#64748B] transition focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#4F46E5] hover:underline whitespace-nowrap self-end sm:self-auto"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* 2. Exam Category Filter Pills */}
        <div className="border-t border-[#F1F5F9] pt-3 mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Exam Track:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleExamChange("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedExam === "all"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#EEF2FF]/40 hover:text-[#0F172A]"
              }`}
            >
              All Examinations ({initialTests.length})
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
                      ? "bg-[#4F46E5] text-white shadow-xs"
                      : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#EEF2FF]/40 hover:text-[#0F172A]"
                  }`}
                >
                  {exam.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Status & Duration Filter Pills Row */}
        <div className="border-t border-[#F1F5F9] pt-3 mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Pills */}
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Attempt Status:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedStatus === "all"
                    ? "bg-[#0F172A] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                All ({initialTests.length})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("uncompleted")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedStatus === "uncompleted"
                    ? "bg-[#4F46E5] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#4F46E5] hover:bg-[#EEF2FF]"
                }`}
              >
                ⚡ Ready to Attempt ({uncompletedCount})
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("completed")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedStatus === "completed"
                    ? "bg-[#16A34A] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#16A34A] hover:bg-[#DCFCE7]"
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
                      ? "bg-[#DC2626] text-white"
                      : "border border-[#FEE2E2] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
                  }`}
                >
                  ● In Progress ({inProgressCount})
                </button>
              )}
            </div>
          </div>

          {/* Duration Pills */}
          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Test Duration:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDurationFilter("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "all"
                    ? "bg-[#0F172A] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("quick")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "quick"
                    ? "bg-[#4F46E5] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Quick (≤15m)
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("standard")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "standard"
                    ? "bg-[#4F46E5] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Standard (16-60m)
              </button>
              <button
                type="button"
                onClick={() => setDurationFilter("full")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  durationFilter === "full"
                    ? "bg-[#4F46E5] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Full Mock (&gt;60m)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Counter Banner */}
      <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
        <span>
          Showing <strong className="text-[#0F172A]">{filteredTests.length}</strong> of{" "}
          {initialTests.length} tests
        </span>
        {searchQuery && (
          <span>
            Matching query: &ldquo;<strong className="text-[#0F172A]">{searchQuery}</strong>&rdquo;
          </span>
        )}
      </div>

      {/* 4. Tests Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <article
              key={test.id}
              className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition hover:border-[#4F46E5] hover:shadow-md"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-semibold text-[#4F46E5]">
                    {test.examName}
                  </span>
                  {test.maxAttempts !== null && (
                    <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-medium text-[#B45309]">
                      {test.maxAttempts === 1 ? "1 Attempt Only" : `Max ${test.maxAttempts} Attempts`}
                    </span>
                  )}
                  {test.isAttemptLimitReached && (
                    <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-medium text-[#DC2626]">
                      Limit Reached
                    </span>
                  )}
                  {test.attemptStatus === "in_progress" && (
                    <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-medium text-[#DC2626]">
                      ● In Progress
                    </span>
                  )}
                  {test.attemptStatus === "submitted" && !test.isAttemptLimitReached && (
                    <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
                      ✓ Completed
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-lg font-bold text-[#0F172A] leading-6">{test.name}</h2>
                {test.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">
                    {test.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F1F5F9] pt-3 text-xs text-[#64748B]">
                  <div>
                    <span>Duration: </span>
                    <strong className="text-[#0F172A]">{test.durationMinutes} mins</strong>
                  </div>
                  <div>
                    <span>Questions: </span>
                    <strong className="text-[#0F172A]">{test.questionCount}</strong>
                  </div>
                  <div>
                    <span>Total marks: </span>
                    <strong className="text-[#0F172A]">{test.totalMarks ?? "--"}</strong>
                  </div>
                  <div>
                    <span>Passing: </span>
                    <strong className="text-[#0F172A]">{test.passingMarks ?? "--"}</strong>
                  </div>
                </div>

                {test.highlightScorePercent !== null && (
                  <div className="mt-3 rounded-lg bg-[#F8FAFC] p-2.5 text-xs text-[#64748B] flex items-center justify-between border border-[#E2E8F0]">
                    <span>{test.highlightScoreLabel}:</span>
                    <span className="font-bold text-[#4F46E5]">
                      {test.highlightScorePercent}% ({test.attemptsCount} attempt{test.attemptsCount > 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-[#F1F5F9] pt-4">
                {test.attemptStatus === "in_progress" ? (
                  <Link
                    href={`/test/${test.id}`}
                    className="block w-full rounded-lg bg-[#4F46E5] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#4338CA]"
                  >
                    Resume Attempt
                  </Link>
                ) : test.isAttemptLimitReached ? (
                  <Link
                    href={`/test/${test.id}/result`}
                    className="block w-full rounded-lg border border-[#4F46E5] py-2.5 text-center text-sm font-semibold text-[#4F46E5] transition hover:bg-[#EEF2FF]"
                  >
                    Review Past Results (Limit Reached)
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href={`/test/${test.id}/instructions`}
                      className="flex-1 rounded-lg bg-[#4F46E5] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#4338CA]"
                    >
                      {test.attemptsCount > 0 ? "Retake Test" : "Start Test"}
                    </Link>
                    {test.attemptsCount > 0 && (
                      <Link
                        href={`/test/${test.id}/result`}
                        className="rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-center text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
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
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-xl text-[#64748B]">
            🔍
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#0F172A]">No tests match your criteria</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Try adjusting your search terms or filter pills to discover available tests.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-5 inline-flex items-center rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338CA]"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
