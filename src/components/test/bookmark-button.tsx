"use client";

import { useState } from "react";
import { toggleBookmark } from "@/lib/actions/bookmark-actions";

type BookmarkButtonProps = {
  questionId: string;
  initialIsBookmarked?: boolean;
};

export function BookmarkButton({
  questionId,
  initialIsBookmarked = false,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    // Optimistic update
    setIsBookmarked((prev) => !prev);

    try {
      await toggleBookmark(questionId);
    } catch {
      // Revert on error
      setIsBookmarked((prev) => !prev);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold transition ${
        isBookmarked
          ? "border-[#146b5f] bg-[#e8f5f1] text-[#146b5f]"
          : "border-[#ccd8d4] bg-white text-[#475467] hover:bg-[#f4f6f5]"
      }`}
      title={isBookmarked ? "Remove from bookmarks" : "Save question to bookmarks"}
    >
      <span>{isBookmarked ? "★" : "☆"}</span>
      <span>{isBookmarked ? "Bookmarked" : "Bookmark question"}</span>
    </button>
  );
}
