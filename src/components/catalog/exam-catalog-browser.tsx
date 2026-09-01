"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CatalogExam } from "@/lib/content/catalog";

type ExamCatalogBrowserProps = {
  initialExams: CatalogExam[];
};

// Categorization helper based on keywords
function getExamCategory(exam: CatalogExam): string {
  const text = `${exam.name} ${exam.description ?? ""} ${exam.slug}`.toLowerCase();
  if (text.includes("ssc") || text.includes("staff selection") || text.includes("cgl") || text.includes("chsl")) {
    return "Staff Selection (SSC)";
  }
  if (text.includes("bank") || text.includes("ibps") || text.includes("sbi") || text.includes("rbi") || text.includes("po") || text.includes("clerk")) {
    return "Banking & Finance";
  }
  if (text.includes("railway") || text.includes("rrb") || text.includes("ntpc") || text.includes("group d")) {
    return "Railways (RRB)";
  }
  if (text.includes("civil") || text.includes("upsc") || text.includes("psc") || text.includes("ias") || text.includes("state")) {
    return "Civil Services & State";
  }
  if (text.includes("defence") || text.includes("nda") || text.includes("cds") || text.includes("afcat") || text.includes("police")) {
    return "Defense & Police";
  }
  return "General & Others";
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
      <div className="rounded-xl border border-[#d9dee7] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Instant Search Input */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#98a2b3]">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exams by name, code, or description (e.g., SSC CGL, Quantitative)..."
              className="w-full rounded-lg border border-[#ccd8d4] bg-[#fbfcfb] py-2.5 pl-10 pr-10 text-sm placeholder-[#98a2b3] transition focus:border-[#146b5f] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#146b5f]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-[#667085] hover:text-[#15171a]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-sm text-[#475467]">
            <span className="whitespace-nowrap font-medium text-xs uppercase tracking-wider text-[#667085]">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "tests" | "questions")}
              className="rounded-lg border border-[#ccd8d4] bg-white px-3 py-2 text-xs font-semibold text-[#34403c] transition focus:border-[#146b5f] focus:outline-none"
            >
              <option value="name">Alphabetical (A-Z)</option>
              <option value="tests">Most Tests</option>
              <option value="questions">Most Questions</option>
            </select>
          </div>
        </div>

        {/* 2. Category / Track Filter Pills */}
        <div className="mt-4 border-t border-[#f0f2f5] pt-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Filter by Category:
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-[#146b5f] hover:underline"
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
                  ? "bg-[#146b5f] text-white shadow-sm"
                  : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5] hover:text-[#15171a]"
              }`}
            >
              All Exams ({initialExams.length})
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
                      ? "bg-[#146b5f] text-white shadow-sm"
                      : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5] hover:text-[#15171a]"
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
      <div className="flex items-center justify-between text-xs font-medium text-[#667085]">
        <span>
          Showing <strong className="text-[#15171a]">{filteredExams.length}</strong> of{" "}
          {initialExams.length} exam series
        </span>
        {searchQuery && (
          <span>
            Search results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
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
                className="group flex flex-col justify-between rounded-xl border border-[#d9dee7] bg-white p-6 shadow-sm transition hover:border-[#146b5f] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-[#eef5f3] px-2.5 py-1 text-xs font-bold text-[#146b5f]">
                      {category}
                    </span>
                    <span className="rounded border border-[#ccd8d4] bg-[#fbfcfb] px-2.5 py-0.5 text-xs font-medium text-[#475467]">
                      {exam.testCount} {exam.testCount === 1 ? "Test" : "Tests"} Available
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-[#15171a] group-hover:text-[#146b5f] transition-colors">
                    {exam.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#475467] line-clamp-3">
                    {exam.description ?? "Full-length mock tests and topic-wise practice sets."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#f0f2f5] pt-4 text-xs font-semibold">
                  <span className="text-[#667085]">
                    📚 {exam.questionCount} Practice Question{exam.questionCount === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-1 text-[#146b5f] group-hover:translate-x-1 transition-transform">
                    Explore Test Series ➔
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#ccd8d4] bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f6f5] text-xl text-[#667085]">
            🔍
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#15171a]">No examinations found</h3>
          <p className="mt-1 text-sm text-[#667085]">
            No exam matches your current filter or search criteria.
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
