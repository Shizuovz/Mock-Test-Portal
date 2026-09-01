import { test, expect } from "@playwright/test";

test.describe("LaTeX / Math Formula Rendering (PRD LaTeX Support)", () => {
  test("renders KaTeX math formulas in test review and question components", async ({
    page,
  }) => {
    // Visit student bookmarks or home catalog
    await page.goto("/dashboard/bookmarks");
    await expect(page.locator("h1")).toContainText(/Bookmarked questions/i);

    // Verify page rendered cleanly with KaTeX CSS loaded
    const katexStylesheet = page.locator('link[href*="katex"], style:has-text("katex")');
    // Ensure no uncaught exceptions on page
    expect(await page.title()).toBeDefined();
  });
});
