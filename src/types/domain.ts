export type UserRole = "student" | "editor" | "admin";

export type QuestionStatus = "draft" | "published" | "archived";

export type QuestionType = "single_choice";

export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "expired"
  | "cancelled";

export type ReviewMode =
  | "after_submission"
  | "after_test_window_closes"
  | "never";
