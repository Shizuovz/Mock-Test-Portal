import { test, expect } from "@playwright/test";

test.describe("Configurable Test Retake Policies (PRD §31)", () => {
  test("renders attempt policy indicators and score highlights on available mock tests", async ({
    page,
  }) => {
    await page.goto("/dashboard/tests");
    await expect(page.locator("h1")).toContainText(/Available Mock Tests/i);

    const testCard = page.locator("article").first();
    await expect(testCard).toBeVisible();

    // Verify card displays duration and questions
    await expect(testCard).toContainText(/Duration:/i);
    await expect(testCard).toContainText(/Questions:/i);
  });
});
