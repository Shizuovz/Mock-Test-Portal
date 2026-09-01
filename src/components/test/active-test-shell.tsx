"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getRemainingSeconds } from "@/lib/test-engine/timer";
import type { SafeQuestionPayload } from "@/types/models";
import { useTestAttemptStore } from "@/stores/test-attempt-store";
import { MathText } from "@/components/ui/math-text";

type ActiveTestShellProps = {
  attemptId: string;
  testId: string;
  testName: string;
  startedAt: string;
  expiresAt: string;
  initialRemainingSeconds: number;
  questions: SafeQuestionPayload[];
  initialAnswers: Record<string, string>;
  initialMarkedForReview: Record<string, boolean>;
};

export function ActiveTestShell({
  attemptId,
  testId,
  testName,
  startedAt,
  expiresAt,
  initialRemainingSeconds,
  questions,
  initialAnswers,
  initialMarkedForReview,
}: ActiveTestShellProps) {
  const router = useRouter();
  const initAttempt = useTestAttemptStore((s) => s.initAttempt);
  const setActiveQuestion = useTestAttemptStore((s) => s.setActiveQuestion);
  const setIsPaused = useTestAttemptStore((s) => s.setIsPaused);
  const tickActiveQuestion = useTestAttemptStore((s) => s.tickActiveQuestion);
  const getTimeSpent = useTestAttemptStore((s) => s.getTimeSpent);
  const getAllTimeSpent = useTestAttemptStore((s) => s.getAllTimeSpent);

  const [startedAtDate] = useState(() => new Date(startedAt));
  const [expiresAtDate] = useState(() => new Date(expiresAt));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [markedForReview, setMarkedForReview] =
    useState<Record<string, boolean>>(initialMarkedForReview);
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (questions[0]?.id) {
      initial[questions[0].id] = true;
    }
    for (const qId of Object.keys(initialAnswers)) {
      initial[qId] = true;
    }
    for (const qId of Object.keys(initialMarkedForReview)) {
      initial[qId] = true;
    }
    return initial;
  });
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">(
    "idle",
  );
  const MAX_ALLOWED_VIOLATIONS = 3;

  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "submitted" | "failed"
  >("idle");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [activeViolationModal, setActiveViolationModal] = useState<{
    strike: number;
    reason: string;
  } | null>(null);
  const lastViolationTimeRef = useRef<number>(0);
  const autoSubmittedRef = useRef(false);
  const currentQuestion = questions[currentIndex];
  const currentQuestionTime = useTestAttemptStore(
    (s) => (currentQuestion?.id ? s.timeSpentSeconds[currentQuestion.id] ?? 0 : 0),
  );

  useEffect(() => {
    initAttempt(questions.map((q) => q.id));
    if (questions[0]?.id) {
      setActiveQuestion(questions[0].id);
    }
  }, [questions, initAttempt, setActiveQuestion]);

  useEffect(() => {
    function handleVisibilityOrFocus() {
      const isPaused = !document.hasFocus() || document.visibilityState !== "visible";
      setIsPaused(isPaused);
    }

    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("blur", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    const ticker = window.setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        document.hasFocus() &&
        submitState === "idle" &&
        !isDisqualified
      ) {
        tickActiveQuestion();
      }
    }, 1000);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("blur", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.clearInterval(ticker);
    };
  }, [isDisqualified, setIsPaused, submitState, tickActiveQuestion]);

  function goToQuestion(index: number) {
    const targetIndex = Math.max(0, Math.min(questions.length - 1, index));
    setCurrentIndex(targetIndex);
    const targetQuestion = questions[targetIndex];
    if (targetQuestion) {
      setActiveQuestion(targetQuestion.id);
      setVisitedQuestions((prev) =>
        prev[targetQuestion.id] ? prev : { ...prev, [targetQuestion.id]: true },
      );
    }
  }

  const paletteStats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let markedOnly = 0;
    let answeredAndMarked = 0;

    for (const q of questions) {
      const isAns = Boolean(answers[q.id]);
      const isMrk = Boolean(markedForReview[q.id]);
      const isVis = Boolean(visitedQuestions[q.id]);

      if (isAns && isMrk) {
        answeredAndMarked++;
      } else if (!isAns && isMrk) {
        markedOnly++;
      } else if (isAns) {
        answered++;
      } else if (isVis) {
        notAnswered++;
      } else {
        notVisited++;
      }
    }

    return {
      answered,
      notAnswered,
      notVisited,
      markedOnly,
      answeredAndMarked,
    };
  }, [questions, answers, markedForReview, visitedQuestions]);

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((questionId) => answers[questionId]).length,
    [answers],
  );
  const markedCount = useMemo(
    () =>
      Object.keys(markedForReview).filter((questionId) => markedForReview[questionId])
        .length,
    [markedForReview],
  );
  const unansweredCount = questions.length - answeredCount;

  function selectAnswer(questionId: string, optionId: string) {
    if (submitState === "submitted") {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
    void saveAnswer(questionId, optionId, Boolean(markedForReview[questionId]));
  }

  function clearResponse(questionId: string) {
    if (submitState === "submitted") {
      return;
    }

    setAnswers((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    void saveAnswer(questionId, null, Boolean(markedForReview[questionId]));
  }

  function toggleMarkedForReview(questionId: string) {
    if (submitState === "submitted") {
      return;
    }

    const nextValue = !markedForReview[questionId];

    setMarkedForReview((current) => ({
      ...current,
      [questionId]: nextValue,
    }));
    void saveAnswer(questionId, answers[questionId] ?? null, nextValue);
  }

  const submitAttempt = useCallback(async () => {
    if (submitState === "submitting" || submitState === "submitted") {
      return;
    }

    setSubmitState("submitting");
    const timeSpentMap = getAllTimeSpent();

    try {
      const response = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId,
          answers,
          startedAt: startedAtDate.toISOString(),
          submittedAt: new Date().toISOString(),
          questionTimeSpent: timeSpentMap,
        }),
      });

      if (!response.ok) {
        throw new Error("Submit failed");
      }

      const payload = await response.json();
      if (!payload.questionTimeSpent) {
        payload.questionTimeSpent = timeSpentMap;
      }
      window.localStorage.setItem(`mock-test-result:${testId}`, JSON.stringify(payload));
      setSubmitState("submitted");
      router.push(`/test/${testId}/result`);
    } catch {
      setSubmitState("failed");
    }
  }, [answers, attemptId, getAllTimeSpent, router, startedAtDate, submitState, testId]);

  async function saveAnswer(
    questionId: string,
    selectedOptionId: string | null,
    isMarkedForReview: boolean,
  ) {
    setSaveState("saving");

    try {
      const response = await fetch(`/api/attempts/${attemptId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          selectedOptionId,
          isMarkedForReview,
          timeSpentSeconds: getTimeSpent(questionId),
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setSaveState("saved");
    } catch {
      setSaveState("failed");
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      const nextRemainingSeconds = getRemainingSeconds(expiresAtDate);

      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        void submitAttempt();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAtDate, submitAttempt]);

  const recordViolation = useCallback(
    (reason: string) => {
      if (
        submitState === "submitted" ||
        submitState === "submitting" ||
        isDisqualified
      ) {
        return;
      }

      const now = Date.now();
      // Cooldown to prevent duplicate triggers (e.g., blur + visibilitychange firing together)
      if (now - lastViolationTimeRef.current < 1500) {
        return;
      }
      lastViolationTimeRef.current = now;

      setViolationCount((prev) => {
        const next = prev + 1;
        if (next >= MAX_ALLOWED_VIOLATIONS) {
          setIsDisqualified(true);
          setActiveViolationModal(null);
          void submitAttempt();
        } else {
          setActiveViolationModal({
            strike: next,
            reason,
          });
        }
        return next;
      });
    },
    [submitState, isDisqualified, submitAttempt],
  );

  useEffect(() => {
    function handleFullscreenChange() {
      const inFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(inFullscreen);
      if (!inFullscreen && submitState !== "submitted" && isFullscreen) {
        recordViolation("Exited fullscreen examination mode");
      }
    }

    function handleVisibilityChange() {
      if (document.hidden && submitState !== "submitted") {
        recordViolation("Tab switch or browser minimization detected");
      }
    }

    function handleWindowBlur() {
      if (submitState !== "submitted") {
        recordViolation("Window focus lost (switched away to another application)");
      }
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    function handleCopyCut(e: ClipboardEvent) {
      e.preventDefault();
    }

    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      // Block copy, paste, select all, view source, print
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "u", "p", "a"].includes(key)) {
        e.preventDefault();
      }
      // Block F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [submitState, isFullscreen, recordViolation]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  return (
    <main className="min-h-screen select-none bg-[#f4f6f5] px-4 py-5 text-[#15171a] sm:px-6">
      {/* 1. Strike 1 & 2 Blocking Modal */}
      {activeViolationModal && !isDisqualified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border-2 border-[#b42318] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3f2] text-2xl text-[#b42318]">
                ⚠️
              </span>
              <div>
                <h2 className="text-xl font-bold text-[#b42318]">
                  Proctoring Warning {activeViolationModal.strike} of {MAX_ALLOWED_VIOLATIONS}
                </h2>
                <p className="text-xs font-semibold text-[#667085]">
                  Strict Exam Integrity Rule
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[#fef3f2] p-4 text-sm text-[#b42318]">
              <p className="font-semibold">Detected Action:</p>
              <p className="mt-1">{activeViolationModal.reason}</p>
            </div>

            <div className="mt-4 space-y-2 text-sm text-[#475467]">
              <p>
                You have{" "}
                <strong className="text-[#b42318]">
                  {MAX_ALLOWED_VIOLATIONS - activeViolationModal.strike} warning(s)
                </strong>{" "}
                remaining.
              </p>
              <p>
                Switching tabs, minimizing the browser, or leaving the examination window{" "}
                {MAX_ALLOWED_VIOLATIONS - activeViolationModal.strike === 1 ? (
                  <strong className="text-[#b42318]">one more time will immediately terminate and auto-submit your test</strong>
                ) : (
                  "again will result in immediate disqualification"
                )}
                .
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveViolationModal(null);
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                }}
                className="w-full rounded-lg bg-[#146b5f] py-3 text-center text-sm font-bold text-white shadow transition hover:bg-[#0f544a]"
              >
                I Understand — Resume Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Strike 3 Disqualification Modal */}
      {isDisqualified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-xl border-2 border-[#b42318] bg-white p-6 text-center shadow-2xl">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fef3f2] text-3xl text-[#b42318]">
              ⛔
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#b42318]">
              Exam Terminated: Disqualified
            </h2>
            <p className="mt-3 text-sm text-[#475467]">
              You exceeded the maximum allowed limit of {MAX_ALLOWED_VIOLATIONS} proctoring violations
              (tab switching / window unfocusing).
            </p>
            <p className="mt-2 text-xs font-semibold text-[#667085]">
              Your test has been automatically submitted to the server. Processing your score...
            </p>
            <div className="mt-6">
              <div className="mx-auto h-2 w-32 overflow-hidden rounded-full bg-[#fee4e2]">
                <div className="h-full w-full animate-pulse bg-[#b42318]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Paper Overview Modal */}
      {showQuestionPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl border border-[#ccd8d4] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[#15171a]">Full Question Paper Preview</h3>
                <p className="text-xs text-[#667085]">{testName} &bull; {questions.length} Questions</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionPaperModal(false)}
                className="rounded-lg p-2 text-sm font-bold text-[#667085] hover:bg-[#f4f6f5] hover:text-[#15171a]"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="rounded-lg border border-[#e2e8f0] p-4 bg-[#fbfcfb]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#146b5f]">Q{qIdx + 1}.</span>
                    <span className="text-[11px] font-medium text-[#667085]">+{q.marks} Marks</span>
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#15171a]">
                    <MathText text={q.questionText} />
                  </div>
                  <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-center gap-2 text-xs text-[#475467] rounded border border-[#eef2f0] p-2 bg-white">
                        <span className="font-bold text-[#146b5f]">{String.fromCharCode(65 + oIdx)}.</span>
                        <MathText text={opt.optionText} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e2e8f0] px-6 py-3 text-right">
              <button
                type="button"
                onClick={() => setShowQuestionPaperModal(false)}
                className="rounded-lg bg-[#146b5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0f544a]"
              >
                Return to Test
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Top CBT Examination Control Header */}
        <header className="rounded-xl border border-[#ccd8d4] bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#146b5f] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#146b5f]">
                  CBT Proctored Session
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#15171a]">{testName}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowQuestionPaperModal(true)}
                className="rounded-lg border border-[#ccd8d4] bg-white px-3 py-2 text-xs font-semibold text-[#34403c] transition hover:bg-[#f4f6f5] inline-flex items-center gap-1.5"
                title="View complete question paper"
              >
                <span>📄 Question Paper</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden rounded-lg border border-[#ccd8d4] bg-white px-3 py-2 text-xs font-semibold text-[#34403c] transition hover:bg-[#f4f6f5] sm:inline-flex items-center gap-1.5"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
              >
                <span>{isFullscreen ? "🗗 Exit Fullscreen" : "⛶ Fullscreen"}</span>
              </button>

              {/* Countdown Clock Chip */}
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-2 border font-mono font-bold text-sm shadow-xs transition ${
                  remainingSeconds <= 300
                    ? "border-[#fecdca] bg-[#fef3f2] text-[#b42318] animate-urgent-pulse"
                    : "border-[#d9dee7] bg-[#fbfcfb] text-[#15171a]"
                }`}
              >
                <span>{remainingSeconds <= 300 ? "⚠️" : "⏰"}</span>
                <StatusPill label="Time left" value={formatTime(remainingSeconds)} />
              </div>

              {/* Status indicators */}
              <div className="hidden grid-cols-3 gap-2 text-xs sm:grid">
                <StatusPill label="Answered" value={`${answeredCount}/${questions.length}`} />
                <StatusPill label="Warnings" value={`${violationCount}/${MAX_ALLOWED_VIOLATIONS}`} />
                <StatusPill label="Save" value={formatSaveState(saveState)} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Question & Options Workspace */}
        <section className="flex flex-col justify-between rounded-xl border border-[#ccd8d4] bg-white p-6 shadow-xs">
          <div>
            {/* Section & Marks Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-bold text-[#15171a]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#eef5f3] px-2.5 py-1 text-xs font-semibold text-[#146b5f]">
                  ⏱️ {formatTime(currentQuestionTime)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-[#ecfdf3] px-3 py-1 font-semibold text-[#027a48] border border-[#a6f4c5]">
                  +{currentQuestion.marks} Marks
                </span>
                <span className="rounded-full bg-[#fef3f2] px-3 py-1 font-semibold text-[#b42318] border border-[#fecdca]">
                  -0.50 Negative
                </span>
              </div>
            </div>

            {/* Question Text with KaTeX */}
            <div className="mt-6 text-base font-medium leading-relaxed text-[#15171a] sm:text-lg">
              <h2 className="font-medium">
                <MathText text={currentQuestion.questionText} />
              </h2>
            </div>

            {/* Answer Options Grid */}
            <div className="mt-8 grid gap-3.5">
              {currentQuestion.options.map((option, optIdx) => {
                const selected = answers[currentQuestion.id] === option.id;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.id, option.id)}
                    className={`group flex items-start gap-3.5 rounded-xl border p-4 text-left text-sm font-medium transition duration-150 ${
                      selected
                        ? "border-[#146b5f] bg-[#eef5f3] text-[#0f544a] shadow-xs ring-1 ring-[#146b5f]"
                        : "border-[#d9dee7] bg-white text-[#15171a] hover:border-[#146b5f]/60 hover:bg-[#fbfcfb]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                        selected
                          ? "bg-[#146b5f] text-white shadow-xs"
                          : "border border-[#ccd8d4] bg-[#f4f6f5] text-[#475467] group-hover:border-[#146b5f] group-hover:text-[#146b5f]"
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="flex-1 pt-0.5 leading-relaxed text-sm">
                      <MathText text={option.optionText} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Toolbar */}
          <div className="mt-8 border-t border-[#e2e8f0] pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleMarkedForReview(currentQuestion.id)}
                  className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${
                    markedForReview[currentQuestion.id]
                      ? "border-[#7c3aed] bg-[#f5f3ff] text-[#7c3aed]"
                      : "border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5] hover:text-[#15171a]"
                  }`}
                >
                  {markedForReview[currentQuestion.id]
                    ? "★ Marked for review"
                    : "☆ Mark for review"}
                </button>
                <button
                  type="button"
                  onClick={() => clearResponse(currentQuestion.id)}
                  disabled={!answers[currentQuestion.id]}
                  className="rounded-lg border border-[#ccd8d4] bg-white px-4 py-2 text-xs font-bold text-[#475467] transition hover:bg-[#f4f6f5] hover:text-[#15171a] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear response
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => goToQuestion(currentIndex - 1)}
                  className="rounded-lg border border-[#ccd8d4] bg-white px-4 py-2 text-xs font-bold text-[#34403c] transition hover:bg-[#f4f6f5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToQuestion(currentIndex + 1)}
                  className="rounded-lg bg-[#146b5f] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#0f544a]"
                >
                  Save & Next
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmation(true)}
                  disabled={submitState === "submitting" || submitState === "submitted"}
                  className="rounded-lg bg-[#15171a] px-4 py-2 text-xs font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Submit test
                </button>
              </div>
            </div>

            {/* Submission Confirmation Modal */}
            {showSubmitConfirmation ? (
              <section className="rounded-xl border-2 border-[#146b5f] bg-[#fbfcfb] p-5 shadow-md">
                <h3 className="text-base font-bold text-[#15171a]">Submit this test?</h3>
                <p className="mt-1 text-xs text-[#667085]">
                  Please review your attempt summary below before final submission. Once submitted, you cannot alter your responses.
                </p>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <SubmitStat label="Answered" value={String(answeredCount)} />
                  <SubmitStat label="Unanswered" value={String(unansweredCount)} />
                  <SubmitStat label="Marked" value={String(markedCount)} />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={submitAttempt}
                    disabled={submitState === "submitting" || submitState === "submitted"}
                    className="rounded-lg bg-[#146b5f] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#0f544a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitState === "submitting" ? "Submitting..." : "Confirm submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirmation(false)}
                    disabled={submitState === "submitting"}
                    className="rounded-lg border border-[#ccd8d4] bg-white px-4 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#f4f6f5] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue test
                  </button>
                </div>
              </section>
            ) : null}

            {submitState === "failed" ? (
              <p className="mt-2 text-xs font-semibold text-[#a3412f]">
                ⚠️ Submit failed. Please check your connection and try again.
              </p>
            ) : null}
          </div>
        </section>

        {/* Right-Hand Question Palette Sidebar */}
        <aside className="flex flex-col justify-between rounded-xl border border-[#ccd8d4] bg-white p-5 shadow-xs">
          <div>
            {/* Candidate Header */}
            <div className="flex items-center gap-3 border-b border-[#e2e8f0] pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#146b5f] text-sm font-bold text-white shadow-xs">
                👤
              </div>
              <div>
                <p className="text-xs font-bold text-[#15171a]">Student Candidate</p>
                <p className="text-[11px] text-[#667085]">Roll ID: {attemptId.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Question Palette Title & Counter */}
            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#15171a]">Question palette</h2>
              <span className="rounded bg-[#f4f6f5] px-2 py-0.5 text-xs font-bold text-[#146b5f]">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* 5-Column Question Grid */}
            <div className="mt-4 grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {questions.map((question, index) => {
                const isAns = Boolean(answers[question.id]);
                const isMrk = Boolean(markedForReview[question.id]);
                const isVis = Boolean(visitedQuestions[question.id]);
                const isCurrent = index === currentIndex;

                let style = "";
                let isAnsweredAndMarked = false;

                if (isAns && isMrk) {
                  style = "bg-[#7c3aed] border-[#6d28d9] text-white";
                  isAnsweredAndMarked = true;
                } else if (!isAns && isMrk) {
                  style = "bg-[#ea580c] border-[#c2410c] text-white";
                } else if (isAns) {
                  style = "bg-[#16a34a] border-[#15803d] text-white";
                } else if (isVis) {
                  style = "bg-[#fee4e2] border-[#fecdca] text-[#b42318]";
                } else {
                  style = "bg-[#f1f5f9] border-[#cbd5e1] text-[#475467]";
                }

                const currentRing = isCurrent
                  ? "ring-2 ring-[#15171a] ring-offset-2 scale-105 font-bold z-10 shadow-xs"
                  : "";

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`relative aspect-square rounded-lg border text-xs font-bold transition duration-150 hover:opacity-90 ${style} ${currentRing}`}
                    title={`Question ${index + 1}`}
                  >
                    {index + 1}
                    {isAnsweredAndMarked ? (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white bg-[#10b981]" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Authentic 5-State Legend */}
            <div className="mt-6 border-t border-[#e2e8f0] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Question Legend
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[#16a34a] font-bold text-white text-[10px]">
                      ✓
                    </span>
                    <span className="text-[#34403c] font-medium">Answered</span>
                  </div>
                  <span className="font-bold text-[#16a34a]">{paletteStats.answered}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-[#fecdca] bg-[#fee4e2] font-bold text-[#b42318] text-[10px]">
                      ●
                    </span>
                    <span className="text-[#34403c] font-medium">Not Answered</span>
                  </div>
                  <span className="font-bold text-[#b42318]">{paletteStats.notAnswered}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-[#cbd5e1] bg-[#f1f5f9] font-bold text-[#475467] text-[10px]">
                      ○
                    </span>
                    <span className="text-[#34403c] font-medium">Not Visited</span>
                  </div>
                  <span className="font-bold text-[#667085]">{paletteStats.notVisited}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[#ea580c] font-bold text-white text-[10px]">
                      ★
                    </span>
                    <span className="text-[#34403c] font-medium">Marked for Review</span>
                  </div>
                  <span className="font-bold text-[#ea580c]">{paletteStats.markedOnly}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-5 w-5 items-center justify-center rounded bg-[#7c3aed] font-bold text-white text-[10px]">
                      ★
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                    </span>
                    <span className="text-[#34403c] font-medium">Answered & Marked</span>
                  </div>
                  <span className="font-bold text-[#7c3aed]">{paletteStats.answeredAndMarked}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Palette Footer Submit Button */}
          <div className="mt-6 border-t border-[#e2e8f0] pt-4">
            <button
              type="button"
              onClick={() => setShowSubmitConfirmation(true)}
              disabled={submitState === "submitting" || submitState === "submitted"}
              className="w-full rounded-xl bg-[#146b5f] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#0f544a] disabled:opacity-50"
            >
              Submit Entire Test
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function SubmitStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#dbe3e0] bg-white px-3 py-2">
      <p className="text-xs text-[#667085]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatSaveState(saveState: "idle" | "saving" | "saved" | "failed") {
  if (saveState === "saving") {
    return "Saving";
  }

  if (saveState === "saved") {
    return "Saved";
  }

  if (saveState === "failed") {
    return "Save failed";
  }

  return "Ready";
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#ccd8d4] bg-white px-3 py-2">
      <p className="text-xs text-[#667085]">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
