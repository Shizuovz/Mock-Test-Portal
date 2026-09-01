import { create } from "zustand";

export interface TestAttemptState {
  // Question active pacing map: questionId -> total active seconds spent
  timeSpentSeconds: Record<string, number>;
  activeQuestionId: string | null;
  isPaused: boolean;

  // Actions
  initAttempt: (questionIds: string[], initialTimeSpent?: Record<string, number>) => void;
  setActiveQuestion: (questionId: string | null) => void;
  setIsPaused: (isPaused: boolean) => void;
  tickActiveQuestion: () => void;
  recordQuestionTime: (questionId: string, additionalSeconds: number) => void;
  getTimeSpent: (questionId: string) => number;
  getAllTimeSpent: () => Record<string, number>;
  reset: () => void;
}

export const useTestAttemptStore = create<TestAttemptState>((set, get) => ({
  timeSpentSeconds: {},
  activeQuestionId: null,
  isPaused: false,

  initAttempt: (questionIds, initialTimeSpent = {}) => {
    set((state) => {
      const updated = { ...state.timeSpentSeconds };
      for (const id of questionIds) {
        if (updated[id] === undefined) {
          updated[id] = initialTimeSpent[id] ?? 0;
        }
      }
      return {
        timeSpentSeconds: updated,
        activeQuestionId: questionIds[0] ?? null,
        isPaused: false,
      };
    });
  },

  setActiveQuestion: (questionId) => {
    set({ activeQuestionId: questionId });
  },

  setIsPaused: (isPaused) => {
    set({ isPaused });
  },

  tickActiveQuestion: () => {
    const { activeQuestionId, isPaused } = get();
    if (!activeQuestionId || isPaused) return;

    set((state) => ({
      timeSpentSeconds: {
        ...state.timeSpentSeconds,
        [activeQuestionId]: (state.timeSpentSeconds[activeQuestionId] ?? 0) + 1,
      },
    }));
  },

  recordQuestionTime: (questionId, additionalSeconds) => {
    if (additionalSeconds <= 0) return;
    set((state) => ({
      timeSpentSeconds: {
        ...state.timeSpentSeconds,
        [questionId]: (state.timeSpentSeconds[questionId] ?? 0) + additionalSeconds,
      },
    }));
  },

  getTimeSpent: (questionId) => {
    return get().timeSpentSeconds[questionId] ?? 0;
  },

  getAllTimeSpent: () => {
    return { ...get().timeSpentSeconds };
  },

  reset: () => {
    set({
      timeSpentSeconds: {},
      activeQuestionId: null,
      isPaused: false,
    });
  },
}));
