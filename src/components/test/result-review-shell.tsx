"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { ScoreResult } from "@/lib/scoring/types";
import { BookmarkButton } from "./bookmark-button";
import { MathText } from "@/components/ui/math-text";

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
      <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
        <section className="mx-auto max-w-4xl border border-[#ccd8d4] bg-[#fbfcfb] p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
            Result unavailable
          </p>
          <h1 className="mt-3 text-3xl font-semibold">No submitted attempt found</h1>
          <p className="mt-4 text-[#475467]">
            Complete and submit a test attempt first, then the result will appear here.
          </p>
          <Link
            href={`/test/${testId}`}
            className="mt-6 inline-flex rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
          >
            Return to test
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

  // Pacing Diagnostics
  const totalQuestions = payload.review.length;
  const questionsWithTime = payload.review.map((q, idx) => ({
    ...q,
    index: idx + 1,
    time: q.timeSpentSeconds ?? payload.questionTimeSpent?.[q.questionId] ?? 0,
  }));

  const totalTrackedSeconds = questionsWithTime.reduce((sum, q) => sum + q.time, 0);
  const effectiveTotalSeconds =
    payload.timeTakenSeconds && payload.timeTakenSeconds > 0
      ? payload.timeTakenSeconds
      : totalTrackedSeconds;

  const avgSecondsPerQuestion =
    totalQuestions > 0 ? Math.round(effectiveTotalSeconds / totalQuestions) : 0;

  const correctQuestions = questionsWithTime.filter((q) => q.isCorrect);
  const wrongQuestions = questionsWithTime.filter(
    (q) => q.selectedOptionId !== null && !q.isCorrect,
  );

  const avgCorrectSeconds =
    correctQuestions.length > 0
      ? Math.round(correctQuestions.reduce((sum, q) => sum + q.time, 0) / correctQuestions.length)
      : 0;

  const avgWrongSeconds =
    wrongQuestions.length > 0
      ? Math.round(wrongQuestions.reduce((sum, q) => sum + q.time, 0) / wrongQuestions.length)
      : 0;

  const answeredWithTime = questionsWithTime.filter((q) => q.time > 0);
  const sortedByTime = [...answeredWithTime].sort((a, b) => a.time - b.time);
  const fastest = sortedByTime[0] ?? null;
  const slowest = sortedByTime[sortedByTime.length - 1] ?? null;

  const filteredQuestions = payload.review.filter((question) => {
    if (filter === "correct") return question.isCorrect;
    if (filter === "wrong") return question.selectedOptionId !== null && !question.isCorrect;
    if (filter === "unanswered") return question.selectedOptionId === null;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#f4f6f5] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-6xl">
        {/* 1. Official Print Scorecard Header (Visible ONLY during print / PDF export) */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Mock Test Examination Portal
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
        <div className="flex flex-col gap-4 border-b border-[#ccd8d4] pb-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
              Test result
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{payload.testName}</h1>
            <p className="mt-2 text-[#475467]">
              Attempt submitted. The result was calculated by the submit endpoint.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-xs font-semibold text-[#146b5f] transition hover:bg-[#e6f3ef] print:hidden"
              title="Print scorecard or save as PDF"
            >
              <span>🖨️ Print / Save PDF</span>
            </button>
            <Link
              href="/dashboard/bookmarks"
              className="rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-xs font-semibold text-[#34403c] hover:bg-[#f4f6f5]"
            >
              ★ Saved Bookmarks
            </Link>
            <Link
              href="/dashboard/tests"
              className="rounded-md bg-[#146b5f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#115b51]"
            >
              Take Another Test
            </Link>
          </div>
        </div>

        {/* 3. Performance Scorecard (Formats cleanly on both Web and Print) */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 print:grid-cols-5 print:gap-2 print:border print:border-black print:p-3 print:my-4">
          <ResultStat label="Score" value={`${payload.result.score}/${payload.result.maxScore}`} />
          <ResultStat label="Percentage" value={`${percentage}%`} />
          <ResultStat label="Correct" value={String(payload.result.correctCount)} />
          <ResultStat label="Wrong" value={String(payload.result.wrongCount)} />
          <ResultStat label="Unanswered" value={String(payload.result.unansweredCount)} />
        </div>

        {/* 3.5 Pacing & Time Diagnostics (PRD Section 3 & 4) */}
        <section className="mt-6 rounded-lg border border-[#ccd8d4] bg-white p-5 shadow-sm print:border print:border-black print:p-3 print:my-4">
          <div className="flex flex-col gap-2 border-b border-[#f0f2f5] pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-[#15171a]">
                <span>⏱️ Pacing & Time Diagnostics</span>
              </h2>
              <p className="text-xs text-[#667085]">
                Active time distribution across questions to evaluate speed vs. accuracy
              </p>
            </div>
            <span className="w-fit rounded bg-[#eef5f3] px-2.5 py-1 text-xs font-semibold text-[#146b5f]">
              Total Time: {formatDuration(effectiveTotalSeconds)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded border border-[#d9dee7] bg-[#fbfcfb] p-3">
              <span className="text-xs font-semibold uppercase text-[#667085]">Avg Time / Question</span>
              <p className="mt-1 text-xl font-bold text-[#15171a]">{formatDuration(avgSecondsPerQuestion)}</p>
              <p className="text-[11px] text-[#667085]">Across all {totalQuestions} questions</p>
            </div>

            <div className="rounded border border-[#d9dee7] bg-[#fbfcfb] p-3">
              <span className="text-xs font-semibold uppercase text-[#146b5f]">Avg on Correct Qs</span>
              <p className="mt-1 text-xl font-bold text-[#146b5f]">{formatDuration(avgCorrectSeconds)}</p>
              <p className="text-[11px] text-[#667085]">{correctQuestions.length} correct responses</p>
            </div>

            <div className="rounded border border-[#d9dee7] bg-[#fbfcfb] p-3">
              <span className="text-xs font-semibold uppercase text-[#a3412f]">Avg on Wrong Qs</span>
              <p className="mt-1 text-xl font-bold text-[#a3412f]">{formatDuration(avgWrongSeconds)}</p>
              <p className="text-[11px] text-[#667085]">{wrongQuestions.length} incorrect responses</p>
            </div>

            <div className="rounded border border-[#d9dee7] bg-[#fbfcfb] p-3">
              <span className="text-xs font-semibold uppercase text-[#667085]">Fastest & Slowest Pace</span>
              <p className="mt-1 text-xs font-semibold text-[#15171a]">
                ⚡ Fastest: {fastest ? `Q${fastest.index} (${formatDuration(fastest.time)})` : "--"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#667085]">
                🐢 Slowest: {slowest ? `Q${slowest.index} (${formatDuration(slowest.time)})` : "--"}
              </p>
            </div>
          </div>
        </section>

        {/* 4. PRD Section 24: Answer Review Filters (Hidden on print) */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#dbe3e0] pb-4 print:hidden">
          <span className="mr-2 text-xs font-bold uppercase tracking-wider text-[#667085]">
            Filter Questions:
          </span>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-[#146b5f] text-white"
                : "border border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f0f3f1]"
            }`}
          >
            All ({payload.review.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("correct")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "correct"
                ? "bg-[#146b5f] text-white"
                : "border border-[#ccd8d4] bg-white text-[#146b5f] hover:bg-[#e6f3ef]"
            }`}
          >
            ✓ Correct ({correctCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("wrong")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "wrong"
                ? "bg-[#a3412f] text-white"
                : "border border-[#ccd8d4] bg-white text-[#a3412f] hover:bg-[#f8e9e5]"
            }`}
          >
            ✕ Wrong ({wrongCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unanswered")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === "unanswered"
                ? "bg-[#765a22] text-white"
                : "border border-[#ccd8d4] bg-white text-[#765a22] hover:bg-[#f0ede6]"
            }`}
          >
            ○ Unanswered ({unansweredCount})
          </button>
        </div>

        {/* 5. Detailed Question & Solution Breakdown */}
        <section className="mt-6 space-y-4 print:mt-4 print:space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="border border-dashed border-[#ccd8d4] bg-[#fbfcfb] p-8 text-center text-[#667085]">
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
                  className="print-avoid-break border border-[#ccd8d4] bg-[#fbfcfb] p-5 print:border-gray-400 print:bg-white print:p-4 print:mb-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="max-w-3xl text-lg font-semibold leading-7 print:text-base">
                      {originalIndex}. <MathText text={question.questionText} />
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      {questionTime > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#ccd8d4] bg-white px-2.5 py-1 text-xs font-semibold text-[#475467] print:text-[10px]">
                          ⏱️ {formatDuration(questionTime)}
                        </span>
                      )}
                      <span className="print:hidden">
                        <BookmarkButton questionId={question.questionId} />
                      </span>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-sm font-semibold print:text-xs print:border ${
                          question.selectedOptionId === null
                            ? "bg-[#f0ede6] text-[#765a22] print:border-gray-400 print:bg-gray-100"
                            : question.isCorrect
                              ? "bg-[#e6f3ef] text-[#146b5f] print:border-green-600 print:bg-green-50"
                              : "bg-[#f8e9e5] text-[#a3412f] print:border-red-600 print:bg-red-50"
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
                    <div className="rounded border border-[#e5e7eb] p-2.5 print:border-gray-300">
                      <dt className="text-xs font-semibold text-[#667085]">Your Answer</dt>
                      <dd className="mt-1 font-semibold text-[#15171a]">
                        <MathText text={question.selectedOptionText ?? "Not answered"} />
                      </dd>
                    </div>
                    <div className="rounded border border-[#92b8ad] bg-[#f2f8f6] p-2.5 print:border-gray-300 print:bg-white">
                      <dt className="text-xs font-semibold text-[#146b5f]">Correct Answer</dt>
                      <dd className="mt-1 font-semibold text-[#146b5f]">
                        <MathText text={question.correctOptionText} />
                      </dd>
                    </div>
                  </dl>
                  {question.explanation ? (
                    <div className="mt-4 border-t border-[#dbe3e0] pt-3 text-sm leading-6 text-[#475467] print:mt-2 print:pt-2 print:text-xs">
                      <strong className="text-[#34403c]">Explanation: </strong>
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
    <div className="border border-[#ccd8d4] bg-[#fbfcfb] p-4">
      <p className="text-sm text-[#667085]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
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
