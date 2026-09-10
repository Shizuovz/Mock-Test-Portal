import type {
  AttemptStatus,
  QuestionStatus,
  QuestionType,
  UserRole,
} from "./domain";

export type Profile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Exam = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Subject = {
  id: string;
  examId: string;
  name: string;
  slug: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type Question = {
  id: string;
  topicId: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: string | null;
  explanation: string | null;
  defaultMarks: number;
  defaultNegativeMarks: number;
  status: QuestionStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuestionOption = {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type Test = {
  id: string;
  examId: string;
  name: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number | null;
  passingMarks: number | null;
  isPublished: boolean;
  startsAt: string | null;
  endsAt: string | null;
  maxAttempts: number | null;
  scoreDisplayMode: "best" | "latest";
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TestQuestion = {
  id: string;
  testId: string;
  questionId: string;
  orderIndex: number;
  marks: number | null;
  negativeMarks: number | null;
  createdAt: string;
};

export type AccessType =
  | "guest_free"
  | "registered_free"
  | "subscription"
  | "admin_granted";

export type TestAttempt = {
  id: string;
  userId: string | null;
  guestSessionId?: string | null;
  accessType: AccessType;
  testId: string;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  correctCount: number | null;
  wrongCount: number | null;
  unansweredCount: number | null;
  timeTakenSeconds: number | null;
  createdAt: string;
  updatedAt: string;
};

export type UserEntitlement = {
  userId: string;
  freeAttemptLimit: number;
  freeAttemptsUsed: number;
  createdAt: string;
  updatedAt: string;
};

export type GuestSession = {
  id: string;
  freeAttemptLimit: number;
  freeAttemptsUsed: number;
  createdAt: string;
  lastSeenAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string | null;
  status: "active" | "expired" | "cancelled";
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amountPaise: number;
  currency: string;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  status: "pending" | "captured" | "failed" | "refunded";
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type Plan = {
  id: string;
  code: string;
  name: string;
  pricePaise: number;
  durationDays: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserAnswer = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  isMarkedForReview: boolean;
  answeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Bookmark = {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type SafeQuestionOption = Pick<
  QuestionOption,
  "id" | "optionText" | "orderIndex"
>;

export type SafeQuestionPayload = Pick<
  Question,
  "id" | "questionText" | "questionType"
> & {
  marks: number;
  negativeMarks: number;
  options: SafeQuestionOption[];
};
