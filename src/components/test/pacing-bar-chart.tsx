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
        element.classList.add("ring-2", "ring-[#4F46E5]", "transition-all");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-[#4F46E5]");
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
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Time Investment Distribution
          </span>
          <span className="text-xs text-[#64748B]">
            Total Time: <strong className="text-[#0F172A]">{formatTime(analytics.totalTimeSeconds)}</strong>
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
          <div
            style={{ width: `${analytics.timeDistribution.correctPercentage}%` }}
            className="bg-[#16A34A] transition-all"
            title={`Correct: ${formatTime(analytics.timeDistribution.correctSeconds)} (${analytics.timeDistribution.correctPercentage}%)`}
          />
          <div
            style={{ width: `${analytics.timeDistribution.wrongPercentage}%` }}
            className="bg-[#DC2626] transition-all"
            title={`Wrong: ${formatTime(analytics.timeDistribution.wrongSeconds)} (${analytics.timeDistribution.wrongPercentage}%)`}
          />
          <div
            style={{ width: `${analytics.timeDistribution.unansweredPercentage}%` }}
            className="bg-[#CBD5E1] transition-all"
            title={`Unanswered: ${formatTime(analytics.timeDistribution.unansweredSeconds)} (${analytics.timeDistribution.unansweredPercentage}%)`}
          />
        </div>

        {/* Legend for the progress bar */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
            <span className="text-[#0F172A]">
              Productive Time: <strong>{analytics.timeDistribution.correctPercentage}%</strong> ({formatTime(analytics.timeDistribution.correctSeconds)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            <span className="text-[#0F172A]">
              Lost Time (Traps): <strong>{analytics.timeDistribution.wrongPercentage}%</strong> ({formatTime(analytics.timeDistribution.wrongSeconds)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#CBD5E1]" />
            <span className="text-[#64748B]">
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
            <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow-xs">
                  ⚠️
                </span>
                <span>{analytics.timeTraps.length} Time Trap{analytics.timeTraps.length === 1 ? "" : "s"} Detected</span>
              </div>
              <p className="mt-1 text-xs text-[#DC2626]/90">
                High time investment with incorrect outcome. Jump to solution:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {analytics.timeTraps.map((trap) => (
                  <button
                    key={trap.questionId}
                    type="button"
                    onClick={() => handleBarClick(trap.questionId)}
                    className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-semibold text-[#DC2626] border border-[#FECACA] shadow-xs transition hover:bg-[#FEE2E2]"
                  >
                    Q{trap.index} ({formatTime(trap.timeSpentSeconds)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {analytics.quickWins.length > 0 && (
            <div className="rounded-xl border border-[#BBF7D0] bg-[#DCFCE7] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow-xs">
                  ⚡
                </span>
                <span>{analytics.quickWins.length} Quick Win{analytics.quickWins.length === 1 ? "" : "s"} Detected</span>
              </div>
              <p className="mt-1 text-xs text-[#16A34A]/90">
                Fast and accurate responses (high efficiency):
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {analytics.quickWins.map((win) => (
                  <button
                    key={win.questionId}
                    type="button"
                    onClick={() => handleBarClick(win.questionId)}
                    className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-semibold text-[#16A34A] border border-[#BBF7D0] shadow-xs transition hover:bg-[#BBF7D0]"
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
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Pacing Timeline (Click any bar to jump to solution)
            </h3>
            <p className="text-xs text-[#64748B]">
              Height represents time spent on each question.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#16A34A]" /> Correct
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#DC2626]" /> Wrong
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#CBD5E1]" /> Unanswered
            </span>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative mt-6 pt-6 pb-2">
          {/* Target Benchmark Line */}
          {targetPercent > 0 && targetPercent < 100 && (
            <div
              style={{ bottom: `${targetPercent}%` }}
              className="absolute left-0 right-0 z-0 flex items-center border-b border-dashed border-[#4F46E5] pointer-events-none"
            >
              <span className="rounded bg-[#EEF2FF] px-1.5 py-0.5 text-[10px] font-bold text-[#4F46E5] shadow-xs">
                Target: {formatTime(analytics.targetSecondsPerQuestion)}
              </span>
            </div>
          )}

          {/* Average Benchmark Line */}
          {Math.abs(avgPercent - targetPercent) > 10 && avgPercent > 0 && (
            <div
              style={{ bottom: `${avgPercent}%` }}
              className="absolute left-0 right-0 z-0 flex items-center border-b border-dotted border-[#64748B] pointer-events-none"
            >
              <span className="rounded bg-[#F8FAFC] px-1.5 py-0.5 text-[10px] font-medium text-[#64748B] shadow-xs">
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

              let barBg = "bg-[#CBD5E1] hover:bg-[#94A3B8]"; // unanswered
              if (q.isCorrect) {
                barBg = "bg-[#16A34A] hover:bg-[#15803D]";
              } else if (q.isAnswered) {
                barBg = "bg-[#DC2626] hover:bg-[#B91C1C]";
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
                        ? "ring-2 ring-offset-1 ring-[#0F172A]"
                        : ""
                    }`}
                  >
                    <span className="sr-only">
                      Question {q.index}: {formatTime(q.timeSpentSeconds)}, {q.isCorrect ? "Correct" : q.isAnswered ? "Wrong" : "Unanswered"}
                    </span>
                  </button>

                  {/* Question Index Label */}
                  <span className="mt-2 text-xs font-semibold text-[#0F172A]">
                    Q{q.index}
                  </span>
                  <span className="text-[10px] text-[#64748B]">
                    {formatTime(q.timeSpentSeconds)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hovered Question Detail Card */}
        {hoveredQuestion && (
          <div className="mt-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <strong className="text-[#0F172A]">Question {hoveredQuestion.index}:</strong>
              <span>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    hoveredQuestion.isCorrect
                      ? "text-[#16A34A]"
                      : hoveredQuestion.isAnswered
                      ? "text-[#DC2626]"
                      : "text-[#F59E0B]"
                  }`}
                >
                  {hoveredQuestion.isCorrect ? "✓ Correct" : hoveredQuestion.isAnswered ? "✕ Incorrect" : "○ Unanswered"}
                </span>
              </span>
              <span>•</span>
              <span>Time Spent: <strong>{formatTime(hoveredQuestion.timeSpentSeconds)}</strong></span>
              {hoveredQuestion.timeSpentSeconds > analytics.averageSecondsPerQuestion && (
                <span className="text-[#F59E0B]">
                  (+{formatTime(hoveredQuestion.timeSpentSeconds - analytics.averageSecondsPerQuestion)} above avg)
                </span>
              )}
            </div>
            <span className="text-[#4F46E5] font-medium underline cursor-pointer">
              Click to view question & solution →
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
