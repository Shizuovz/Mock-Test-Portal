import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getExamBySlug,
  getPublishedExams,
  getQuestionCountForTest,
  getTestsForExam,
} from "@/lib/content/mock-data";

export type CatalogExam = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  testCount: number;
  questionCount: number;
};

export type CatalogTest = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  totalMarks: number | null;
  questionCount: number;
};

export type CatalogExamDetail = Omit<CatalogExam, "testCount" | "questionCount"> & {
  tests: CatalogTest[];
};

export async function getPublishedExamCatalog(): Promise<CatalogExam[]> {
  if (!hasSupabaseConfig()) {
    return getPublishedExams().map((exam) => {
      const tests = getTestsForExam(exam.id);

      return {
        id: exam.id,
        name: exam.name,
        slug: exam.slug,
        description: exam.description,
        testCount: tests.length,
        questionCount: tests.reduce(
          (total, test) => total + getQuestionCountForTest(test.id),
          0,
        ),
      };
    });
  }

  const db = createSupabaseAdminClient();
  const { data: exams, error } = await db
    .from("exams")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !exams) {
    throw new Error("Unable to load exams.");
  }

  return Promise.all(
    exams.map(async (exam) => {
      const tests = await getPublishedTestsForExam(exam.id);

      return {
        ...exam,
        testCount: tests.length,
        questionCount: tests.reduce((total, test) => total + test.questionCount, 0),
      };
    }),
  );
}

export async function getCatalogExamBySlug(
  slug: string,
): Promise<CatalogExamDetail | null> {
  if (!hasSupabaseConfig()) {
    const exam = getExamBySlug(slug);

    if (!exam) {
      return null;
    }

    return {
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      description: exam.description,
      tests: getTestsForExam(exam.id).map((test) => ({
        id: test.id,
        name: test.name,
        description: test.description,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        questionCount: getQuestionCountForTest(test.id),
      })),
    };
  }

  const db = createSupabaseAdminClient();
  const { data: exam, error } = await db
    .from("exams")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load exam.");
  }

  if (!exam) {
    return null;
  }

  return {
    ...exam,
    tests: await getPublishedTestsForExam(exam.id),
  };
}

export async function getCatalogTestById(testId: string): Promise<CatalogTest | null> {
  if (!hasSupabaseConfig()) {
    const exam = getPublishedExams()
      .flatMap((publishedExam) => getTestsForExam(publishedExam.id))
      .find((test) => test.id === testId);

    if (!exam) {
      return null;
    }

    return {
      id: exam.id,
      name: exam.name,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      questionCount: getQuestionCountForTest(exam.id),
    };
  }

  const db = createSupabaseAdminClient();
  const { data: test, error } = await db
    .from("tests")
    .select("id, name, description, duration_minutes, total_marks")
    .eq("id", testId)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load test.");
  }

  if (!test) {
    return null;
  }

  return {
    id: test.id,
    name: test.name,
    description: test.description,
    durationMinutes: test.duration_minutes,
    totalMarks: test.total_marks,
    questionCount: await getQuestionCount(test.id),
  };
}

function hasSupabaseConfig() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getPublishedTestsForExam(examId: string): Promise<CatalogTest[]> {
  const db = createSupabaseAdminClient();
  const { data: tests, error } = await db
    .from("tests")
    .select("id, name, description, duration_minutes, total_marks")
    .eq("exam_id", examId)
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (error || !tests) {
    throw new Error("Unable to load tests.");
  }

  return Promise.all(
    tests.map(async (test) => ({
      id: test.id,
      name: test.name,
      description: test.description,
      durationMinutes: test.duration_minutes,
      totalMarks: test.total_marks,
      questionCount: await getQuestionCount(test.id),
    })),
  );
}

async function getQuestionCount(testId: string) {
  const db = createSupabaseAdminClient();
  const { count, error } = await db
    .from("test_questions")
    .select("id", { count: "exact", head: true })
    .eq("test_id", testId);

  if (error) {
    throw new Error("Unable to load question count.");
  }

  return count ?? 0;
}
