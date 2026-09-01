"use client";

import { useMemo, useState } from "react";
import type {
  AdminQuestionOptionRow,
  AdminQuestionRow,
  AdminTopicRow,
} from "@/lib/admin/content-read-model";
import { AdminStatus } from "./admin-page-frame";
import { createQuestion, updateQuestion } from "@/lib/actions/admin-actions";
import { MathText } from "@/components/ui/math-text";

type QuestionBankManagerProps = {
  questions: AdminQuestionRow[];
  topics: AdminTopicRow[];
};

const difficultyOptions = ["easy", "medium", "hard"] as const;
const statusOptions = ["draft", "published", "archived"] as const;

export function QuestionBankManager({
  questions,
  topics,
}: QuestionBankManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedEditId, setExpandedEditId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Compute filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesTopic = q.topicName.toLowerCase().includes(query);
        const matchesSubject = q.subjectName.toLowerCase().includes(query);
        const matchesExam = q.examName.toLowerCase().includes(query);
        if (!matchesText && !matchesTopic && !matchesSubject && !matchesExam) {
          return false;
        }
      }

      // Topic filter
      if (selectedTopicId !== "all" && q.topicId !== selectedTopicId) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && q.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [questions, searchQuery, selectedTopicId, selectedDifficulty, selectedStatus]);

  // Aggregate metrics
  const totalCount = questions.length;
  const publishedCount = questions.filter((q) => q.status === "published").length;
  const draftCount = questions.filter((q) => q.status === "draft").length;
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedTopicId !== "all" ||
    selectedDifficulty !== "all" ||
    selectedStatus !== "all";

  function clearFilters() {
    setSearchQuery("");
    setSelectedTopicId("all");
    setSelectedDifficulty("all");
    setSelectedStatus("all");
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total in Bank" value={String(totalCount)} />
        <MetricCard label="Published" value={String(publishedCount)} color="text-[#146b5f]" />
        <MetricCard label="Drafts" value={String(draftCount)} color="text-[#765a22]" />
        <MetricCard
          label="Matching Filters"
          value={String(filteredQuestions.length)}
          subtext={hasActiveFilters ? "Filtered view" : "Showing all"}
        />
      </div>

      {/* 2. Top Action Bar: Create Question Toggle + CSV Import Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#d9dee7] py-4">
        <button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#115b51]"
        >
          <span>{showCreateForm ? "✕ Close Form" : "＋ Create New Question"}</span>
        </button>

        <a
          href="/admin/questions/import"
          className="inline-flex items-center gap-2 rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#34403c] transition hover:bg-[#f4f6f5]"
        >
          <span>⤓ Bulk Import CSV</span>
        </a>
      </div>

      {/* 3. Collapsible "Create Question" Card */}
      {showCreateForm && (
        <section className="rounded-lg border-2 border-[#146b5f]/30 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
            <h2 className="text-lg font-semibold text-[#15171a]">Create New Single-Choice MCQ</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-sm font-semibold text-[#667085] hover:text-[#15171a]"
            >
              Cancel
            </button>
          </div>
          <form action={createQuestion} className="mt-5 grid gap-5">
            <QuestionFormFields topics={topics} />
            <div className="flex items-center justify-end gap-3 border-t border-[#f0f2f5] pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-md border border-[#ccd8d4] px-4 py-2 text-sm font-semibold text-[#475467] hover:bg-[#f4f6f5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-[#146b5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#115b51]"
              >
                Publish / Save Question
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 4. PRD Section 27: Multi-Criteria Filter Bar */}
      <section className="rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search Box */}
          <div>
            <label htmlFor="search-input" className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
              Search Questions
            </label>
            <input
              id="search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt, topic, exam..."
              className="mt-1.5 w-full rounded-md border border-[#ccd8d4] px-3 py-2 text-sm text-[#15171a] focus:border-[#146b5f] focus:outline-none"
            />
          </div>

          {/* Topic Select */}
          <div>
            <label htmlFor="topic-filter" className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
              Topic
            </label>
            <select
              id="topic-filter"
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-sm text-[#15171a] focus:border-[#146b5f] focus:outline-none"
            >
              <option value="all">All Topics ({topics.length})</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.examName} → {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Select */}
          <div>
            <label htmlFor="diff-filter" className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
              Difficulty
            </label>
            <select
              id="diff-filter"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-sm text-[#15171a] focus:border-[#146b5f] focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label htmlFor="status-filter" className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
              Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#ccd8d4] bg-white px-3 py-2 text-sm text-[#15171a] focus:border-[#146b5f] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-3 text-xs text-[#667085]">
            <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[#146b5f] hover:underline"
            >
              ✕ Clear All Filters
            </button>
          </div>
        )}
      </section>

      {/* 5. Question Cards List */}
      <section className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#ccd8d4] bg-white p-12 text-center">
            <h3 className="text-base font-semibold text-[#15171a]">No questions match your criteria</h3>
            <p className="mt-2 text-sm text-[#667085]">
              Try adjusting your search terms or clearing the active filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-md border border-[#ccd8d4] bg-white px-4 py-2 text-sm font-semibold text-[#146b5f] hover:bg-[#f4f6f5]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((question) => {
            const isEditing = expandedEditId === question.id;

            if (isEditing) {
              return (
                <section
                  key={question.id}
                  className="rounded-lg border-2 border-[#146b5f] bg-white p-6 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
                    <h3 className="text-base font-semibold text-[#15171a]">Edit Question</h3>
                    <button
                      type="button"
                      onClick={() => setExpandedEditId(null)}
                      className="text-xs font-semibold text-[#667085] hover:text-[#15171a]"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <form action={updateQuestion} className="mt-4 grid gap-4">
                    <input name="id" type="hidden" value={question.id} />
                    <QuestionFormFields
                      topics={topics}
                      defaultTopicId={question.topicId}
                      defaultQuestionText={question.questionText}
                      defaultDifficulty={question.difficulty ?? ""}
                      defaultStatus={question.status}
                      defaultMarks={String(question.defaultMarks)}
                      defaultNegativeMarks={String(question.defaultNegativeMarks)}
                      defaultExplanation={question.explanation ?? ""}
                      options={question.options}
                    />
                    <div className="flex items-center justify-end gap-3 border-t border-[#f0f2f5] pt-4">
                      <button
                        type="button"
                        onClick={() => setExpandedEditId(null)}
                        className="rounded-md border border-[#ccd8d4] px-4 py-2 text-sm font-semibold text-[#475467] hover:bg-[#f4f6f5]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-[#146b5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#115b51]"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </section>
              );
            }

            return (
              <article
                key={question.id}
                className="rounded-lg border border-[#d9dee7] bg-white p-5 shadow-sm transition hover:border-[#b0bac9]"
              >
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f2f5] pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-[#f0f3f1] px-2.5 py-1 font-semibold text-[#146b5f]">
                      {question.examName}
                    </span>
                    <span className="text-[#98a2b3]">›</span>
                    <span className="rounded bg-[#f7f8fa] px-2.5 py-1 font-medium text-[#475467]">
                      {question.topicName}
                    </span>
                    <span
                      className={`rounded px-2.5 py-1 font-semibold ${
                        question.difficulty === "easy"
                          ? "bg-[#ecfdf3] text-[#027a48]"
                          : question.difficulty === "hard"
                            ? "bg-[#fef3f2] text-[#b42318]"
                            : "bg-[#fffaeb] text-[#b54708]"
                      }`}
                    >
                      {question.difficulty ?? "medium"}
                    </span>
                    <AdminStatus
                      active={question.status === "published"}
                      label={question.status}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#667085]">
                      +{question.defaultMarks} / -{question.defaultNegativeMarks} marks
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedEditId(question.id)}
                      className="rounded-md border border-[#ccd8d4] bg-white px-3 py-1 text-xs font-semibold text-[#146b5f] transition hover:bg-[#e6f3ef]"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <h3 className="mt-3 text-base font-semibold leading-6 text-[#15171a]">
                  <MathText text={question.questionText} />
                </h3>

                {/* 4 Options Grid */}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center justify-between rounded border px-3 py-2 text-xs font-medium ${
                          opt.isCorrect
                            ? "border-[#146b5f] bg-[#e6f3ef] text-[#123d37]"
                            : "border-[#e5e7eb] bg-[#f9fafb] text-[#475467]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-bold">{letter}.</span>
                          <MathText text={opt.optionText} />
                        </span>
                        {opt.isCorrect && (
                          <span className="rounded bg-[#146b5f] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation */}
                {question.explanation && (
                  <p className="mt-3 border-t border-[#f0f2f5] pt-2 text-xs text-[#667085]">
                    <strong className="text-[#34403c]">Explanation: </strong>
                    <MathText text={question.explanation} as="span" />
                  </p>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color = "text-[#15171a]",
  subtext,
}: {
  label: string;
  value: string;
  color?: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-lg border border-[#d9dee7] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-[#98a2b3]">{subtext}</p>}
    </div>
  );
}

function QuestionFormFields({
  topics,
  defaultTopicId,
  defaultQuestionText = "",
  defaultDifficulty = "medium",
  defaultStatus = "draft",
  defaultMarks = "1",
  defaultNegativeMarks = "0",
  defaultExplanation = "",
  options = [],
}: {
  topics: AdminTopicRow[];
  defaultTopicId?: string;
  defaultQuestionText?: string;
  defaultDifficulty?: string;
  defaultStatus?: string;
  defaultMarks?: string;
  defaultNegativeMarks?: string;
  defaultExplanation?: string;
  options?: AdminQuestionOptionRow[];
}) {
  const initialCorrectIndex = options.findIndex((opt) => opt.isCorrect);
  const correctOptionIndex = initialCorrectIndex >= 0 ? initialCorrectIndex : 0;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
            Topic
          </label>
          <select
            name="topicId"
            defaultValue={defaultTopicId ?? topics[0]?.id}
            className="mt-1.5 w-full rounded border border-[#ccd8d4] bg-white px-3 py-2 text-sm text-[#15171a]"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.examName} → {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
            Difficulty
          </label>
          <select
            name="difficulty"
            defaultValue={defaultDifficulty}
            className="mt-1.5 w-full rounded border border-[#ccd8d4] bg-white px-3 py-2 text-sm text-[#15171a]"
          >
            {difficultyOptions.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
            Status
          </label>
          <select
            name="status"
            defaultValue={defaultStatus}
            className="mt-1.5 w-full rounded border border-[#ccd8d4] bg-white px-3 py-2 text-sm text-[#15171a]"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
          Question Prompt
        </label>
        <textarea
          name="questionText"
          required
          rows={3}
          defaultValue={defaultQuestionText}
          placeholder="Enter the full question text..."
          className="mt-1.5 w-full rounded border border-[#ccd8d4] p-3 text-sm text-[#15171a] focus:border-[#146b5f] focus:outline-none"
        />
      </div>

      {/* Options: 4 rows with radio selector for correct answer */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
          Answer Choices (Select radio button for the correct answer)
        </label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => {
            const letter = String.fromCharCode(65 + index);
            const currentOption = options[index];

            return (
              <div
                key={index}
                className="flex items-center gap-2 rounded border border-[#ccd8d4] bg-[#fbfcfb] p-2"
              >
                <input
                  type="radio"
                  name="correctOption"
                  value={index}
                  defaultChecked={correctOptionIndex === index}
                  className="h-4 w-4 text-[#146b5f] focus:ring-[#146b5f]"
                  title={`Mark Option ${letter} as correct`}
                />
                <span className="text-xs font-bold text-[#667085]">{letter}</span>
                <input
                  type="text"
                  name={`optionText-${index}`}
                  required
                  defaultValue={currentOption?.optionText ?? ""}
                  placeholder={`Option ${letter} text`}
                  className="w-full rounded border border-[#e5e7eb] px-2.5 py-1.5 text-xs text-[#15171a] focus:border-[#146b5f] focus:outline-none"
                />
                {currentOption?.id && (
                  <input
                    name={`optionId-${index}`}
                    type="hidden"
                    value={currentOption.id}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
            Marks for Correct Answer
          </label>
          <input
            name="defaultMarks"
            type="number"
            step="0.25"
            min="0.25"
            defaultValue={defaultMarks}
            className="mt-1.5 w-full rounded border border-[#ccd8d4] px-3 py-2 text-sm text-[#15171a]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
            Negative Marks for Wrong Answer
          </label>
          <input
            name="defaultNegativeMarks"
            type="number"
            step="0.25"
            min="0"
            defaultValue={defaultNegativeMarks}
            className="mt-1.5 w-full rounded border border-[#ccd8d4] px-3 py-2 text-sm text-[#15171a]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
          Explanation / Solution
        </label>
        <textarea
          name="explanation"
          rows={2}
          defaultValue={defaultExplanation}
          placeholder="Explain the step-by-step solution shown during answer review..."
          className="mt-1.5 w-full rounded border border-[#ccd8d4] p-2.5 text-sm text-[#15171a] focus:border-[#146b5f] focus:outline-none"
        />
      </div>
    </div>
  );
}
