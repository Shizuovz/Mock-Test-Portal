import Link from "next/link";
import { getStudentBookmarks } from "@/lib/dashboard/bookmarks";
import { removeBookmark } from "@/lib/actions/bookmark-actions";
import { MathText } from "@/components/ui/math-text";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const bookmarks = await getStudentBookmarks();

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-6 py-8 text-[#15171a]">
      <section className="mx-auto max-w-6xl">
        {/* Navigation & Header */}
        <div className="border-b border-[#d9dee7] pb-5">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="font-semibold text-[#146b5f] hover:underline">
              Dashboard
            </Link>
            <span className="text-[#98a2b3]">/</span>
            <span className="text-[#667085]">Bookmarks</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Bookmarked questions</h1>
              <p className="mt-2 max-w-2xl text-[#475467]">
                Review questions you saved during mock tests. Revisit explanations and correct options anytime.
              </p>
            </div>
            <span className="rounded-full bg-[#e8f5f1] px-4 py-1.5 text-sm font-semibold text-[#146b5f]">
              {bookmarks.length} Saved {bookmarks.length === 1 ? "Question" : "Questions"}
            </span>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="mt-8">
          {bookmarks.length > 0 ? (
            <div className="grid gap-6">
              {bookmarks.map((bm, index) => (
                <article
                  key={bm.bookmarkId}
                  className="rounded-lg border border-[#d9dee7] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f2f5] pb-3 text-xs text-[#667085]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#15171a]">Q{index + 1}.</span>
                      <span className="rounded bg-[#f0f2f5] px-2 py-0.5 font-medium text-[#475467]">
                        {bm.examName}
                      </span>
                      <span>•</span>
                      <span>{bm.subjectName}</span>
                      <span>•</span>
                      <span className="text-[#146b5f]">{bm.topicName}</span>
                      {bm.difficulty && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{bm.difficulty}</span>
                        </>
                      )}
                    </div>

                    <form action={removeBookmark.bind(null, bm.bookmarkId)}>
                      <button
                        type="submit"
                        className="text-xs font-semibold text-[#b42318] hover:underline"
                      >
                        Remove bookmark
                      </button>
                    </form>
                  </div>

                  <MathText
                    text={bm.questionText}
                    as="p"
                    className="mt-4 text-base font-medium text-[#15171a] whitespace-pre-wrap"
                  />

                  {/* Options */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {bm.options.map((opt, optIdx) => (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                          opt.isCorrect
                            ? "border-[#027a48] bg-[#ecfdf3] text-[#027a48] font-medium"
                            : "border-[#e4e7ec] bg-[#fbfcfb] text-[#344054]"
                        }`}
                      >
                        <span className="font-semibold">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <MathText text={opt.optionText} className="flex-1" />
                        {opt.isCorrect && (
                          <span className="text-xs font-bold uppercase tracking-wider text-[#027a48]">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {bm.explanation && (
                    <div className="mt-4 rounded-md border border-[#ccd8d4] bg-[#f4f8f6] p-4 text-sm">
                      <strong className="text-[#146b5f]">Explanation:</strong>
                      <MathText
                        text={bm.explanation}
                        as="p"
                        className="mt-1 text-[#344054] whitespace-pre-wrap"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#ccd8d4] bg-white p-12 text-center">
              <h3 className="text-base font-semibold text-[#15171a]">No bookmarked questions yet</h3>
              <p className="mt-1 text-sm text-[#475467]">
                When taking a test, mark questions for review or bookmark tricky concepts to study later.
              </p>
              <Link
                href="/dashboard/tests"
                className="mt-4 inline-block rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
              >
                Browse tests to practice
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
