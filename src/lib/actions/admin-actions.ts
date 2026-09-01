"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  examSchema,
  questionOptionSchema,
  subjectSchema,
  testSchema,
  topicSchema,
} from "@/lib/validation/content.schema";

const updateExamSchema = examSchema.extend({
  id: z.string().uuid(),
});
const updateSubjectSchema = subjectSchema.extend({
  id: z.string().uuid(),
});
const updateTopicSchema = topicSchema.extend({
  id: z.string().uuid(),
});
const questionStatusSchema = z.enum(["draft", "published", "archived"]);
const questionFormSchema = z
  .object({
    topicId: z.string().uuid(),
    questionText: z.string().min(1),
    difficulty: z.string().max(60).optional(),
    explanation: z.string().optional(),
    defaultMarks: z.number().positive().default(1),
    defaultNegativeMarks: z.number().min(0).default(0),
    status: questionStatusSchema,
    options: z
      .array(questionOptionSchema)
      .length(4, "Single-choice questions must have 4 options."),
  })
  .refine(
    (question) => question.options.filter((option) => option.isCorrect).length === 1,
    "Single-choice questions must have exactly one correct option.",
  );
const updateQuestionFormSchema = questionFormSchema.safeExtend({
  id: z.string().uuid(),
  optionIds: z.array(z.string()).length(4),
});
const testFormSchema = testSchema.extend({
  totalMarks: z.number().min(0).optional(),
  isPublished: z.boolean().default(false),
});
const updateTestFormSchema = testFormSchema.extend({
  id: z.string().uuid(),
});
const testQuestionSchema = z.object({
  testId: z.string().uuid(),
  questionId: z.string().uuid(),
  orderIndex: z.number().int().min(1),
  marks: z.number().positive(),
  negativeMarks: z.number().min(0),
});
const updateTestQuestionSchema = testQuestionSchema.omit({ questionId: true }).extend({
  id: z.string().uuid(),
});
const removeTestQuestionSchema = z.object({
  id: z.string().uuid(),
  testId: z.string().uuid(),
});

export async function createExam(formData: FormData) {
  await assertCanManageContent();

  const parsed = examSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: normalizeSlug(formData.get("slug")),
    description: normalizeOptionalText(formData.get("description")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirectWithAdminExamMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { error } = await db.from("exams").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    is_active: parsed.data.isActive,
  });

  if (error) {
    redirectWithAdminExamMessage(error.message);
  }

  revalidateAdminExamPaths();
  redirectWithAdminExamMessage("Exam created.");
}

export async function updateExam(formData: FormData) {
  await assertCanManageContent();

  const parsed = updateExamSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: normalizeSlug(formData.get("slug")),
    description: normalizeOptionalText(formData.get("description")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    redirectWithAdminExamMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("exams")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      is_active: parsed.data.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) {
    redirectWithAdminExamMessage(error.message);
  }

  revalidateAdminExamPaths();
  redirectWithAdminExamMessage("Exam updated.");
}

export async function createSubject(formData: FormData) {
  await assertCanManageContent();

  const parsed = subjectSchema.safeParse({
    examId: String(formData.get("examId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: normalizeSlug(formData.get("slug")),
    description: normalizeOptionalText(formData.get("description")),
    orderIndex: Number(formData.get("orderIndex") ?? 0),
  });

  if (!parsed.success) {
    redirectWithAdminSubjectMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { error } = await db.from("subjects").insert({
    exam_id: parsed.data.examId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    order_index: parsed.data.orderIndex,
  });

  if (error) {
    redirectWithAdminSubjectMessage(error.message);
  }

  revalidateAdminSubjectPaths();
  redirectWithAdminSubjectMessage("Subject created.");
}

export async function updateSubject(formData: FormData) {
  await assertCanManageContent();

  const parsed = updateSubjectSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    examId: String(formData.get("examId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: normalizeSlug(formData.get("slug")),
    description: normalizeOptionalText(formData.get("description")),
    orderIndex: Number(formData.get("orderIndex") ?? 0),
  });

  if (!parsed.success) {
    redirectWithAdminSubjectMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("subjects")
    .update({
      exam_id: parsed.data.examId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      order_index: parsed.data.orderIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) {
    redirectWithAdminSubjectMessage(error.message);
  }

  revalidateAdminSubjectPaths();
  redirectWithAdminSubjectMessage("Subject updated.");
}

export async function createTopic(formData: FormData) {
  await assertCanManageContent();

  const parsed = topicSchema.safeParse({
    subjectId: String(formData.get("subjectId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: normalizeSlug(formData.get("slug")),
    description: normalizeOptionalText(formData.get("description")),
    orderIndex: Number(formData.get("orderIndex") ?? 0),
  });

  if (!parsed.success) {
    redirectWithAdminTopicMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { error } = await db.from("topics").insert({
    subject_id: parsed.data.subjectId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    order_index: parsed.data.orderIndex,
  });

  if (error) {
    redirectWithAdminTopicMessage(error.message);
  }

  revalidateAdminTopicPaths();
  redirectWithAdminTopicMessage("Topic created.");
}

export async function updateTopic(formData: FormData) {
  await assertCanManageContent();

  const parsed = updateTopicSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    subjectId: String(formData.get("subjectId") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: normalizeSlug(formData.get("slug")),
    description: normalizeOptionalText(formData.get("description")),
    orderIndex: Number(formData.get("orderIndex") ?? 0),
  });

  if (!parsed.success) {
    redirectWithAdminTopicMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("topics")
    .update({
      subject_id: parsed.data.subjectId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      order_index: parsed.data.orderIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) {
    redirectWithAdminTopicMessage(error.message);
  }

  revalidateAdminTopicPaths();
  redirectWithAdminTopicMessage("Topic updated.");
}

export async function createQuestion(formData: FormData) {
  await assertCanManageContent();

  const parsed = questionFormSchema.safeParse(readQuestionFormData(formData));

  if (!parsed.success) {
    redirectWithAdminQuestionMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { data: question, error: questionError } = await db
    .from("questions")
    .insert({
      topic_id: parsed.data.topicId,
      question_text: parsed.data.questionText,
      question_type: "single_choice",
      difficulty: parsed.data.difficulty ?? null,
      explanation: parsed.data.explanation ?? null,
      default_marks: parsed.data.defaultMarks,
      default_negative_marks: parsed.data.defaultNegativeMarks,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (questionError || !question) {
    redirectWithAdminQuestionMessage(
      questionError?.message ?? "Unable to create question.",
    );
  }

  const { error: optionsError } = await db.from("question_options").insert(
    parsed.data.options.map((option) => ({
      question_id: question.id,
      option_text: option.optionText,
      is_correct: option.isCorrect,
      order_index: option.orderIndex,
    })),
  );

  if (optionsError) {
    redirectWithAdminQuestionMessage(optionsError.message);
  }

  revalidateAdminQuestionPaths();
  redirectWithAdminQuestionMessage("Question created.");
}

export async function updateQuestion(formData: FormData) {
  await assertCanManageContent();

  const parsed = updateQuestionFormSchema.safeParse({
    ...readQuestionFormData(formData),
    id: String(formData.get("id") ?? ""),
    optionIds: [0, 1, 2, 3].map((index) =>
      String(formData.get(`optionId-${index}`) ?? ""),
    ),
  });

  if (!parsed.success) {
    redirectWithAdminQuestionMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const { error: questionError } = await db
    .from("questions")
    .update({
      topic_id: parsed.data.topicId,
      question_text: parsed.data.questionText,
      difficulty: parsed.data.difficulty ?? null,
      explanation: parsed.data.explanation ?? null,
      default_marks: parsed.data.defaultMarks,
      default_negative_marks: parsed.data.defaultNegativeMarks,
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (questionError) {
    redirectWithAdminQuestionMessage(questionError.message);
  }

  for (const option of parsed.data.options) {
    const optionId = parsed.data.optionIds[option.orderIndex];

    if (z.string().uuid().safeParse(optionId).success) {
      const { error } = await db
        .from("question_options")
        .update({
          option_text: option.optionText,
          is_correct: option.isCorrect,
          order_index: option.orderIndex,
          updated_at: new Date().toISOString(),
        })
        .eq("id", optionId)
        .eq("question_id", parsed.data.id);

      if (error) {
        redirectWithAdminQuestionMessage(error.message);
      }
    } else {
      const { error } = await db.from("question_options").insert({
        question_id: parsed.data.id,
        option_text: option.optionText,
        is_correct: option.isCorrect,
        order_index: option.orderIndex,
      });

      if (error) {
        redirectWithAdminQuestionMessage(error.message);
      }
    }
  }

  revalidateAdminQuestionPaths();
  redirectWithAdminQuestionMessage("Question updated.");
}

export async function createTest(formData: FormData) {
  await assertCanManageContent();

  const parsed = testFormSchema.safeParse(readTestFormData(formData));

  if (!parsed.success) {
    redirectWithAdminTestMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const insertPayload: Record<string, unknown> = {
    exam_id: parsed.data.examId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    duration_minutes: parsed.data.durationMinutes,
    total_marks: parsed.data.totalMarks ?? null,
    passing_marks: parsed.data.passingMarks ?? null,
    is_published: parsed.data.isPublished,
    starts_at: parsed.data.startsAt ?? null,
    ends_at: parsed.data.endsAt ?? null,
    max_attempts: parsed.data.maxAttempts ?? null,
    score_display_mode: parsed.data.scoreDisplayMode ?? "best",
  };

  let { error } = await db.from("tests").insert(insertPayload);

  if (
    error &&
    (error.code === "PGRST204" ||
      error.message.includes("does not exist") ||
      error.message.includes("Could not find the"))
  ) {
    delete insertPayload.max_attempts;
    delete insertPayload.score_display_mode;
    const retry = await db.from("tests").insert(insertPayload);
    error = retry.error;
  }

  if (error) {
    redirectWithAdminTestMessage(error.message);
  }

  revalidateAdminTestPaths();
  redirectWithAdminTestMessage("Test created.");
}

export async function updateTest(formData: FormData) {
  await assertCanManageContent();

  const parsed = updateTestFormSchema.safeParse({
    ...readTestFormData(formData),
    id: String(formData.get("id") ?? ""),
  });

  if (!parsed.success) {
    redirectWithAdminTestMessage(getValidationMessage(parsed.error));
  }

  const db = createSupabaseAdminClient();
  const updatePayload: Record<string, unknown> = {
    exam_id: parsed.data.examId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    duration_minutes: parsed.data.durationMinutes,
    total_marks: parsed.data.totalMarks ?? null,
    passing_marks: parsed.data.passingMarks ?? null,
    is_published: parsed.data.isPublished,
    starts_at: parsed.data.startsAt ?? null,
    ends_at: parsed.data.endsAt ?? null,
    max_attempts: parsed.data.maxAttempts ?? null,
    score_display_mode: parsed.data.scoreDisplayMode ?? "best",
    updated_at: new Date().toISOString(),
  };

  let { error } = await db
    .from("tests")
    .update(updatePayload)
    .eq("id", parsed.data.id);

  if (
    error &&
    (error.code === "PGRST204" ||
      error.message.includes("does not exist") ||
      error.message.includes("Could not find the"))
  ) {
    delete updatePayload.max_attempts;
    delete updatePayload.score_display_mode;
    const retry = await db
      .from("tests")
      .update(updatePayload)
      .eq("id", parsed.data.id);
    error = retry.error;
  }

  if (error) {
    redirectWithAdminTestMessage(error.message);
  }

  revalidateAdminTestPaths();
  redirectWithAdminTestMessage("Test updated.");
}

export async function addQuestionToTest(formData: FormData) {
  await assertCanManageContent();

  const parsed = testQuestionSchema.safeParse(readTestQuestionFormData(formData));

  if (!parsed.success) {
    redirectWithAdminTestBuilderMessage(
      String(formData.get("testId") ?? ""),
      getValidationMessage(parsed.error),
    );
  }

  const db = createSupabaseAdminClient();
  const { error } = await db.from("test_questions").insert({
    test_id: parsed.data.testId,
    question_id: parsed.data.questionId,
    order_index: parsed.data.orderIndex,
    marks: parsed.data.marks,
    negative_marks: parsed.data.negativeMarks,
  });

  if (error) {
    redirectWithAdminTestBuilderMessage(parsed.data.testId, error.message);
  }

  await syncTestTotalMarks(parsed.data.testId);
  revalidateAdminTestBuilderPaths(parsed.data.testId);
  redirectWithAdminTestBuilderMessage(parsed.data.testId, "Question added.");
}

export async function updateTestQuestion(formData: FormData) {
  await assertCanManageContent();

  const parsed = updateTestQuestionSchema.safeParse({
    ...readTestQuestionFormData(formData),
    id: String(formData.get("id") ?? ""),
  });

  if (!parsed.success) {
    redirectWithAdminTestBuilderMessage(
      String(formData.get("testId") ?? ""),
      getValidationMessage(parsed.error),
    );
  }

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("test_questions")
    .update({
      order_index: parsed.data.orderIndex,
      marks: parsed.data.marks,
      negative_marks: parsed.data.negativeMarks,
    })
    .eq("id", parsed.data.id)
    .eq("test_id", parsed.data.testId);

  if (error) {
    redirectWithAdminTestBuilderMessage(parsed.data.testId, error.message);
  }

  await syncTestTotalMarks(parsed.data.testId);
  revalidateAdminTestBuilderPaths(parsed.data.testId);
  redirectWithAdminTestBuilderMessage(parsed.data.testId, "Question updated.");
}

export async function removeQuestionFromTest(formData: FormData) {
  await assertCanManageContent();

  const parsed = removeTestQuestionSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    testId: String(formData.get("testId") ?? ""),
  });

  if (!parsed.success) {
    redirectWithAdminTestBuilderMessage(
      String(formData.get("testId") ?? ""),
      getValidationMessage(parsed.error),
    );
  }

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("test_questions")
    .delete()
    .eq("id", parsed.data.id)
    .eq("test_id", parsed.data.testId);

  if (error) {
    redirectWithAdminTestBuilderMessage(parsed.data.testId, error.message);
  }

  await syncTestTotalMarks(parsed.data.testId);
  revalidateAdminTestBuilderPaths(parsed.data.testId);
  redirectWithAdminTestBuilderMessage(parsed.data.testId, "Question removed.");
}

async function assertCanManageContent() {
  const access = await getAdminAccess();

  if (!access.canView) {
    throw new Error("Unauthorized");
  }
}

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  return text.length > 0 ? text : undefined;
}

function normalizeSlug(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readQuestionFormData(formData: FormData) {
  const correctOption = Number(formData.get("correctOption") ?? -1);

  return {
    topicId: String(formData.get("topicId") ?? ""),
    questionText: String(formData.get("questionText") ?? "").trim(),
    difficulty: normalizeOptionalText(formData.get("difficulty")),
    explanation: normalizeOptionalText(formData.get("explanation")),
    defaultMarks: Number(formData.get("defaultMarks") ?? 1),
    defaultNegativeMarks: Number(formData.get("defaultNegativeMarks") ?? 0),
    status: String(formData.get("status") ?? "draft"),
    options: [0, 1, 2, 3].map((index) => ({
      optionText: String(formData.get(`optionText-${index}`) ?? "").trim(),
      isCorrect: correctOption === index,
      orderIndex: index,
    })),
  };
}

function readTestFormData(formData: FormData) {
  const maxAttemptsVal = normalizeOptionalNumber(formData.get("maxAttempts"));

  return {
    examId: String(formData.get("examId") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    slug: normalizeSlug(formData.get("slug")),
    description: normalizeOptionalText(formData.get("description")),
    durationMinutes: Number(formData.get("durationMinutes") ?? 0),
    totalMarks: normalizeOptionalNumber(formData.get("totalMarks")),
    passingMarks: normalizeOptionalNumber(formData.get("passingMarks")),
    startsAt: normalizeOptionalText(formData.get("startsAt")),
    endsAt: normalizeOptionalText(formData.get("endsAt")),
    maxAttempts: maxAttemptsVal !== undefined && maxAttemptsVal > 0 ? maxAttemptsVal : null,
    scoreDisplayMode: formData.get("scoreDisplayMode") === "latest" ? ("latest" as const) : ("best" as const),
    isPublished: formData.get("isPublished") === "on",
  };
}

function readTestQuestionFormData(formData: FormData) {
  return {
    testId: String(formData.get("testId") ?? ""),
    questionId: String(formData.get("questionId") ?? ""),
    orderIndex: Number(formData.get("orderIndex") ?? 0),
    marks: Number(formData.get("marks") ?? 0),
    negativeMarks: Number(formData.get("negativeMarks") ?? 0),
  };
}

function normalizeOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  return text.length > 0 ? Number(text) : undefined;
}

async function syncTestTotalMarks(testId: string) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("test_questions")
    .select("marks")
    .eq("test_id", testId);

  if (error || !data) {
    throw new Error("Unable to recalculate total marks.");
  }

  const totalMarks = data.reduce(
    (total, row) => total + Number(row.marks ?? 0),
    0,
  );

  const { error: updateError } = await db
    .from("tests")
    .update({
      total_marks: totalMarks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", testId);

  if (updateError) {
    throw new Error("Unable to update total marks.");
  }
}

function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form values.";
}

function redirectWithAdminExamMessage(message: string): never {
  redirect(`/admin/exams?message=${encodeURIComponent(message)}`);
}

function redirectWithAdminSubjectMessage(message: string): never {
  redirect(`/admin/subjects?message=${encodeURIComponent(message)}`);
}

function redirectWithAdminTopicMessage(message: string): never {
  redirect(`/admin/topics?message=${encodeURIComponent(message)}`);
}

function redirectWithAdminQuestionMessage(message: string): never {
  redirect(`/admin/questions?message=${encodeURIComponent(message)}`);
}

function redirectWithAdminTestMessage(message: string): never {
  redirect(`/admin/tests?message=${encodeURIComponent(message)}`);
}

function redirectWithAdminTestBuilderMessage(testId: string, message: string): never {
  redirect(
    `/admin/tests/${testId}/builder?message=${encodeURIComponent(message)}`,
  );
}

function revalidateAdminExamPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/exams");
  revalidatePath("/exams");
}

function revalidateAdminSubjectPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/subjects");
  revalidatePath("/admin/topics");
  revalidatePath("/exams");
}

function revalidateAdminTopicPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/topics");
  revalidatePath("/admin/questions");
  revalidatePath("/exams");
}

function revalidateAdminQuestionPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/tests");
  revalidatePath("/exams");
}

function revalidateAdminTestPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/tests");
  revalidatePath("/exams");
}

function revalidateAdminTestBuilderPaths(testId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/tests");
  revalidatePath(`/admin/tests/${testId}/builder`);
  revalidatePath("/exams");
}
