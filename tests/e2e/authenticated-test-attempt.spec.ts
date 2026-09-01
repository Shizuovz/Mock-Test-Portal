import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Load environment for Supabase Admin user setup
function loadEnv() {
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

loadEnv();

const TEST_EMAIL = "e2e-student@mockportal.test";
const TEST_PASSWORD = "TestPassword123!";
const TEST_ID = "55555555-5555-4555-8555-555555555555";

test.describe("Authenticated Student Test Journey", () => {
  test.beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return;
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data } = await supabase.auth.admin.listUsers();
    const existing = data?.users.find((u) => u.email === TEST_EMAIL);

    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, {
        password: TEST_PASSWORD,
        email_confirm: true,
      });
    } else {
      await supabase.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "E2E Test Student" },
      });
    }
  });

  test("executes full student lifecycle: login -> start test -> answer questions -> submit -> view scorecard & review", async ({
    page,
  }) => {
    // 1. Log in with authenticated test credentials
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/Log in/i);

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // 2. Assert redirect to student dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator("h1")).toBeVisible();

    // 3. Navigate to the timed mock test
    await page.goto(`/test/${TEST_ID}`);

    // Verify active test shell loaded and question is rendered
    await expect(page.locator("text=Question 1 of")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Question palette")).toBeVisible();

    // 4. Select an answer for Question 1
    const optionButtons = page.locator("section button.border");
    await expect(optionButtons.first()).toBeVisible();
    // Click option "30" (or the third option button)
    const targetOption = page.locator("section button", { hasText: /^30$/ }).first();
    if (await targetOption.isVisible()) {
      await targetOption.click();
    } else {
      await optionButtons.first().click();
    }

    // 5. Navigate to Question 2 via Save & Next
    await page.getByRole("button", { name: /Save & Next/i }).click();
    await expect(page.locator("text=Question 2 of")).toBeVisible();
    await expect(page.locator("text=⏱️")).toBeVisible();

    // Select an option on Question 2
    const q2Option = page.locator("section button", { hasText: /25%/i }).first();
    if (await q2Option.isVisible()) {
      await q2Option.click();
    } else {
      await page.locator("section button.border").first().click();
    }

    // 6. Submit the test attempt
    await page.getByRole("button", { name: /^Submit test$/i }).click();

    // 7. Verify confirmation modal appears and confirm
    await expect(
      page.getByRole("heading", { name: /Submit this test\?/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Confirm submit/i }).click();

    // 8. Verify post-submission results page
    await expect(page).toHaveURL(new RegExp(`/test/${TEST_ID}/result`), { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "SSC CGL Percentage Mini Mock" }),
    ).toBeVisible();
    await expect(page.getByText("Score", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Percentage", { exact: true }).first()).toBeVisible();

    // Verify Pacing & Time Diagnostics section
    await expect(page.getByText("Pacing & Time Diagnostics").first()).toBeVisible();
    await expect(page.getByText("Avg Time / Question").first()).toBeVisible();

    // 9. Verify answer explanations and solution report are displayed
    await expect(page.getByText("Correct Answer").first()).toBeVisible();
    await expect(page.getByText("Explanation:").first()).toBeVisible();

    // 10. Check that the attempt appears in Student Results History
    await page.goto("/dashboard/results");
    await expect(page.locator("h1")).toContainText(/Attempt results/i);
    await expect(page.getByRole("link", { name: /Review answers/i }).first()).toBeVisible();
  });
});
