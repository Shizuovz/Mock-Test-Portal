"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function toggleBookmark(questionId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to bookmark questions.");
  }

  const db = createSupabaseAdminClient();

  // Check if bookmark exists
  const { data: existing } = await db
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existing) {
    await db.from("bookmarks").delete().eq("id", existing.id);
  } else {
    await db.from("bookmarks").insert({
      user_id: user.id,
      question_id: questionId,
    });
  }

  revalidatePath("/dashboard/bookmarks");
}

export async function removeBookmark(bookmarkId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const db = createSupabaseAdminClient();
  await db
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/bookmarks");
}
