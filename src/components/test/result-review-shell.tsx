"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { ScoreResult } from "@/lib/scoring/types";
import { BookmarkButton } from "./bookmark-button";
import { MathText } from "@/components/ui/math-text";
import { PacingBarChart } from "./pacing-bar-chart";
import {
  calculatePacingAnalytics,
  type PacingQuestionItem,
} from "@/lib/test-engine/pacing";

type ReviewQuestion = {
  questionId: string;
  questionText: string;
  explanation: string | null;
  correctOptionId: string;
  correctOptionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  isCorrect: boolean;
  timeSpentSeconds?: number;
};

export type ResultPayload = {
  attemptId?: string;
  testId: string;
  testName: string;
  submittedAt: string | null;
  result: ScoreResult;
  timeTakenSeconds?: number;
  questionTimeSpent?: Record<string, number>;
  review: ReviewQuestion[];
};

type ResultReviewShellProps = {
  testId: string;
  serverPayload?: ResultPayload | null;
};

const resultCache = new Map<
  string,
  {
    raw: string;
    payload: ResultPayload | null;
  }
>();

export function ResultReviewShell({ testId, serverPayload }: ResultReviewShellProps) {
  const localPayload = useSyncExternalStore(
    subscribeToStorage,
    () => readLocalResult(testId),
    () => null,
  );
  const payload = serverPayload ?? localPayload;

  if (!payload) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-6 py-8 text-[#0F172A]">
        <section className="mx-auto max-w-4xl rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
            Result Unavailable
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[#0F172A]">No submitted attempt found</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Complete and submit a test attempt first, then your evaluation will appear here.
          </p>
          <Link
            href={`/test/${testId}`}
            className="mt-6 inline-flex rounded-xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#4338CA]"
          >
            Return to Test
          </Link>
        </section>
      </main>
    );
  }

  const percentage =
    payload.result.maxScore > 0
      ? Math.round((payload.result.score / payload.result.maxScore) * 100)
      : 0;

  const [filter, setFilter] = useState<"all" | "correct" | "wrong" | "unanswered">("all");

  const correctCount = payload.review.filter((q) => q.isCorrect).length;
  const wrongCount = payload.review.filter((q) => q.selectedOptionId !== null && !q.isCorrect).length;
  const unansweredCount = payload.review.filter((q) => q.selectedOptionId === null).length;

  // Pacing Diagnostics & Analytics
  const pacingQuestions: PacingQuestionItem[] = payload.review.map((q, idx) => ({
    questionId: q.questionId,
    index: idx + 1,
    timeSpentSeconds: q.timeSpentSeconds ?? payload.questionTimeSpent?.[q.questionId] ?? 0,
    isCorrect: q.isCorrect,
    isAnswered: q.selectedOptionId !== null,
    questionText: q.questionText,
  }));

  const pacingAnalytics = calculatePacingAnalytics(pacingQuestions);
  const totalQuestions = pacingAnalytics.totalQuestions;
  const effectiveTotalSeconds =
    payload.timeTakenSeconds && payload.timeTakenSeconds > 0
      ? payload.timeTakenSeconds
      : pacingAnalytics.totalTimeSeconds;
  const avgSecondsPerQuestion = pacingAnalytics.averageSecondsPerQuestion;
  const avgCorrectSeconds = pacingAnalytics.averageCorrectSeconds;
  const avgWrongSeconds = pacingAnalytics.averageWrongSeconds;
  const fastest = pacingAnalytics.fastestQuestion
    ? { index: pacingAnalytics.fastestQuestion.index, time: pacingAnalytics.fastestQuestion.timeSpentSeconds }
    : null;
  const slowest = pacingAnalytics.slowestQuestion
    ? { index: pacingAnalytics.slowestQuestion.index, time: pacingAnalytics.slowestQuestion.timeSpentSeconds }
    : null;
  const timeTrapIds = new Set(pacingAnalytics.timeTraps.map((t) => t.questionId));
  const quickWinIds = new Set(pacingAnalytics.quickWins.map((w) => w.questionId));

  const filteredQuestions = payload.review.filter((question) => {
    if (filter === "correct") return question.isCorrect;
    if (filter === "wrong") return question.selectedOptionId !== null && !question.isCorrect;
    if (filter === "unanswered") return question.selectedOptionId === null;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-8 text-[#0F172A]">
      <section className="mx-auto max-w-6xl">
        {/* 1. Official Print Scorecard Header (Visible ONLY during print / PDF export) */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Competitive Mock Test Examination Portal
              </p>
              <h1 className="mt-1 text-2xl font-bold text-black">{payload.testName}</h1>
              <p className="text-xs text-gray-700">Official Examination Scorecard & Solution Report</p>
            </div>
            <div className="text-right text-xs text-gray-700">
              <p>Date: {payload.submittedAt ? new Date(payload.submittedAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              <p>Status: Completed / Evaluated</p>
            </div>
          </div>
        </div>

        {/* 2. Interactive Web Header (Hidden on print) */}
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Examination Evaluation
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A]">{payload.testName}</h1>
            <p className="mt-2 text-sm text-[#64748B]">
              Attempt evaluated with tamper-proof server-side negative marking logic.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#4F46E5] shadow-xs transition hover:bg-[#EEF2FF] print:hidden"
              title="Print scorecard or save as PDF"
            >
              <span>🖨️ Print / Save PDF</span>
            </button>
            <Link
              href="/dashboard/bookmarks"
              className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC]"
            >
              ★ Saved Bookmarks
            </Link>
            <Link
              href="/dashboard/tests"
              className="rounded-lg bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#4338CA]"
            >
              Take Another Test
            </Link>
          </div>
        </div>

        {/* 3. Performance Scorecard */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 print:grid-cols-5 print:gap-2 print:border print:border-black print:p-3 print:my-4">
          <ResultStat label="Score" value={`${payload.result.score}/${payload.result.maxScore}`} />
          <ResultStat label="Percentage" value={`${percentage}%`} />
          <ResultStat label="Correct" value={String(payload.result.correctCount)} />
          <ResultStat label="Wrong" value={String(payload.result.wrongCount)} />
          <ResultStat label="Unanswered" value={String(payload.result.unansweredCount)} />
        </div>

        {/* 3.5 Pacing & Time Diagnostics */}
        <section className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs print:border print:border-black print:p-3 print:my-4">
          <div className="flex flex-col gap-2 border-b border-[#F1F5F9] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
                <span>⏱️ Pacing & Time Diagnostics</span>
              </h2>
              <p className="text-xs text-[#64748B]">
                Active time distribution across questions to evaluate speed vs. accuracy
              </p>
            </div>
            <span className="w-fit rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4F46E5]">
              Total Time: {formatDuration(effectiveTotalSeconds)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <span className="text-xs font-semibold uppercase text-[#64748B]">Avg Time / Question</span>
              <p className="mt-1 text-xl font-bold text-[#0F172A]">{formatDuration(avgSecondsPerQuestion)}</p>
              <p className="text-[11px] text-[#64748B]">Across all {totalQuestions} questions</p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <span className="text-xs font-semibold uppercase text-[#16A34A]">Avg on Correct Qs</span>
              <p className="mt-1 text-xl font-bold text-[#16A34A]">{formatDuration(avgCorrectSeconds)}</p>
              <p className="text-[11px] text-[#64748B]">{correctCount} correct responses</p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <span className="text-xs font-semibold uppercase text-[#DC2626]">Avg on Wrong Qs</span>
              <p className="mt-1 text-xl font-bold text-[#DC2626]">{formatDuration(avgWrongSeconds)}</p>
              <p className="text-[11px] text-[#64748B]">{wrongCount} incorrect responses</p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
              <span className="text-xs font-semibold uppercase text-[#64748B]">Fastest & Slowest Pace</span>
              <p className="mt-1 text-xs font-semibold text-[#0F172A]">
                ⚡ Fastest: {fastest ? `Q${fastest.index} (${formatDuration(fastest.time)})` : "--"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#64748B]">
                🐢 Slowest: {slowest ? `Q${slowest.index} (${formatDuration(slowest.time)})` : "--"}
              </p>
            </div>
          </div>

          {/* Visual Time-Spent-Per-Question Breakdown Chart */}
          <div className="mt-6 border-t border-[#F1F5F9] pt-5 print:hidden">
            <PacingBarChart analytics={pacingAnalytics} questions={pacingQuestions} />
          </div>
        </section>

        {/* 4. Answer Review Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] pb-4 print:hidden">
          <span className="mr-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Filter Questions:
          </span>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#EEF2FF]/40 hover:text-[#0F172A]"
            }`}
          >
            All ({payload.review.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("correct")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "correct"
                ? "bg-[#16A34A] text-white shadow-xs"
                : "border border-[#E2E8F0] bg-white text-[#16A34A] hover:bg-[#DCFCE7]"
            }`}
          >
            ✓ Correct ({correctCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("wrong")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "wrong"
                ? "bg-[#DC2626] text-white shadow-xs"
                : "border border-[#E2E8F0] bg-white text-[#DC2626] hover:bg-[#FEF2F2]"
            }`}
          >
            ✕ Wrong ({wrongCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unanswered")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "unanswered"
                ? "bg-[#F59E0B] text-white shadow-xs"
                : "border border-[#E2E8F0] bg-white text-[#B45309] hover:bg-[#FEF3C7]"
            }`}
          >
            ○ Unanswered ({unansweredCount})
          </button>
        </div>

        {/* 5. Detailed Question & Solution Breakdown */}
        <section className="mt-6 space-y-4 print:mt-4 print:space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-[#64748B]">
              No questions found for the selected &quot;{filter}&quot; filter.
            </div>
          ) : (
            filteredQuestions.map((question) => {
              const originalIndex = payload.review.indexOf(question) + 1;
              const questionTime =
                question.timeSpentSeconds ?? payload.questionTimeSpent?.[question.questionId] ?? 0;
              return (
                <article
                  key={question.questionId}
                  id={`review-question-${question.questionId}`}
                  className="print-avoid-break rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs print:border-gray-400 print:bg-white print:p-4 print:mb-3 scroll-mt-20 transition-all"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="max-w-3xl text-base font-semibold leading-7 text-[#0F172A] print:text-base">
                      {originalIndex}. <MathText text={question.questionText} />
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      {timeTrapIds.has(question.questionId) && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 text-xs font-semibold text-[#DC2626] print:hidden">
                          ⚠️ Time Trap
                        </span>
                      )}
                      {quickWinIds.has(question.questionId) && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-1 text-xs font-semibold text-[#16A34A] print:hidden">
                          ⚡ Quick Win
                        </span>
                      )}
                      {questionTime > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#64748B] print:text-[10px]">
                          ⏱️ {formatDuration(questionTime)}
                        </span>
                      )}
                      <span className="print:hidden">
                        <BookmarkButton questionId={question.questionId} />
                      </span>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold print:text-xs print:border ${
                          question.selectedOptionId === null
                            ? "bg-[#FEF3C7] text-[#B45309] print:border-gray-400 print:bg-gray-100"
                            : question.isCorrect
                              ? "bg-[#DCFCE7] text-[#16A34A] print:border-green-600 print:bg-green-50"
                              : "bg-[#FEF2F2] text-[#DC2626] print:border-red-600 print:bg-red-50"
                        }`}
                      >
                        {question.selectedOptionId === null
                          ? "Unanswered"
                          : question.isCorrect
                            ? "✓ Correct"
                            : "✕ Wrong"}
                      </span>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 print:mt-2 print:gap-2 print:text-xs">
                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 print:border-gray-300">
                      <dt className="text-xs font-semibold text-[#64748B]">Your Answer</dt>
                      <dd className="mt-1 font-semibold text-[#0F172A]">
                        <MathText text={question.selectedOptionText ?? "Not answered"} />
                      </dd>
                    </div>
                    <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-3 print:border-gray-300 print:bg-white">
                      <dt className="text-xs font-semibold text-[#16A34A]">Correct Answer</dt>
                      <dd className="mt-1 font-semibold text-[#16A34A]">
                        <MathText text={question.correctOptionText} />
                      </dd>
                    </div>
                  </dl>
                  {question.explanation ? (
                    <div className="mt-4 border-t border-[#F1F5F9] pt-3 text-sm leading-6 text-[#64748B] print:mt-2 print:pt-2 print:text-xs">
                      <strong className="text-[#0F172A]">Explanation: </strong>
                      <MathText text={question.explanation} as="span" />
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </section>
      </section>
    </main>
  );
}

function subscribeToStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);

  return () => window.removeEventListener("storage", onStoreChange);
}

function readLocalResult(testId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(`mock-test-result:${testId}`);

  if (!stored) {
    resultCache.delete(testId);
    return null;
  }

  const cached = resultCache.get(testId);

  if (cached?.raw === stored) {
    return cached.payload;
  }

  try {
    const payload = JSON.parse(stored) as ResultPayload;

    resultCache.set(testId, {
      raw: stored,
      payload,
    });

    return payload;
  } catch {
    resultCache.set(testId, {
      raw: stored,
      payload: null,
    });

    return null;
  }
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#0F172A]">{value}</p>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
