import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageFrame, AdminStatus } from "@/components/admin/admin-page-frame";
import {
  addQuestionToTest,
  removeQuestionFromTest,
  updateTestQuestion,
} from "@/lib/actions/admin-actions";
import {
  getAdminAccess,
  getAdminTestBuilderData,
  type AdminAvailableQuestionRow,
} from "@/lib/admin/content-read-model";

export const dynamic = "force-dynamic";

type AdminTestBuilderPageProps = {
  params: Promise<{
    testId: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AdminTestBuilderPage({
  params,
  searchParams,
}: AdminTestBuilderPageProps) {
  const { testId } = await params;
  const { message } = await searchParams;
  const access = await getAdminAccess();
  const data = access.canView ? await getAdminTestBuilderData(testId) : null;

  if (access.canView && !data) {
    notFound();
  }

  return (
    <AdminPageFrame
      access={access}
      title="Test builder"
      description="Attach published questions to a test, set order, and configure scoring."
    >
      {data ? (
        <>
          {message ? (
            <div className="mt-6 border border-[#ccd8d4] bg-white px-4 py-3 text-sm font-medium text-[#34403c]">
              {message}
            </div>
          ) : null}

          <section className="mt-8 border border-[#d9dee7] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#146b5f]">
                  {data.test.examName}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{data.test.name}</h2>
                <p className="mt-2 text-sm text-[#667085]">{data.test.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[#475467]">
                <span className="border border-[#d9dee7] px-3 py-2">
                  {data.assignedQuestions.length} questions
                </span>
                <span className="border border-[#d9dee7] px-3 py-2">
                  {data.test.durationMinutes} min
                </span>
                <span className="border border-[#d9dee7] px-3 py-2">
                  {data.test.totalMarks ?? 0} marks
                </span>
                <AdminStatus
                  active={data.test.isPublished}
                  label={data.test.isPublished ? "published" : "draft"}
                />
              </div>
            </div>
            <Link
              href="/admin/tests"
              className="mt-5 inline-flex text-sm font-semibold text-[#146b5f]"
            >
              Back to tests
            </Link>
          </section>

          <section className="mt-8 border border-[#d9dee7] bg-white p-5">
            <h2 className="text-xl font-semibold">Add question</h2>
            <form action={addQuestionToTest} className="mt-5 grid gap-4">
              <input name="testId" type="hidden" value={data.test.id} />
              <AvailableQuestionSelect questions={data.availableQuestions} />
              <div className="grid gap-4 lg:grid-cols-3">
                <AdminTextField
                  label="Order"
                  name="orderIndex"
                  type="number"
                  defaultValue={String(data.assignedQuestions.length + 1)}
                  required
                />
                <AdminTextField
                  label="Marks"
                  name="marks"
                  type="number"
                  step="0.25"
                  defaultValue="1"
                  required
                />
                <AdminTextField
                  label="Negative marks"
                  name="negativeMarks"
                  type="number"
                  step="0.25"
                  defaultValue="0"
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
                >
                  Add question
                </button>
              </div>
            </form>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Assigned questions</h2>
            <div className="mt-4 grid gap-4">
              {data.assignedQuestions.map((question) => (
                <div key={question.id} className="border border-[#d9dee7] bg-white p-5">
                  <p className="font-semibold">{question.questionText}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-[#475467]">
                    <span className="border border-[#d9dee7] px-3 py-2">
                      {question.examName}
                    </span>
                    <span className="border border-[#d9dee7] px-3 py-2">
                      {question.subjectName}
                    </span>
                    <span className="border border-[#d9dee7] px-3 py-2">
                      {question.topicName}
                    </span>
                    <span className="border border-[#d9dee7] px-3 py-2">
                      {question.difficulty ?? "difficulty not set"}
                    </span>
                    <AdminStatus
                      active={question.status === "published"}
                      label={question.status}
                    />
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                    <form
                      action={updateTestQuestion}
                      className="grid gap-4 lg:grid-cols-3"
                    >
                      <input name="id" type="hidden" value={question.id} />
                      <input name="testId" type="hidden" value={data.test.id} />
                      <AdminTextField
                        label="Order"
                        name="orderIndex"
                        type="number"
                        defaultValue={String(question.orderIndex)}
                        required
                      />
                      <AdminTextField
                        label="Marks"
                        name="marks"
                        type="number"
                        step="0.25"
                        defaultValue={String(question.marks ?? 1)}
                        required
                      />
                      <AdminTextField
                        label="Negative marks"
                        name="negativeMarks"
                        type="number"
                        step="0.25"
                        defaultValue={String(question.negativeMarks ?? 0)}
                        required
                      />
                      <div className="flex items-end lg:col-span-3">
                        <button
                          type="submit"
                          className="rounded-md border border-[#146b5f] px-4 py-2 text-sm font-semibold text-[#146b5f]"
                        >
                          Save scoring
                        </button>
                      </div>
                    </form>
                    <form action={removeQuestionFromTest} className="flex items-end">
                      <input name="id" type="hidden" value={question.id} />
                      <input name="testId" type="hidden" value={data.test.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-[#b54708] px-4 py-2 text-sm font-semibold text-[#b54708]"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {data.assignedQuestions.length === 0 ? (
                <div className="border border-[#d9dee7] bg-white p-5 text-sm text-[#667085]">
                  No questions attached yet.
                </div>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </AdminPageFrame>
  );
}

function AvailableQuestionSelect({
  questions,
}: {
  questions: AdminAvailableQuestionRow[];
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      Question
      <select
        name="questionId"
        required
        className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
      >
        <option value="">Select published question</option>
        {questions.map((question) => (
          <option key={question.id} value={question.id}>
            {question.examName} / {question.subjectName} / {question.topicName} /{" "}
            {question.questionText}
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
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: "text" | "number";
  step?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
      />
    </label>
  );
}
