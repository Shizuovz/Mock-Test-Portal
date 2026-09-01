import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AvailableTestCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number | null;
  passingMarks: number | null;
  examId: string;
  examName: string;
  examSlug: string;
  questionCount: number;
  attemptStatus: "not_started" | "in_progress" | "submitted" | "expired";
  activeAttemptId: string | null;
  bestScorePercent: number | null;
  highlightScorePercent: number | null;
  highlightScoreLabel: string;
  maxAttempts: number | null;
  scoreDisplayMode: "best" | "latest";
  isAttemptLimitReached: boolean;
  attemptsCount: number;
};

export type AvailableTestsFilters = {
  examSlug?: string;
  search?: string;
  status?: "all" | "completed" | "uncompleted";
};

export async function getAvailableTests(
  filters: AvailableTestsFilters = {},
): Promise<{ tests: AvailableTestCard[]; exams: { name: string; slug: string }[] }> {
  if (!hasSupabaseConfig()) {
    return { tests: [], exams: [] };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = createSupabaseAdminClient();

  // Load published tests with their exam information
  let { data: rawTests, error: testError } = await db
    .from("tests")
    .select(`
      id,
      name,
      slug,
      description,
      duration_minutes,
      total_marks,
      passing_marks,
      max_attempts,
      score_display_mode,
      exam_id,
      exams (
        id,
        name,
        slug
      )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (testError && testError.message.includes("does not exist")) {
    const retry = await db
      .from("tests")
      .select(`
        id,
        name,
        slug,
        description,
        duration_minutes,
        total_marks,
        passing_marks,
        exam_id,
        exams (
          id,
          name,
          slug
        )
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    rawTests = retry.data as typeof rawTests;
    testError = retry.error;
  }

  if (testError || !rawTests) {
    throw new Error("Unable to load published tests catalog.");
  }

  // Load user attempts if user is logged in
  let userAttempts: Array<{
    id: string;
    test_id: string;
    status: string;
    score: number | null;
    max_score: number | null;
  }> = [];

  if (user) {
    const { data: attempts } = await db
      .from("test_attempts")
      .select("id, test_id, status, score, max_score")
      .eq("user_id", user.id);
    if (attempts) {
      userAttempts = attempts;
    }
  }

  // Load question counts for each test
  const testIds = rawTests.map((t) => t.id);
  const questionCountMap = new Map<string, number>();

  if (testIds.length > 0) {
    const { data: testQuestions } = await db
      .from("test_questions")
      .select("test_id");

    if (testQuestions) {
      for (const tq of testQuestions) {
        const current = questionCountMap.get(tq.test_id) ?? 0;
        questionCountMap.set(tq.test_id, current + 1);
      }
    }
  }

  // Extract unique exams for the filter dropdown
  const examMap = new Map<string, string>();

  let availableTests: AvailableTestCard[] = rawTests.map((t) => {
    const exam = Array.isArray(t.exams) ? t.exams[0] : t.exams;
    const examName = exam?.name ?? "General Exam";
    const examSlug = exam?.slug ?? "general";

    if (exam?.slug) {
      examMap.set(exam.slug, examName);
    }

    const attemptsForTest = userAttempts.filter((a) => a.test_id === t.id);
    const activeAttempt = attemptsForTest.find((a) => a.status === "in_progress");
    const completedAttempts = attemptsForTest.filter(
      (a) => a.status === "submitted" || a.status === "expired",
    );

    let attemptStatus: AvailableTestCard["attemptStatus"] = "not_started";
    if (activeAttempt) {
      attemptStatus = "in_progress";
    } else if (completedAttempts.length > 0) {
      attemptStatus = "submitted";
    }

    const testRecord = t as unknown as Record<string, unknown>;
    const maxAttempts =
      testRecord.max_attempts !== undefined && testRecord.max_attempts !== null
        ? Number(testRecord.max_attempts)
        : null;
    const scoreDisplayMode: "best" | "latest" =
      testRecord.score_display_mode === "latest" ? "latest" : "best";

    let bestScorePercent: number | null = null;
    let latestScorePercent: number | null = null;

    for (const ca of completedAttempts) {
      if (ca.score !== null && ca.max_score && ca.max_score > 0) {
        const pct = Math.round((ca.score / ca.max_score) * 100);
        if (bestScorePercent === null || pct > bestScorePercent) {
          bestScorePercent = pct;
        }
      }
    }

    if (completedAttempts.length > 0) {
      const latest = completedAttempts[completedAttempts.length - 1];
      if (latest?.score !== null && latest?.max_score && latest.max_score > 0) {
        latestScorePercent = Math.round((latest.score / latest.max_score) * 100);
      }
    }

    const highlightScorePercent =
      scoreDisplayMode === "latest" ? latestScorePercent : bestScorePercent;
    const highlightScoreLabel =
      scoreDisplayMode === "latest" ? "Latest Score" : "Best Score";

    const isAttemptLimitReached =
      maxAttempts !== null && completedAttempts.length >= maxAttempts;

    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      durationMinutes: t.duration_minutes,
      totalMarks: t.total_marks,
      passingMarks: t.passing_marks,
      examId: t.exam_id,
      examName,
      examSlug,
      questionCount: questionCountMap.get(t.id) ?? 0,
      attemptStatus,
      activeAttemptId: activeAttempt?.id ?? null,
      bestScorePercent,
      highlightScorePercent,
      highlightScoreLabel,
      maxAttempts,
      scoreDisplayMode,
      isAttemptLimitReached,
      attemptsCount: attemptsForTest.length,
    };
  });

  // Apply filters
  if (filters.examSlug && filters.examSlug !== "all") {
    availableTests = availableTests.filter((t) => t.examSlug === filters.examSlug);
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase();
    availableTests = availableTests.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.examName.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)),
    );
  }

  if (filters.status === "completed") {
    availableTests = availableTests.filter((t) => t.attemptStatus === "submitted");
  } else if (filters.status === "uncompleted") {
    availableTests = availableTests.filter((t) => t.attemptStatus !== "submitted");
  }

  const exams = Array.from(examMap.entries()).map(([slug, name]) => ({ slug, name }));

  return {
    tests: availableTests,
    exams,
  };
}

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
