import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminAccess } from "@/lib/admin/content-read-model";
import {
  type ParsedImportRow,
  type BulkImportResult,
  parseCSV,
  splitCSVLines,
  parseCSVRow,
} from "./bulk-import-parser";

export {
  type ParsedImportRow,
  type BulkImportResult,
  parseCSV,
  splitCSVLines,
  parseCSVRow,
};

export async function executeBulkImport(rows: ParsedImportRow[]): Promise<BulkImportResult> {
  const access = await getAdminAccess();
  if (!access.canView) {
    throw new Error("Unauthorized: Admin or editor permissions required.");
  }

  const validRows = rows.filter((r) => r.isValid);
  if (validRows.length === 0) {
    return {
      totalRows: rows.length,
      validRows: 0,
      invalidRows: rows.length,
      importedCount: 0,
      errors: ["No valid rows to import."],
    };
  }

  const db = createSupabaseAdminClient();
  const errors: string[] = [];
  let importedCount = 0;

  // Cache lookups for exams, subjects, and topics to minimize queries
  const examCache = new Map<string, string>(); // name -> id
  const subjectCache = new Map<string, string>(); // `${examId}:${name}` -> id
  const topicCache = new Map<string, string>(); // `${subjectId}:${name}` -> id

  for (const row of validRows) {
    try {
      // 1. Resolve Exam
      let examId = examCache.get(row.exam.toLowerCase());
      if (!examId) {
        const { data: existingExam } = await db
          .from("exams")
          .select("id")
          .ilike("name", row.exam)
          .maybeSingle();

        if (existingExam) {
          examId = existingExam.id;
        } else {
          // Create exam
          const slug = row.exam.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const { data: newExam, error: examErr } = await db
            .from("exams")
            .insert({ name: row.exam, slug: slug || `exam-${Date.now()}` })
            .select("id")
            .single();

          if (examErr || !newExam) {
            errors.push(`Row ${row.rowNumber}: Failed to create exam "${row.exam}".`);
            continue;
          }
          examId = newExam.id;
        }
        if (!examId) continue;
        examCache.set(row.exam.toLowerCase(), examId);
      }

      // 2. Resolve Subject
      const subjectKey = `${examId}:${row.subject.toLowerCase()}`;
      let subjectId = subjectCache.get(subjectKey);
      if (!subjectId) {
        const { data: existingSub } = await db
          .from("subjects")
          .select("id")
          .eq("exam_id", examId)
          .ilike("name", row.subject)
          .maybeSingle();

        if (existingSub) {
          subjectId = existingSub.id;
        } else {
          const slug = row.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const { data: newSub, error: subErr } = await db
            .from("subjects")
            .insert({
              exam_id: examId,
              name: row.subject,
              slug: slug || `subject-${Date.now()}`,
              order_index: 1,
            })
            .select("id")
            .single();

          if (subErr || !newSub) {
            errors.push(`Row ${row.rowNumber}: Failed to create subject "${row.subject}".`);
            continue;
          }
          subjectId = newSub.id;
        }
        if (!subjectId) continue;
        subjectCache.set(subjectKey, subjectId);
      }

      // 3. Resolve Topic
      const topicKey = `${subjectId}:${row.topic.toLowerCase()}`;
      let topicId = topicCache.get(topicKey);
      if (!topicId) {
        const { data: existingTopic } = await db
          .from("topics")
          .select("id")
          .eq("subject_id", subjectId)
          .ilike("name", row.topic)
          .maybeSingle();

        if (existingTopic) {
          topicId = existingTopic.id;
        } else {
          const slug = row.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const { data: newTopic, error: topicErr } = await db
            .from("topics")
            .insert({
              subject_id: subjectId,
              name: row.topic,
              slug: slug || `topic-${Date.now()}`,
              order_index: 1,
            })
            .select("id")
            .single();

          if (topicErr || !newTopic) {
            errors.push(`Row ${row.rowNumber}: Failed to create topic "${row.topic}".`);
            continue;
          }
          topicId = newTopic.id;
        }
        if (!topicId) continue;
        topicCache.set(topicKey, topicId);
      }

      // 4. Insert Question
      const { data: newQuestion, error: qErr } = await db
        .from("questions")
        .insert({
          topic_id: topicId,
          question_text: row.questionText,
          question_type: "single_choice",
          difficulty: row.difficulty,
          explanation: row.explanation ?? null,
          default_marks: row.marks,
          default_negative_marks: row.negativeMarks,
          status: "published",
        })
        .select("id")
        .single();

      if (qErr || !newQuestion) {
        errors.push(`Row ${row.rowNumber}: Failed to insert question. ${qErr?.message || ""}`);
        continue;
      }

      // 5. Insert Options
      const optionsToInsert = [
        {
          question_id: newQuestion.id,
          option_text: row.optionA,
          is_correct: row.correctOption === "A",
          order_index: 1,
        },
        {
          question_id: newQuestion.id,
          option_text: row.optionB,
          is_correct: row.correctOption === "B",
          order_index: 2,
        },
        {
          question_id: newQuestion.id,
          option_text: row.optionC,
          is_correct: row.correctOption === "C",
          order_index: 3,
        },
        {
          question_id: newQuestion.id,
          option_text: row.optionD,
          is_correct: row.correctOption === "D",
          order_index: 4,
        },
      ];

      const { error: optErr } = await db.from("question_options").insert(optionsToInsert);
      if (optErr) {
        errors.push(`Row ${row.rowNumber}: Failed to insert question options. ${optErr.message}`);
        continue;
      }

      importedCount++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Row ${row.rowNumber}: Unexpected error: ${msg}`);
    }
  }

  // Audit log
  await db.from("audit_logs").insert({
    action: "bulk_import_questions",
    entity_type: "questions",
    metadata: {
      totalRows: rows.length,
      importedCount,
      errorsCount: errors.length,
    },
  });

  return {
    totalRows: rows.length,
    validRows: validRows.length,
    invalidRows: rows.length - validRows.length,
    importedCount,
    errors,
  };
}
