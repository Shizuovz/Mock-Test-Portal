"use server";

import { revalidatePath } from "next/cache";
import { executeBulkImport, parseCSV, type BulkImportResult } from "@/lib/admin/bulk-import";

export async function importQuestionsAction(csvText: string): Promise<BulkImportResult> {
  const rows = parseCSV(csvText);
  const result = await executeBulkImport(rows);
  revalidatePath("/admin/questions");
  revalidatePath("/admin/exams");
  return result;
}
