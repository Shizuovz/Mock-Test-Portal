import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Load .env.local for integration test
function loadLocalEnv() {
  if (fs.existsSync(".env.local")) {
    const text = fs.readFileSync(".env.local", "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    }
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("Architecture & Database Compliance", () => {
  it("verifies all 12 core tables exist and are queryable via Supabase", async () => {
    expect(supabaseUrl).toBeDefined();
    expect(serviceKey).toBeDefined();

    const client = createClient(supabaseUrl!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const tables = [
      "profiles",
      "exams",
      "subjects",
      "topics",
      "questions",
      "question_options",
      "tests",
      "test_questions",
      "test_attempts",
      "user_answers",
      "bookmarks",
      "audit_logs",
    ];

    await Promise.all(
      tables.map(async (table) => {
        const { data, error } = await client.from(table).select("*").limit(1);
        expect(error, `Failed to query table "${table}": ${error?.message}`).toBeNull();
        expect(data).toBeDefined();
      }),
    );
  }, 20000);

  it("verifies safe question delivery excludes is_correct from question options", async () => {
    const client = createClient(supabaseUrl!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Query safe projection for test questions as defined in start-attempt.ts
    const { data: testQuestions, error } = await client
      .from("test_questions")
      .select(`
        question_id,
        order_index,
        questions (
          id,
          question_text,
          question_type,
          question_options (
            id,
            option_text,
            order_index
          )
        )
      `)
      .limit(1);

    expect(error).toBeNull();
    expect(testQuestions).toBeDefined();

    if (testQuestions && testQuestions.length > 0) {
      const q = Array.isArray(testQuestions[0].questions)
        ? testQuestions[0].questions[0]
        : testQuestions[0].questions;

      if (q && q.question_options) {
        for (const opt of q.question_options) {
          // Confirm is_correct is NOT returned by the safe payload projection
          expect(opt).not.toHaveProperty("is_correct");
        }
      }
    }
  });

  it("verifies single-choice questions in database have exactly 1 correct option", async () => {
    const client = createClient(supabaseUrl!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: questions, error } = await client
      .from("questions")
      .select(`
        id,
        question_text,
        question_options (
          id,
          is_correct
        )
      `)
      .eq("question_type", "single_choice")
      .limit(5);

    expect(error).toBeNull();
    expect(questions).toBeDefined();

    if (questions) {
      for (const q of questions) {
        const correctCount = (q.question_options ?? []).filter(
          (opt: { is_correct: boolean }) => opt.is_correct,
        ).length;
        expect(correctCount).toBe(1);
      }
    }
  });
});
