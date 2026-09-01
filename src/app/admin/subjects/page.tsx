import { AdminPageFrame } from "@/components/admin/admin-page-frame";
import { createSubject, updateSubject } from "@/lib/actions/admin-actions";
import {
  getAdminAccess,
  getAdminExams,
  getAdminSubjects,
} from "@/lib/admin/content-read-model";

export const dynamic = "force-dynamic";

type AdminSubjectsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AdminSubjectsPage({
  searchParams,
}: AdminSubjectsPageProps) {
  const { message } = await searchParams;
  const access = await getAdminAccess();
  const subjects = access.canView ? await getAdminSubjects() : [];
  const exams = access.canView ? await getAdminExams() : [];

  return (
    <AdminPageFrame
      access={access}
      title="Manage subjects"
      description="Create and edit subjects under an exam. Subjects become the parent for topic organization."
    >
      {message ? (
        <div className="mt-6 border border-[#ccd8d4] bg-white px-4 py-3 text-sm font-medium text-[#34403c]">
          {message}
        </div>
      ) : null}

      <section className="mt-8 border border-[#d9dee7] bg-white p-5">
        <h2 className="text-xl font-semibold">Create subject</h2>
        <form action={createSubject} className="mt-5 grid gap-4 lg:grid-cols-2">
          <ExamSelect exams={exams} />
          <AdminTextField
            label="Order"
            name="orderIndex"
            type="number"
            defaultValue="0"
          />
          <AdminTextField label="Name" name="name" placeholder="Geography" required />
          <AdminTextField
            label="Slug"
            name="slug"
            placeholder="geography"
            required
          />
          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Description
            <textarea
              name="description"
              rows={3}
              className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
            />
          </label>
          <div className="flex items-center justify-end lg:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
            >
              Create subject
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Existing subjects</h2>
        <div className="mt-4 grid gap-4">
          {subjects.map((subject) => (
            <form
              key={subject.id}
              action={updateSubject}
              className="border border-[#d9dee7] bg-white p-5"
            >
              <input name="id" type="hidden" value={subject.id} />
              <div className="grid gap-4 lg:grid-cols-2">
                <ExamSelect exams={exams} defaultValue={subject.examId} />
                <AdminTextField
                  label="Order"
                  name="orderIndex"
                  type="number"
                  defaultValue={String(subject.orderIndex)}
                />
                <AdminTextField
                  label="Name"
                  name="name"
                  defaultValue={subject.name}
                  required
                />
                <AdminTextField
                  label="Slug"
                  name="slug"
                  defaultValue={subject.slug}
                  required
                />
                <label className="grid gap-2 text-sm font-medium lg:col-span-2">
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={subject.description ?? ""}
                    className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-sm text-[#475467]">
                  <span className="border border-[#d9dee7] px-3 py-2">
                    {subject.examName}
                  </span>
                  <span className="border border-[#d9dee7] px-3 py-2">
                    {subject.topicCount} topics
                  </span>
                </div>
                <button
                  type="submit"
                  className="rounded-md border border-[#146b5f] px-4 py-2 text-sm font-semibold text-[#146b5f]"
                >
                  Save changes
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </AdminPageFrame>
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
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "number";
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
      />
    </label>
  );
}
