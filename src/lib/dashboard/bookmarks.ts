import { env, getSupabasePublishableKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BookmarkedQuestion = {
  bookmarkId: string;
  questionId: string;
  questionText: string;
  difficulty: string | null;
  explanation: string | null;
  defaultMarks: number;
  bookmarkedAt: string;
  topicName: string;
  subjectName: string;
  examName: string;
  options: {
    id: string;
    optionText: string;
    isCorrect: boolean;
    orderIndex: number;
  }[];
};

export async function getStudentBookmarks(): Promise<BookmarkedQuestion[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const db = createSupabaseAdminClient();

  const { data: rawBookmarks, error } = await db
    .from("bookmarks")
    .select(`
      id,
      question_id,
      created_at,
      questions (
        id,
        question_text,
        difficulty,
        explanation,
        default_marks,
        topics (
          name,
          subjects (
            name,
            exams (
              name
            )
          )
        ),
        question_options (
          id,
          option_text,
          is_correct,
          order_index
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !rawBookmarks) {
    throw new Error("Unable to load bookmarks.");
  }

  return rawBookmarks
    .map((bm) => {
      const q = Array.isArray(bm.questions) ? bm.questions[0] : bm.questions;
      if (!q) return null;

      const topic = Array.isArray(q.topics) ? q.topics[0] : q.topics;
      const subject = topic ? (Array.isArray(topic.subjects) ? topic.subjects[0] : topic.subjects) : null;
      const exam = subject ? (Array.isArray(subject.exams) ? subject.exams[0] : subject.exams) : null;

      const options = (q.question_options ?? []).sort(
        (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index,
      );

      return {
        bookmarkId: bm.id,
        questionId: q.id,
        questionText: q.question_text,
        difficulty: q.difficulty,
        explanation: q.explanation,
        defaultMarks: q.default_marks,
        bookmarkedAt: bm.created_at,
        topicName: topic?.name ?? "General",
        subjectName: subject?.name ?? "General",
        examName: exam?.name ?? "General",
        options: options.map((opt: { id: string; option_text: string; is_correct: boolean; order_index: number }) => ({
          id: opt.id,
          optionText: opt.option_text,
          isCorrect: opt.is_correct,
          orderIndex: opt.order_index,
        })),
      };
    })
    .filter((item): item is BookmarkedQuestion => item !== null);
}

function hasSupabaseConfig() {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabasePublishableKey() &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
