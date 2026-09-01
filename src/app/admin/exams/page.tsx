import { AdminPageFrame } from "@/components/admin/admin-page-frame";
import { createExam, updateExam } from "@/lib/actions/admin-actions";
import { getAdminAccess, getAdminExams } from "@/lib/admin/content-read-model";

export const dynamic = "force-dynamic";

type AdminExamsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AdminExamsPage({
  searchParams,
}: AdminExamsPageProps) {
  const { message } = await searchParams;
  const access = await getAdminAccess();
  const exams = access.canView ? await getAdminExams() : [];

  return (
    <AdminPageFrame
      access={access}
      title="Manage exams"
      description="Create and update exam catalog entries. Published tests and attempts remain linked by stable exam IDs."
    >
      {message ? (
        <div className="mt-6 border border-[#ccd8d4] bg-white px-4 py-3 text-sm font-medium text-[#34403c]">
          {message}
        </div>
      ) : null}

      <section className="mt-8 border border-[#d9dee7] bg-white p-5">
        <h2 className="text-xl font-semibold">Create exam</h2>
        <form action={createExam} className="mt-5 grid gap-4 lg:grid-cols-2">
          <AdminTextField label="Name" name="name" placeholder="SSC CGL" required />
          <AdminTextField
            label="Slug"
            name="slug"
            placeholder="ssc-cgl"
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
          <label className="flex items-center gap-2 text-sm font-medium">
            <input name="isActive" type="checkbox" defaultChecked />
            Active
          </label>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="rounded-md bg-[#146b5f] px-4 py-2 text-sm font-semibold text-white"
            >
              Create exam
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Existing exams</h2>
        <div className="mt-4 grid gap-4">
          {exams.map((exam) => (
            <form
              key={exam.id}
              action={updateExam}
              className="border border-[#d9dee7] bg-white p-5"
            >
              <input name="id" type="hidden" value={exam.id} />
              <div className="grid gap-4 lg:grid-cols-2">
                <AdminTextField
                  label="Name"
                  name="name"
                  defaultValue={exam.name}
                  required
                />
                <AdminTextField
                  label="Slug"
                  name="slug"
                  defaultValue={exam.slug}
                  required
                />
                <label className="grid gap-2 text-sm font-medium lg:col-span-2">
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={exam.description ?? ""}
                    className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-sm text-[#475467]">
                  <span className="border border-[#d9dee7] px-3 py-2">
                    {exam.subjectCount} subjects
                  </span>
                  <span className="border border-[#d9dee7] px-3 py-2">
                    {exam.testCount} tests
                  </span>
                  <label className="flex items-center gap-2 border border-[#d9dee7] px-3 py-2 font-medium text-[#15171a]">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={exam.isActive}
                    />
                    Active
                  </label>
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

function AdminTextField({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="border border-[#ccd8d4] bg-[#fbfcfb] px-3 py-2"
      />
    </label>
  );
}
