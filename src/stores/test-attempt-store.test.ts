import { describe, expect, it, beforeEach } from "vitest";
import { useTestAttemptStore } from "./test-attempt-store";

describe("TestAttemptStore (Zustand)", () => {
  beforeEach(() => {
    useTestAttemptStore.getState().reset();
  });

  it("initializes question timer map with given question IDs", () => {
    const store = useTestAttemptStore.getState();
    store.initAttempt(["q1", "q2", "q3"]);

    expect(useTestAttemptStore.getState().timeSpentSeconds).toEqual({
      q1: 0,
      q2: 0,
      q3: 0,
    });
    expect(useTestAttemptStore.getState().activeQuestionId).toBe("q1");
    expect(useTestAttemptStore.getState().isPaused).toBe(false);
  });

  it("increments active question time when ticked", () => {
    const store = useTestAttemptStore.getState();
    store.initAttempt(["q1", "q2"]);

    store.tickActiveQuestion();
    store.tickActiveQuestion();
    store.tickActiveQuestion();

    expect(useTestAttemptStore.getState().getTimeSpent("q1")).toBe(3);
    expect(useTestAttemptStore.getState().getTimeSpent("q2")).toBe(0);

    // Switch question
    store.setActiveQuestion("q2");
    store.tickActiveQuestion();

    expect(useTestAttemptStore.getState().getTimeSpent("q1")).toBe(3);
    expect(useTestAttemptStore.getState().getTimeSpent("q2")).toBe(1);
  });

  it("does not tick when paused (e.g. tab unfocused or window blurred)", () => {
    const store = useTestAttemptStore.getState();
    store.initAttempt(["q1"]);

    store.tickActiveQuestion();
    expect(useTestAttemptStore.getState().getTimeSpent("q1")).toBe(1);

    // Pause timer
    store.setIsPaused(true);
    store.tickActiveQuestion();
    store.tickActiveQuestion();

    // Should remain 1
    expect(useTestAttemptStore.getState().getTimeSpent("q1")).toBe(1);

    // Unpause
    store.setIsPaused(false);
    store.tickActiveQuestion();
    expect(useTestAttemptStore.getState().getTimeSpent("q1")).toBe(2);
  });

  it("records additional question time correctly", () => {
    const store = useTestAttemptStore.getState();
    store.initAttempt(["q1"]);

    store.recordQuestionTime("q1", 45);
    expect(useTestAttemptStore.getState().getTimeSpent("q1")).toBe(45);

    store.recordQuestionTime("q1", 15);
    expect(useTestAttemptStore.getState().getTimeSpent("q1")).toBe(60);

    expect(useTestAttemptStore.getState().getAllTimeSpent()).toEqual({ q1: 60 });
  });
});
