"use client";

import { useState } from "react";
import type { PacingAnalytics, PacingQuestionItem } from "@/lib/test-engine/pacing";

type PacingBarChartProps = {
  analytics: PacingAnalytics;
  questions: PacingQuestionItem[];
  onSelectQuestion?: (questionId: string) => void;
};

export function PacingBarChart({
  analytics,
  questions,
  onSelectQuestion,
}: PacingBarChartProps) {
  const [hoveredQuestion, setHoveredQuestion] = useState<PacingQuestionItem | null>(null);

  // Find max time for scaling the chart height
  const maxTimeSeconds = Math.max(
    ...questions.map((q) => q.timeSpentSeconds),
    analytics.targetSecondsPerQuestion,
    analytics.averageSecondsPerQuestion,
    60,
  );

  // Target time and average time relative heights (percentage 0 - 100)
  const targetPercent = Math.min(
    100,
    Math.round((analytics.targetSecondsPerQuestion / maxTimeSeconds) * 100),
  );
  const avgPercent = Math.min(
    100,
    Math.round((analytics.averageSecondsPerQuestion / maxTimeSeconds) * 100),
  );

  const timeTrapIds = new Set(analytics.timeTraps.map((q) => q.questionId));
  const quickWinIds = new Set(analytics.quickWins.map((q) => q.questionId));

  function handleBarClick(questionId: string) {
    if (onSelectQuestion) {
      onSelectQuestion(questionId);
    } else {
      const element = document.getElementById(`review-question-${questionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-[#146b5f]", "transition-all");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-[#146b5f]");
        }, 2000);
      }
    }
  }

  function formatTime(seconds: number) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
  }

  return (
    <div className="space-y-6">
      {/* 1. Time Allocation & Efficiency Summary Bar */}
      <div className="rounded-lg border border-[#e4e7ec] bg-[#fbfcfb] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475467]">
            Time Investment Distribution
          </span>
          <span className="text-xs text-[#667085]">
            Total Time: <strong className="text-[#15171a]">{formatTime(analytics.totalTimeSeconds)}</strong>
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[#eaecf0]">
          <div
            style={{ width: `${analytics.timeDistribution.correctPercentage}%` }}
            className="bg-[#146b5f] transition-all"
            title={`Correct: ${formatTime(analytics.timeDistribution.correctSeconds)} (${analytics.timeDistribution.correctPercentage}%)`}
          />
          <div
            style={{ width: `${analytics.timeDistribution.wrongPercentage}%` }}
            className="bg-[#a3412f] transition-all"
            title={`Wrong: ${formatTime(analytics.timeDistribution.wrongSeconds)} (${analytics.timeDistribution.wrongPercentage}%)`}
          />
          <div
            style={{ width: `${analytics.timeDistribution.unansweredPercentage}%` }}
            className="bg-[#98a2b3] transition-all"
            title={`Unanswered: ${formatTime(analytics.timeDistribution.unansweredSeconds)} (${analytics.timeDistribution.unansweredPercentage}%)`}
          />
        </div>

        {/* Legend for the progress bar */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#146b5f]" />
            <span className="text-[#344054]">
              Productive Time: <strong>{analytics.timeDistribution.correctPercentage}%</strong> ({formatTime(analytics.timeDistribution.correctSeconds)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#a3412f]" />
            <span className="text-[#344054]">
              Lost Time (Traps): <strong>{analytics.timeDistribution.wrongPercentage}%</strong> ({formatTime(analytics.timeDistribution.wrongSeconds)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#98a2b3]" />
            <span className="text-[#344054]">
              Indecision Time: <strong>{analytics.timeDistribution.unansweredPercentage}%</strong> ({formatTime(analytics.timeDistribution.unansweredSeconds)})
            </span>
          </div>
        </div>
      </div>

      {/* 2. Detected Insights: Time Traps & Quick Wins */}
      {(analytics.timeTraps.length > 0 || analytics.quickWins.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Time Traps */}
          {analytics.timeTraps.length > 0 && (
            <div className="rounded-lg border border-[#fecdca] bg-[#fffbfa] p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b42318]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fee4e2] text-xs">
                  ⚠️
                </span>
                <span>{analytics.timeTraps.length} Time Trap{analytics.timeTraps.length === 1 ? "" : "s"} Detected</span>
              </div>
              <p className="mt-1 text-xs text-[#7a271a]">
                High time investment with incorrect outcome. Jump to solution:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {analytics.timeTraps.map((trap) => (
                  <button
                    key={trap.questionId}
                    type="button"
                    onClick={() => handleBarClick(trap.questionId)}
                    className="inline-flex items-center gap-1 rounded bg-[#fee4e2] px-2 py-0.5 text-xs font-semibold text-[#b42318] transition hover:bg-[#fecdca]"
                  >
                    Q{trap.index} ({formatTime(trap.timeSpentSeconds)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {analytics.quickWins.length > 0 && (
            <div className="rounded-lg border border-[#a6f4c5] bg-[#f6fef9] p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#027a48]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d1fadf] text-xs">
                  ⚡
                </span>
                <span>{analytics.quickWins.length} Quick Win{analytics.quickWins.length === 1 ? "" : "s"} Detected</span>
              </div>
              <p className="mt-1 text-xs text-[#05603a]">
                Fast and accurate responses (high efficiency):
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {analytics.quickWins.map((win) => (
                  <button
                    key={win.questionId}
                    type="button"
                    onClick={() => handleBarClick(win.questionId)}
                    className="inline-flex items-center gap-1 rounded bg-[#d1fadf] px-2 py-0.5 text-xs font-semibold text-[#027a48] transition hover:bg-[#a6f4c5]"
                  >
                    Q{win.index} ({formatTime(win.timeSpentSeconds)})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Interactive Question-by-Question Pacing Bar Chart */}
      <div className="rounded-lg border border-[#e4e7ec] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#15171a]">
              Pacing Timeline (Click any bar to jump to solution)
            </h3>
            <p className="text-xs text-[#667085]">
              Height represents time spent on each question.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#146b5f]" /> Correct
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#a3412f]" /> Wrong
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#98a2b3]" /> Unanswered
            </span>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative mt-6 pt-6 pb-2">
          {/* Target Benchmark Line */}
          {targetPercent > 0 && targetPercent < 100 && (
            <div
              style={{ bottom: `${targetPercent}%` }}
              className="absolute left-0 right-0 z-0 flex items-center border-b border-dashed border-[#b54708] pointer-events-none"
            >
              <span className="rounded bg-[#fffaeb] px-1.5 py-0.5 text-[10px] font-bold text-[#b54708] shadow-sm">
                Target: {formatTime(analytics.targetSecondsPerQuestion)}
              </span>
            </div>
          )}

          {/* Average Benchmark Line (if significantly different from target) */}
          {Math.abs(avgPercent - targetPercent) > 10 && avgPercent > 0 && (
            <div
              style={{ bottom: `${avgPercent}%` }}
              className="absolute left-0 right-0 z-0 flex items-center border-b border-dotted border-[#475467] pointer-events-none"
            >
              <span className="rounded bg-[#f2f4f7] px-1.5 py-0.5 text-[10px] font-medium text-[#475467] shadow-sm">
                Avg: {formatTime(analytics.averageSecondsPerQuestion)}
              </span>
            </div>
          )}

          {/* Bars Container */}
          <div className="relative z-10 flex h-48 items-end gap-2 overflow-x-auto px-2 pb-2">
            {questions.map((q) => {
              const heightPercent = maxTimeSeconds > 0
                ? Math.max(8, Math.round((q.timeSpentSeconds / maxTimeSeconds) * 100))
                : 8;

              const isTrap = timeTrapIds.has(q.questionId);
              const isWin = quickWinIds.has(q.questionId);

              let barBg = "bg-[#98a2b3] hover:bg-[#667085]"; // unanswered
              if (q.isCorrect) {
                barBg = "bg-[#146b5f] hover:bg-[#0f544a]";
              } else if (q.isAnswered) {
                barBg = "bg-[#a3412f] hover:bg-[#853123]";
              }

              return (
                <div
                  key={q.questionId}
                  className="group relative flex flex-1 flex-col items-center justify-end h-full min-w-[36px]"
                  onMouseEnter={() => setHoveredQuestion(q)}
                  onMouseLeave={() => setHoveredQuestion(null)}
                >
                  {/* Status Indicator / Badge on Top */}
                  <div className="mb-1 flex items-center justify-center h-5">
                    {isTrap ? (
                      <span className="text-xs" title="Time Trap!">⚠️</span>
                    ) : isWin ? (
                      <span className="text-xs" title="Quick Win!">⚡</span>
                    ) : null}
                  </div>

                  {/* Interactive Bar */}
                  <button
                    type="button"
                    onClick={() => handleBarClick(q.questionId)}
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-md transition-all duration-200 cursor-pointer ${barBg} ${
                      hoveredQuestion?.questionId === q.questionId
                        ? "ring-2 ring-offset-1 ring-[#15171a]"
                        : ""
                    }`}
                  >
                    <span className="sr-only">
                      Question {q.index}: {formatTime(q.timeSpentSeconds)}, {q.isCorrect ? "Correct" : q.isAnswered ? "Wrong" : "Unanswered"}
                    </span>
                  </button>

                  {/* Question Index Label */}
                  <span className="mt-2 text-xs font-semibold text-[#475467]">
                    Q{q.index}
                  </span>
                  <span className="text-[10px] text-[#98a2b3]">
                    {formatTime(q.timeSpentSeconds)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hovered Question Detail Card */}
        {hoveredQuestion && (
          <div className="mt-3 rounded border border-[#eaecf0] bg-[#f8f9fa] p-2.5 text-xs text-[#344054] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <strong className="text-[#15171a]">Question {hoveredQuestion.index}:</strong>
              <span>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    hoveredQuestion.isCorrect
                      ? "text-[#146b5f]"
                      : hoveredQuestion.isAnswered
                      ? "text-[#a3412f]"
                      : "text-[#765a22]"
                  }`}
                >
                  {hoveredQuestion.isCorrect ? "✓ Correct" : hoveredQuestion.isAnswered ? "✕ Incorrect" : "○ Unanswered"}
                </span>
              </span>
              <span>•</span>
              <span>Time Spent: <strong>{formatTime(hoveredQuestion.timeSpentSeconds)}</strong></span>
              {hoveredQuestion.timeSpentSeconds > analytics.averageSecondsPerQuestion && (
                <span className="text-[#b54708]">
                  (+{formatTime(hoveredQuestion.timeSpentSeconds - analytics.averageSecondsPerQuestion)} above avg)
                </span>
              )}
            </div>
            <span className="text-[#146b5f] font-medium underline cursor-pointer">
              Click to view question & solution →
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
