"use server";

import { revalidateTag } from "next/cache";
import { cacheTags } from "./tags";

export async function revalidateExamContent(examId: string) {
  revalidateTag(cacheTags.exams, "max");
  revalidateTag(cacheTags.exam(examId), "max");
}

export async function revalidateTestContent(testId: string) {
  revalidateTag(cacheTags.tests, "max");
  revalidateTag(cacheTags.test(testId), "max");
  revalidateTag(cacheTags.questionsForTest(testId), "max");
}
