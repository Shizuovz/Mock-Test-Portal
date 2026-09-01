import { AdminPageFrame } from "@/components/admin/admin-page-frame";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import { BulkImportPreview } from "@/components/admin/bulk-import-preview";

export const dynamic = "force-dynamic";

export default async function AdminQuestionImportPage() {
  const access = await getAdminAccess();

  return (
    <AdminPageFrame
      access={access}
      title="Bulk Question Import"
      description="Upload or paste CSV question spreadsheets to batch-import questions, options, and topics with instant validation."
    >
      <BulkImportPreview />
    </AdminPageFrame>
  );
}
