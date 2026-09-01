import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isEditorOrAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/types/domain";

export type AdminAccess = {
  canView: boolean;
  email: string | null;
  role: UserRole | null;
};

export type AdminOverview = {
  stats: Array<{ label: string; value: string }>;
  recentAttempts: Array<{
    id: string;
    testName: string;
    userId: string;
    status: string;
    score: number | null;
    maxScore: number | null;
    submittedAt: string | null;
  }>;
};

export type AdminExamRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  subjectCount: number;
  testCount: number;
};

export type AdminSubjectRow = {
  id: string;
  examId: string;
  examName: string;
  name: string;
  slug: string;
  description: string | null;
  orderIndex: number;
  topicCount: number;
};

export type AdminTopicRow = {
  id: string;
  subjectId: string;
  examName: string;
  subjectName: string;
  name: string;
  slug: string;
  description: string | null;
  orderIndex: number;
};

export type AdminQuestionRow = {
  id: string;
  topicId: string;
  examName: string;
  subjectName: string;
  topicName: string;
  questionText: string;
  explanation: string | null;
  difficulty: string | null;
  defaultMarks: number;
  defaultNegativeMarks: number;
  status: string;
  options: AdminQuestionOptionRow[];
};

export type AdminQuestionOptionRow = {
  id: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
};

export type AdminTestRow = {
  id: string;
  examId: string;
  examName: string;
  name: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number | null;
  passingMarks: number | null;
  isPublished: boolean;
  maxAttempts: number | null;
  scoreDisplayMode: "best" | "latest";
  questionCount: number;
};

export type AdminTestQuestionRow = {
  id: string;
  questionId: string;
  orderIndex: number;
  marks: number | null;
  negativeMarks: number | null;
  questionText: string;
  difficulty: string | null;
  status: string;
  examName: string;
  subjectName: string;
  topicName: string;
};

export type AdminAvailableQuestionRow = {
  id: string;
  questionText: string;
  difficulty: string | null;
  defaultMarks: number;
  defaultNegativeMarks: number;
  examName: string;
  subjectName: string;
  topicName: string;
};

export type AdminTestBuilderData = {
  test: AdminTestRow;
  assignedQuestions: AdminTestQuestionRow[];
  availableQuestions: AdminAvailableQuestionRow[];
};

export async function getAdminAccess(): Promise<AdminAccess> {
  if (!hasSupabaseConfig()) {
    return {
      canView: true,
      email: null,
      role: "admin",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      canView: false,
      email: null,
      role: null,
    };
  }

  const db = createSupabaseAdminClient();
  const { data: profile, error } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return {
      canView: false,
      email: user.email ?? null,
      role: null,
    };
  }

  return {
    canView: isEditorOrAdmin(profile.role),
    email: user.email ?? null,
    role: profile.role,
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const db = createSupabaseAdminClient();
  const [
    exams,
    subjects,
    topics,
    questions,
    tests,
    attempts,
    users,
    recentAttempts,
  ] = await Promise.all([
    countRows("exams"),
    countRows("subjects"),
    countRows("topics"),
    countRows("questions"),
    countRows("tests"),
    countRows("test_attempts"),
    countRows("profiles"),
    db
      .from("test_attempts")
      .select("id, user_id, status, score, max_score, submitted_at, tests(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (recentAttempts.error || !recentAttempts.data) {
    throw new Error("Unable to load recent attempts.");
  }

  return {
    stats: [
      { label: "Users", value: String(users) },
      { label: "Exams", value: String(exams) },
      { label: "Subjects", value: String(subjects) },
      { label: "Topics", value: String(topics) },
      { label: "Questions", value: String(questions) },
      { label: "Tests", value: String(tests) },
      { label: "Attempts", value: String(attempts) },
    ],
    recentAttempts: recentAttempts.data.map((attempt) => {
      const test = Array.isArray(attempt.tests) ? attempt.tests[0] : attempt.tests;

      return {
        id: attempt.id,
        testName: test?.name ?? "Mock Test",
        userId: attempt.user_id,
        status: attempt.status,
        score: attempt.score,
        maxScore: attempt.max_score,
        submittedAt: attempt.submitted_at,
      };
    }),
  };
}

export async function getAdminExams(): Promise<AdminExamRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("exams")
    .select("id, name, slug, description, is_active")
    .order("name", { ascending: true });

  if (error || !data) {
    throw new Error("Unable to load exams.");
  }

  return Promise.all(
    data.map(async (exam) => ({
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      description: exam.description,
      isActive: exam.is_active,
      subjectCount: await countRows("subjects", "exam_id", exam.id),
      testCount: await countRows("tests", "exam_id", exam.id),
    })),
  );
}

export async function getAdminSubjects(): Promise<AdminSubjectRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("subjects")
    .select("id, name, slug, description, order_index, exam_id, exams(name)")
    .order("order_index", { ascending: true });

  if (error || !data) {
    throw new Error("Unable to load subjects.");
  }

  return Promise.all(
    data.map(async (subject) => {
      const exam = Array.isArray(subject.exams) ? subject.exams[0] : subject.exams;

      return {
        id: subject.id,
        examId: subject.exam_id,
        examName: exam?.name ?? "Unknown exam",
        name: subject.name,
        slug: subject.slug,
        description: subject.description,
        orderIndex: subject.order_index,
        topicCount: await countRows("topics", "subject_id", subject.id),
      };
    }),
  );
}

export async function getAdminTopics(): Promise<AdminTopicRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("topics")
    .select(
      "id, subject_id, name, slug, description, order_index, subjects(name, exams(name))",
    )
    .order("order_index", { ascending: true });

  if (error || !data) {
    throw new Error("Unable to load topics.");
  }

  return data.map((topic) => {
    const subject = Array.isArray(topic.subjects) ? topic.subjects[0] : topic.subjects;
    const exam = Array.isArray(subject?.exams) ? subject.exams[0] : subject?.exams;

    return {
      id: topic.id,
      subjectId: topic.subject_id,
      examName: exam?.name ?? "Unknown exam",
      subjectName: subject?.name ?? "Unknown subject",
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      orderIndex: topic.order_index,
    };
  });
}

export async function getAdminQuestions(): Promise<AdminQuestionRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("questions")
    .select(
      "id, topic_id, question_text, difficulty, explanation, default_marks, default_negative_marks, status, topics(name, subjects(name, exams(name))), question_options(id, option_text, is_correct, order_index)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    throw new Error("Unable to load questions.");
  }

  return data.map((question) => {
    const topic = Array.isArray(question.topics) ? question.topics[0] : question.topics;
    const subject = Array.isArray(topic?.subjects)
      ? topic.subjects[0]
      : topic?.subjects;
    const exam = Array.isArray(subject?.exams) ? subject.exams[0] : subject?.exams;
    const options = Array.isArray(question.question_options)
      ? question.question_options
      : [];
    const orderedOptions = options
      .map((option) => ({
        id: option.id,
        optionText: option.option_text,
        isCorrect: option.is_correct,
        orderIndex: option.order_index,
      }))
      .sort((first, second) => first.orderIndex - second.orderIndex);

    return {
      id: question.id,
      topicId: question.topic_id,
      examName: exam?.name ?? "Unknown exam",
      subjectName: subject?.name ?? "Unknown subject",
      topicName: topic?.name ?? "Unknown topic",
      questionText: question.question_text,
      explanation: question.explanation,
      difficulty: question.difficulty,
      defaultMarks: Number(question.default_marks),
      defaultNegativeMarks: Number(question.default_negative_marks),
      status: question.status,
      options: orderedOptions,
    };
  });
}

export async function getAdminTests(): Promise<AdminTestRow[]> {
  const db = createSupabaseAdminClient();
  let { data, error } = await db
    .from("tests")
    .select(
      "id, exam_id, name, slug, description, duration_minutes, total_marks, passing_marks, is_published, max_attempts, score_display_mode, exams(name), test_questions(id)",
    )
    .order("created_at", { ascending: false });

  if (error && error.message.includes("does not exist")) {
    const retry = await db
      .from("tests")
      .select(
        "id, exam_id, name, slug, description, duration_minutes, total_marks, passing_marks, is_published, exams(name), test_questions(id)",
      )
      .order("created_at", { ascending: false });
    data = retry.data as typeof data;
    error = retry.error;
  }

  if (error || !data) {
    throw new Error("Unable to load tests.");
  }

  return data.map((test) => {
    const exam = Array.isArray(test.exams) ? test.exams[0] : test.exams;
    const questions = Array.isArray(test.test_questions) ? test.test_questions : [];
    const testRecord = test as unknown as Record<string, unknown>;

    return {
      id: test.id,
      examId: test.exam_id,
      examName: exam?.name ?? "Unknown exam",
      name: test.name,
      slug: test.slug,
      description: test.description,
      durationMinutes: test.duration_minutes,
      totalMarks: test.total_marks === null ? null : Number(test.total_marks),
      passingMarks: test.passing_marks === null ? null : Number(test.passing_marks),
      isPublished: test.is_published,
      maxAttempts:
        testRecord.max_attempts !== undefined && testRecord.max_attempts !== null
          ? Number(testRecord.max_attempts)
          : null,
      scoreDisplayMode:
        testRecord.score_display_mode === "latest" ? ("latest" as const) : ("best" as const),
      questionCount: questions.length,
    };
  });
}

export async function getAdminTestBuilderData(
  testId: string,
): Promise<AdminTestBuilderData | null> {
  const tests = await getAdminTests();
  const test = tests.find((item) => item.id === testId);

  if (!test) {
    return null;
  }

  const db = createSupabaseAdminClient();
  const { data: assigned, error: assignedError } = await db
    .from("test_questions")
    .select(
      "id, question_id, order_index, marks, negative_marks, questions(question_text, difficulty, status, topics(name, subjects(name, exams(name))))",
    )
    .eq("test_id", testId)
    .order("order_index", { ascending: true });

  if (assignedError || !assigned) {
    throw new Error("Unable to load test questions.");
  }

  const assignedQuestionIds = new Set(assigned.map((row) => row.question_id));
  const assignedQuestions = assigned.map((row) => {
    const question = Array.isArray(row.questions) ? row.questions[0] : row.questions;
    const topic = Array.isArray(question?.topics)
      ? question.topics[0]
      : question?.topics;
    const subject = Array.isArray(topic?.subjects)
      ? topic.subjects[0]
      : topic?.subjects;
    const exam = Array.isArray(subject?.exams) ? subject.exams[0] : subject?.exams;

    return {
      id: row.id,
      questionId: row.question_id,
      orderIndex: row.order_index,
      marks: row.marks === null ? null : Number(row.marks),
      negativeMarks: row.negative_marks === null ? null : Number(row.negative_marks),
      questionText: question?.question_text ?? "Unknown question",
      difficulty: question?.difficulty ?? null,
      status: question?.status ?? "draft",
      examName: exam?.name ?? "Unknown exam",
      subjectName: subject?.name ?? "Unknown subject",
      topicName: topic?.name ?? "Unknown topic",
    };
  });

  const { data: questions, error: questionsError } = await db
    .from("questions")
    .select(
      "id, question_text, difficulty, default_marks, default_negative_marks, topics(name, subjects(name, exams(name)))",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (questionsError || !questions) {
    throw new Error("Unable to load available questions.");
  }

  const availableQuestions = questions
    .filter((question) => !assignedQuestionIds.has(question.id))
    .map((question) => {
      const topic = Array.isArray(question.topics)
        ? question.topics[0]
        : question.topics;
      const subject = Array.isArray(topic?.subjects)
        ? topic.subjects[0]
        : topic?.subjects;
      const exam = Array.isArray(subject?.exams) ? subject.exams[0] : subject?.exams;

      return {
        id: question.id,
        questionText: question.question_text,
        difficulty: question.difficulty,
        defaultMarks: Number(question.default_marks),
        defaultNegativeMarks: Number(question.default_negative_marks),
        examName: exam?.name ?? "Unknown exam",
        subjectName: subject?.name ?? "Unknown subject",
        topicName: topic?.name ?? "Unknown topic",
      };
    });

  return {
    test,
    assignedQuestions,
    availableQuestions,
  };
}

async function countRows(tableName: string, columnName?: string, value?: string) {
  const db = createSupabaseAdminClient();
  let query = db.from(tableName).select("id", { count: "exact", head: true });

  if (columnName && value) {
    query = query.eq(columnName, value);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Unable to count ${tableName}.`);
  }

  return count ?? 0;
}

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
