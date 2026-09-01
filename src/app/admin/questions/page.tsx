import { AdminPageFrame } from "@/components/admin/admin-page-frame";
import { QuestionBankManager } from "@/components/admin/question-bank-manager";
import {
  getAdminAccess,
  getAdminQuestions,
  getAdminTopics,
} from "@/lib/admin/content-read-model";

export const dynamic = "force-dynamic";

type AdminQuestionsPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function AdminQuestionsPage({
  searchParams,
}: AdminQuestionsPageProps) {
  const { message } = await searchParams;
  const access = await getAdminAccess();
  const questions = access.canView ? await getAdminQuestions() : [];
  const topics = access.canView ? await getAdminTopics() : [];

  return (
    <AdminPageFrame
      access={access}
      title="Question bank"
      description="Create, search, filter, and edit single-choice MCQs. Published questions can be assembled into tests."
    >
      {message ? (
        <div className="mb-6 rounded-md border border-[#ccd8d4] bg-white px-4 py-3 text-sm font-medium text-[#34403c] shadow-sm">
          {message}
        </div>
      ) : null}

      <QuestionBankManager questions={questions} topics={topics} />
    </AdminPageFrame>
  );
}
