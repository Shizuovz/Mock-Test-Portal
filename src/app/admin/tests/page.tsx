import Link from "next/link";
import { AdminPageFrame, AdminStatus } from "@/components/admin/admin-page-frame";
import { createTest, updateTest } from "@/lib/actions/admin-actions";
import {
  getAdminAccess,
  getAdminExams,
  getAdminTests,
} from "@/lib/admin/content-read-model";

export const dynamic = "force-dynamic";

type AdminTestsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AdminTestsPage({ searchParams }: AdminTestsPageProps) {
  const { message } = await searchParams;
  const access = await getAdminAccess();
  const tests = access.canView ? await getAdminTests() : [];
  const exams = access.canView ? await getAdminExams() : [];

  return (
    <AdminPageFrame
      access={access}
      title="Manage tests"
      description="Create and update test metadata, then use the builder to attach questions."
    >
      {message ? (
        <div className="mt-6 border border-[#ccd8d4] bg-white px-4 py-3 text-sm font-medium text-[#34403c]">
          {message}
        </div>
      ) : null}

      <section className="mt-8 border border-[#d9dee7] bg-white p-5">
        <h2 className="text-xl font-semibold">Create test</h2>
        <form action={createTest} className="mt-5 grid gap-4">
          <TestFields exams={exams} />
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
            >
              Create test
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Existing tests</h2>
        <div className="mt-4 grid gap-4">
          {tests.map((test) => (
            <form
              key={test.id}
              action={updateTest}
              className="border border-[#d9dee7] bg-white p-5"
            >
              <input name="id" type="hidden" value={test.id} />
              <TestFields
                exams={exams}
                defaultExamId={test.examId}
                defaultName={test.name}
                defaultSlug={test.slug}
                defaultDescription={test.description ?? ""}
                defaultDurationMinutes={String(test.durationMinutes)}
                defaultTotalMarks={test.totalMarks === null ? "" : String(test.totalMarks)}
                defaultPassingMarks={
                  test.passingMarks === null ? "" : String(test.passingMarks)
                }
                defaultMaxAttempts={test.maxAttempts === null ? "" : String(test.maxAttempts)}
                defaultScoreDisplayMode={test.scoreDisplayMode}
                defaultIsPublished={test.isPublished}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-sm text-[#475467]">
                  <span className="border border-[#d9dee7] px-3 py-2">
                    {test.examName}
                  </span>
                  <span className="border border-[#d9dee7] px-3 py-2">
                    {test.questionCount} questions
                  </span>
                  <span className="border border-[#d9dee7] px-3 py-2 text-xs font-semibold text-[#146b5f]">
                    {test.maxAttempts === 1
                      ? "1 attempt only"
                      : test.maxAttempts
                        ? `Max ${test.maxAttempts} attempts`
                        : "Unlimited attempts"}
                  </span>
                  <span className="border border-[#d9dee7] px-3 py-2 text-xs font-semibold text-[#34403c]">
                    {test.scoreDisplayMode === "latest" ? "Latest score highlighted" : "Best score highlighted"}
                  </span>
                  <AdminStatus
                    active={test.isPublished}
                    label={test.isPublished ? "published" : "draft"}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/tests/${test.id}/builder`}
                    className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open builder
                  </Link>
                  <button
                    type="submit"
                    className="rounded-md border border-[#146b5f] px-4 py-2 text-sm font-semibold text-[#146b5f]"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          ))}
        </div>
      </section>
    </AdminPageFrame>
  );
}

function TestFields({
  exams,
  defaultExamId,
  defaultName = "",
  defaultSlug = "",
  defaultDescription = "",
  defaultDurationMinutes = "10",
  defaultTotalMarks = "",
  defaultPassingMarks = "",
  defaultMaxAttempts = "",
  defaultScoreDisplayMode = "best",
  defaultIsPublished = false,
}: {
  exams: Array<{ id: string; name: string }>;
  defaultExamId?: string;
  defaultName?: string;
  defaultSlug?: string;
  defaultDescription?: string;
  defaultDurationMinutes?: string;
  defaultTotalMarks?: string;
  defaultPassingMarks?: string;
  defaultMaxAttempts?: string;
  defaultScoreDisplayMode?: "best" | "latest";
  defaultIsPublished?: boolean;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ExamSelect exams={exams} defaultValue={defaultExamId} />
        <AdminTextField
          label="Duration minutes"
          name="durationMinutes"
          type="number"
          defaultValue={defaultDurationMinutes}
          required
        />
        <AdminTextField label="Name" name="name" defaultValue={defaultName} required />
        <AdminTextField label="Slug" name="slug" defaultValue={defaultSlug} required />
        <AdminTextField
          label="Total marks"
          name="totalMarks"
          type="number"
          step="0.25"
          defaultValue={defaultTotalMarks}
        />
        <AdminTextField
          label="Passing marks"
          name="passingMarks"
          type="number"
          step="0.25"
          defaultValue={defaultPassingMarks}
        />
        <AdminTextField
          label="Max attempts per student (empty = unlimited, 1 = single attempt)"
          name="maxAttempts"
          type="number"
          min="1"
          placeholder="Leave blank for unlimited"
          defaultValue={defaultMaxAttempts}
        />
        <label className="grid gap-2 text-sm font-medium">
          Dashboard score display mode
          <select
            name="scoreDisplayMode"
            defaultValue={defaultScoreDisplayMode}
            className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2 text-sm"
          >
            <option value="best">Highlight Best Score</option>
            <option value="latest">Highlight Latest Score</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultDescription}
          className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input name="isPublished" type="checkbox" defaultChecked={defaultIsPublished} />
        Published
      </label>
    </div>
  );
}

function ExamSelect({
  exams,
  defaultValue,
}: {
  exams: Array<{ id: string; name: string }>;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      Exam
      <select
        name="examId"
        required
        defaultValue={defaultValue}
        className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
      >
        <option value="">Select exam</option>
        {exams.map((exam) => (
          <option key={exam.id} value={exam.id}>
            {exam.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function AdminTextField({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  step,
  min,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: "text" | "number";
  step?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
      />
    </label>
  );
}
