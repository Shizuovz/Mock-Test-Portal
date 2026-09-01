export function calculateExpiresAt(startedAt: Date, durationMinutes: number) {
  return new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
}

export function getRemainingSeconds(expiresAt: Date, now = new Date()) {
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
}

export function hasAttemptExpired(expiresAt: Date, now = new Date()) {
  return getRemainingSeconds(expiresAt, now) === 0;
}
