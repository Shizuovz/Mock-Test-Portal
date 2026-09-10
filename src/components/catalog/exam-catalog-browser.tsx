"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CatalogExam } from "@/lib/content/catalog";

type ExamCatalogBrowserProps = {
  initialExams: CatalogExam[];
};

// Categorization helper tailored exclusively for NSSB exams
function getExamCategory(exam: CatalogExam): string {
  const text = `${exam.name} ${exam.description ?? ""} ${exam.slug}`.toLowerCase();
  if (text.includes("cgl") || text.includes("graduate")) {
    return "NSSB CGL (Graduate Level)";
  }
  if (text.includes("chsl") || text.includes("higher secondary") || text.includes("10+2")) {
    return "NSSB CHSL (10+2 Level)";
  }
  if (text.includes("mts") || text.includes("junior") || text.includes("clerk") || text.includes("division")) {
    return "NSSB Junior Division & MTS";
  }
  if (
    text.includes("geography") ||
    text.includes("gk") ||
    text.includes("general") ||
    text.includes("english") ||
    text.includes("computer") ||
    text.includes("math") ||
    text.includes("reasoning")
  ) {
    return "Subject & Sectional Mocks";
  }
  return "NSSB Mock Series";
}

export function ExamCatalogBrowser({ initialExams }: ExamCatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "tests" | "questions">("name");

  // Dynamically extract categories present in current exams
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    initialExams.forEach((exam) => cats.add(getExamCategory(exam)));
    return Array.from(cats);
  }, [initialExams]);

  // Filtered and sorted exams
  const filteredExams = useMemo(() => {
    return initialExams
      .filter((exam) => {
        // Category filter
        if (selectedCategory !== "all" && getExamCategory(exam) !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = exam.name.toLowerCase().includes(query);
          const matchDesc = (exam.description ?? "").toLowerCase().includes(query);
          const matchSlug = exam.slug.toLowerCase().includes(query);
          return matchName || matchDesc || matchSlug;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "tests") return b.testCount - a.testCount;
        if (sortBy === "questions") return b.questionCount - a.questionCount;
        return a.name.localeCompare(b.name);
      });
  }, [initialExams, selectedCategory, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== "all";

  function handleReset() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("name");
  }

  return (
    <div className="mt-3 space-y-4">
      {/* 1. Streamlined Single-Line Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Instant Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8] text-xs">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NSSB mocks, subjects, or topics..."
            className="w-full rounded-xl border border-[#CBD5E1] bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-2xs transition focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-[#94A3B8] hover:text-[#0F172A]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category & Sort Controls */}
        <div className="flex items-center gap-2">
          {availableCategories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#334155] shadow-2xs transition focus:border-[#2563EB] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories ({initialExams.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({initialExams.filter((e) => getExamCategory(e) === cat).length})
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "tests" | "questions")}
            className="rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#334155] shadow-2xs transition focus:border-[#2563EB] focus:outline-none cursor-pointer"
          >
            <option value="name">Sort: A to Z</option>
            <option value="tests">Sort: Most Tests</option>
            <option value="questions">Sort: Most Questions</option>
          </select>
        </div>
      </div>

      {/* 2. Filtered Exam Cards Grid (Immediate Above-the-Fold Visibility) */}
      {filteredExams.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredExams.map((exam) => {
            const category = getExamCategory(exam);
            return (
              <Link
                key={exam.id}
                href={`/exams/${exam.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition hover:border-[#4F46E5] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#EEF2FF] px-2.5 py-1 text-xs font-bold text-[#4F46E5]">
                      {category}
                    </span>
                    <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-xs font-medium text-[#64748B]">
                      {exam.testCount} {exam.testCount === 1 ? "Test" : "Tests"} Available
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                    {exam.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#64748B] line-clamp-3">
                    {exam.description ?? "Full-length NSSB mock tests, negative marking, and topic-wise practice sets."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#F1F5F9] pt-4 text-xs font-semibold">
                  <span className="text-[#64748B]">
                    📚 {exam.questionCount} Practice Question{exam.questionCount === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-1 text-[#4F46E5] group-hover:translate-x-1 transition-transform">
                    Explore Test Series ➔
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-xl text-[#64748B]">
            🔍
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#0F172A]">No NSSB examinations found</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            No exam matches your current search criteria. Try searching for &ldquo;NSSB&rdquo;, &ldquo;General Knowledge&rdquo;, or &ldquo;Geography&rdquo;.
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
