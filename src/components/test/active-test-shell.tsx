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

      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <header className="border border-[#ccd8d4] bg-[#f9fbfa] p-5 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
                Active test
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{testName}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden rounded border border-[#ccd8d4] bg-white px-3 py-2 text-xs font-semibold text-[#34403c] transition hover:bg-[#f4f6f5] sm:inline-flex items-center gap-1.5"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
              >
                <span>{isFullscreen ? "🗗 Exit Fullscreen" : "⛶ Fullscreen"}</span>
              </button>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <StatusPill label="Time left" value={formatTime(remainingSeconds)} />
                <StatusPill label="Answered" value={`${answeredCount}/${questions.length}`} />
                <StatusPill label="Warnings" value={`${violationCount}/${MAX_ALLOWED_VIOLATIONS}`} />
                <StatusPill label="Save" value={formatSaveState(saveState)} />
              </div>
            </div>
          </div>
        </header>

        <section className="border border-[#ccd8d4] bg-[#fbfcfb] p-5">
          <div className="flex items-start justify-between gap-4 border-b border-[#dbe3e0] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-[#667085]">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <span className="inline-flex items-center gap-1 rounded bg-[#eef5f3] px-2 py-0.5 text-xs font-semibold text-[#146b5f]">
                  ⏱️ {formatTime(currentQuestionTime)}
                </span>
              </div>
              <h2 className="mt-3 max-w-3xl text-xl font-semibold leading-8">
                <MathText text={currentQuestion.questionText} />
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-[#ccd8d4] px-3 py-1 text-sm font-medium">
              {currentQuestion.marks} marks
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectAnswer(currentQuestion.id, option.id)}
                  className={`min-h-12 border px-4 py-3 text-left text-sm font-medium transition ${
                    selected
                      ? "border-[#146b5f] bg-[#e6f3ef] text-[#123d37]"
                      : "border-[#d9dee7] bg-white hover:border-[#97aaa3]"
                  }`}
                >
                  <MathText text={option.optionText} />
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#dbe3e0] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toggleMarkedForReview(currentQuestion.id)}
                className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  markedForReview[currentQuestion.id]
                    ? "border-[#765a22] bg-[#f0ede6] text-[#765a22]"
                    : "border-[#ccd8d4] bg-white text-[#34403c] hover:bg-[#f4f6f5]"
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
                className="rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#475467] transition hover:bg-[#f4f6f5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear response
              </button>
            </div>
            <p className="text-xs text-[#667085]">
              Answers & mark status are automatically synced and saved.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
              className="rounded-md border border-[#ccd8d4] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex + 1)}
                className="rounded-md border border-[#ccd8d4] px-4 py-2 text-sm font-semibold"
              >
                Save & Next
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitConfirmation(true)}
                disabled={submitState === "submitting" || submitState === "submitted"}
                className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit test
              </button>
            </div>
          </div>
          {showSubmitConfirmation ? (
            <section className="mt-5 border border-[#ccd8d4] bg-[#f9fbfa] p-4">
              <h3 className="text-base font-semibold">Submit this test?</h3>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <SubmitStat label="Answered" value={String(answeredCount)} />
                <SubmitStat label="Unanswered" value={String(unansweredCount)} />
                <SubmitStat label="Marked" value={String(markedCount)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={submitAttempt}
                  disabled={submitState === "submitting" || submitState === "submitted"}
                  className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitState === "submitting" ? "Submitting" : "Confirm submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirmation(false)}
                  disabled={submitState === "submitting"}
                  className="rounded-md border border-[#ccd8d4] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue test
                </button>
              </div>
            </section>
          ) : null}
          {submitState === "failed" ? (
            <p className="mt-4 text-sm font-medium text-[#a3412f]">
              Submit failed. Please try again.
            </p>
          ) : null}
        </section>

        <aside className="border border-[#ccd8d4] bg-[#fbfcfb] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Question palette</h2>
            <span className="text-xs font-semibold text-[#667085]">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const isAns = Boolean(answers[question.id]);
              const isMrk = Boolean(markedForReview[question.id]);
              const isVis = Boolean(visitedQuestions[question.id]);
              const isCurrent = index === currentIndex;

              let style = "";
              let isAnsweredAndMarked = false;

              if (isAns && isMrk) {
                style = "bg-[#79529c] border-[#5e3882] text-white";
                isAnsweredAndMarked = true;
              } else if (!isAns && isMrk) {
                style = "bg-[#f59e0b] border-[#d97706] text-white";
              } else if (isAns) {
                style = "bg-[#146b5f] border-[#0f5249] text-white";
              } else if (isVis) {
                style = "bg-[#fee4e2] border-[#fecdca] text-[#b42318]";
              } else {
                style = "bg-[#f2f4f7] border-[#d0d5dd] text-[#475467]";
              }

              const currentRing = isCurrent
                ? "ring-2 ring-[#15171a] ring-offset-2 scale-105 font-bold z-10"
                : "";

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  className={`relative aspect-square rounded-md border text-sm font-semibold transition ${style} ${currentRing}`}
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

          {/* Architecture.md Section 19.3: Question Palette Status Legend */}
          <div className="mt-6 border-t border-[#dbe3e0] pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Question Legend
            </h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#146b5f] font-bold text-white text-[10px]">
                    ✓
                  </span>
                  <span className="text-[#34403c]">Answered</span>
                </div>
                <span className="font-semibold text-[#146b5f]">{paletteStats.answered}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-[#fecdca] bg-[#fee4e2] font-bold text-[#b42318] text-[10px]">
                    ●
                  </span>
                  <span className="text-[#34403c]">Not Answered</span>
                </div>
                <span className="font-semibold text-[#b42318]">{paletteStats.notAnswered}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded border border-[#d0d5dd] bg-[#f2f4f7] font-bold text-[#475467] text-[10px]">
                    ○
                  </span>
                  <span className="text-[#34403c]">Not Visited</span>
                </div>
                <span className="font-semibold text-[#667085]">{paletteStats.notVisited}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[#f59e0b] font-bold text-white text-[10px]">
                    ★
                  </span>
                  <span className="text-[#34403c]">Marked for Review</span>
                </div>
                <span className="font-semibold text-[#f59e0b]">{paletteStats.markedOnly}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-5 w-5 items-center justify-center rounded bg-[#79529c] font-bold text-white text-[10px]">
                    ★
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                  </span>
                  <span className="text-[#34403c]">Answered & Marked</span>
                </div>
                <span className="font-semibold text-[#79529c]">{paletteStats.answeredAndMarked}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
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
