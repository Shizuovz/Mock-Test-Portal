import { describe, expect, it } from "vitest";
import {
  calculateExpiresAt,
  getRemainingSeconds,
  hasAttemptExpired,
} from "./timer";

describe("timer helpers", () => {
  it("calculates expires_at correctly from started_at and duration", () => {
    const startedAt = new Date("2026-01-01T10:00:00.000Z");
    const durationMinutes = 60;
    const expiresAt = calculateExpiresAt(startedAt, durationMinutes);

    expect(expiresAt.toISOString()).toBe("2026-01-01T11:00:00.000Z");
  });

  it("returns positive remaining seconds when before expiry", () => {
    const expiresAt = new Date("2026-01-01T10:15:00.000Z");
    const now = new Date("2026-01-01T10:14:30.000Z");

    expect(getRemainingSeconds(expiresAt, now)).toBe(30);
    expect(hasAttemptExpired(expiresAt, now)).toBe(false);
  });

  it("returns 0 remaining seconds and true for hasAttemptExpired when past expiry", () => {
    const expiresAt = new Date("2026-01-01T10:15:00.000Z");
    const now = new Date("2026-01-01T10:15:05.000Z");

    expect(getRemainingSeconds(expiresAt, now)).toBe(0);
    expect(hasAttemptExpired(expiresAt, now)).toBe(true);
  });

  it("floors remaining seconds at 0 and does not return negative time", () => {
    const expiresAt = new Date("2026-01-01T10:00:00.000Z");
    const now = new Date("2026-01-01T11:00:00.000Z");

    expect(getRemainingSeconds(expiresAt, now)).toBe(0);
  });
});
