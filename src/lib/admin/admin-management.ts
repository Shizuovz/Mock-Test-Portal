import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import type { UserRole } from "@/types/domain";

export type AdminAttemptItem = {
  id: string;
  userId: string;
  userEmail: string | null;
  userFullName: string | null;
  testId: string;
  testName: string;
  status: "in_progress" | "submitted" | "expired" | "cancelled";
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeTakenSeconds: number | null;
};

export type AdminUserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  attemptsCount: number;
};

export type AdminPlatformReport = {
  totalUsers: number;
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  expiredAttempts: number;
  averageScorePercent: number;
  totalQuestions: number;
  totalTests: number;
  questionsByDifficulty: { difficulty: string; count: number }[];
  attemptsByTest: { testName: string; count: number }[];
};

export async function getAdminAttempts(statusFilter?: string): Promise<AdminAttemptItem[]> {
  const access = await getAdminAccess();
  if (!access.canView) return [];

  const db = createSupabaseAdminClient();
  let query = db
    .from("test_attempts")
    .select(`
      id,
      user_id,
      test_id,
      status,
      started_at,
      expires_at,
      submitted_at,
      score,
      max_score,
      correct_count,
      wrong_count,
      unanswered_count,
      time_taken_seconds,
      profiles (
        full_name
      ),
      tests (
        name
      )
    `)
    .order("started_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // Also query auth users for emails
  const { data: authData } = await db.auth.admin.listUsers();
  const emailMap = new Map<string, string>();
  if (authData?.users) {
    for (const u of authData.users) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }

  return data.map((item) => {
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    const test = Array.isArray(item.tests) ? item.tests[0] : item.tests;

    return {
      id: item.id,
      userId: item.user_id,
      userEmail: emailMap.get(item.user_id) ?? null,
      userFullName: profile?.full_name ?? "Student",
      testId: item.test_id,
      testName: test?.name ?? "Mock Test",
      status: item.status,
      startedAt: item.started_at,
      expiresAt: item.expires_at,
      submittedAt: item.submitted_at,
      score: item.score,
      maxScore: item.max_score,
      correctCount: item.correct_count ?? 0,
      wrongCount: item.wrong_count ?? 0,
      unansweredCount: item.unanswered_count ?? 0,
      timeTakenSeconds: item.time_taken_seconds,
    };
  });
}

export async function getAdminUsers(): Promise<AdminUserProfile[]> {
  const access = await getAdminAccess();
  if (!access.canView) return [];

  const db = createSupabaseAdminClient();
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at")
    .order("created_at", { ascending: false });

  if (error || !profiles) return [];

  const { data: authData } = await db.auth.admin.listUsers();
  const emailMap = new Map<string, string>();
  if (authData?.users) {
    for (const u of authData.users) {
      if (u.email) emailMap.set(u.id, u.email);
    }
  }

  // Count attempts per user
  const { data: attempts } = await db.from("test_attempts").select("user_id");
  const attemptCountMap = new Map<string, number>();
  if (attempts) {
    for (const a of attempts) {
      attemptCountMap.set(a.user_id, (attemptCountMap.get(a.user_id) ?? 0) + 1);
    }
  }

  return profiles.map((p) => ({
    id: p.id,
    email: emailMap.get(p.id) ?? null,
    fullName: p.full_name,
    avatarUrl: p.avatar_url,
    role: p.role as UserRole,
    createdAt: p.created_at,
    attemptsCount: attemptCountMap.get(p.id) ?? 0,
  }));
}

export async function getAdminPlatformReport(): Promise<AdminPlatformReport> {
  const access = await getAdminAccess();
  const defaultReport: AdminPlatformReport = {
    totalUsers: 0,
    totalAttempts: 0,
    completedAttempts: 0,
    inProgressAttempts: 0,
    expiredAttempts: 0,
    averageScorePercent: 0,
    totalQuestions: 0,
    totalTests: 0,
    questionsByDifficulty: [],
    attemptsByTest: [],
  };

  if (!access.canView) return defaultReport;

  const db = createSupabaseAdminClient();

  const [
    { count: usersCount },
    { count: questionsCount },
    { count: testsCount },
    { data: attempts },
    { data: questions },
  ] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("questions").select("id", { count: "exact", head: true }),
    db.from("tests").select("id", { count: "exact", head: true }),
    db.from("test_attempts").select("id, status, score, max_score, test_id, tests(name)"),
    db.from("questions").select("difficulty"),
  ]);

  let completed = 0;
  let inProgress = 0;
  let expired = 0;
  let scoreSum = 0;
  let scoredCount = 0;
  const testAttemptMap = new Map<string, number>();

  if (attempts) {
    for (const a of attempts) {
      if (a.status === "submitted") completed++;
      else if (a.status === "in_progress") inProgress++;
      else if (a.status === "expired") expired++;

      if (a.max_score && a.max_score > 0 && a.score !== null) {
        scoreSum += (a.score / a.max_score) * 100;
        scoredCount++;
      }

      const test = Array.isArray(a.tests) ? a.tests[0] : a.tests;
      const tName = test?.name ?? "Mock Test";
      testAttemptMap.set(tName, (testAttemptMap.get(tName) ?? 0) + 1);
    }
  }

  const diffMap = new Map<string, number>();
  if (questions) {
    for (const q of questions) {
      const diff = q.difficulty || "unassigned";
      diffMap.set(diff, (diffMap.get(diff) ?? 0) + 1);
    }
  }

  return {
    totalUsers: usersCount ?? 0,
    totalAttempts: attempts?.length ?? 0,
    completedAttempts: completed,
    inProgressAttempts: inProgress,
    expiredAttempts: expired,
    averageScorePercent: scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 0,
    totalQuestions: questionsCount ?? 0,
    totalTests: testsCount ?? 0,
    questionsByDifficulty: Array.from(diffMap.entries()).map(([difficulty, count]) => ({
      difficulty,
      count,
    })),
    attemptsByTest: Array.from(testAttemptMap.entries()).map(([testName, count]) => ({
      testName,
      count,
    })),
  };
}
