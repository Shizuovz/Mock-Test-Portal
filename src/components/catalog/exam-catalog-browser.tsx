"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CatalogExam } from "@/lib/content/catalog";

type ExamCatalogBrowserProps = {
  initialExams: CatalogExam[];
};

// Categorization helper tailored for NSSB, SSC, NPSC and State exams
function getExamCategory(exam: CatalogExam): string {
  const text = `${exam.name} ${exam.description ?? ""} ${exam.slug}`.toLowerCase();
  if (text.includes("nssb") || text.includes("nagaland staff")) {
    return "NSSB (Nagaland Staff Selection)";
  }
  if (text.includes("npsc") || text.includes("nagaland public") || text.includes("ncs") || text.includes("nps")) {
    return "NPSC (Nagaland PSC)";
  }
  if (
    text.includes("ssc") ||
    text.includes("staff selection") ||
    text.includes("cgl") ||
    text.includes("chsl") ||
    text.includes("mts") ||
    text.includes("gd constable")
  ) {
    return "Staff Selection (SSC)";
  }
  if (text.includes("civil") || text.includes("upsc") || text.includes("psc") || text.includes("state")) {
    return "Civil Services & State PSC";
  }
  if (text.includes("bank") || text.includes("ibps") || text.includes("sbi") || text.includes("rbi")) {
    return "Banking & Finance";
  }
  if (text.includes("railway") || text.includes("rrb") || text.includes("ntpc")) {
    return "Railways (RRB)";
  }
  return "General & Departmental";
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NSSB, SSC, NPSC exams (e.g. NSSB CGL, SSC Tier-I, NPSC Prelims)..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-10 text-sm text-[#0F172A] placeholder-[#64748B] transition focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-sm text-[#0F172A]">
            <span className="whitespace-nowrap font-medium text-xs uppercase tracking-wider text-[#64748B]">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "tests" | "questions")}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] transition focus:border-[#4F46E5] focus:outline-none"
            >
              <option value="name">Alphabetical (A-Z)</option>
              <option value="tests">Most Tests</option>
              <option value="questions">Most Questions</option>
            </select>
          </div>
        </div>

        {/* 2. Category / Track Filter Pills */}
        <div className="mt-4 border-t border-[#F1F5F9] pt-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Filter by Category:
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#EEF2FF]/40 hover:text-[#0F172A]"
              }`}
            >
              All Examinations ({initialExams.length})
            </button>

            {availableCategories.map((cat) => {
              const count = initialExams.filter((e) => getExamCategory(e) === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? "all" : cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-[#4F46E5] text-white shadow-xs"
                      : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#EEF2FF]/40 hover:text-[#0F172A]"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header Counter */}
      <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
        <span>
          Showing <strong className="text-[#0F172A]">{filteredExams.length}</strong> of{" "}
          {initialExams.length} examination tracks
        </span>
        {searchQuery && (
          <span>
            Search results for &ldquo;<strong className="text-[#0F172A]">{searchQuery}</strong>&rdquo;
          </span>
        )}
      </div>

      {/* 3. Filtered Exam Cards Grid */}
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
                    {exam.description ?? "Full-length mock tests, negative marking, and topic-wise practice sets."}
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
          <h3 className="mt-4 text-base font-semibold text-[#0F172A]">No examinations found</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            No exam matches your current search criteria. Try searching for &ldquo;NSSB&rdquo;, &ldquo;SSC&rdquo;, or &ldquo;NPSC&rdquo;.
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
