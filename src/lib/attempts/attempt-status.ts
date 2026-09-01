import type { AttemptStatus } from "@/types/domain";

export function isAttemptOpen(status: AttemptStatus) {
  return status === "in_progress";
}

export function isAttemptClosed(status: AttemptStatus) {
  return status === "submitted" || status === "expired" || status === "cancelled";
}
