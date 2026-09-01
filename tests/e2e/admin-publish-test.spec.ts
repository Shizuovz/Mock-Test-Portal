import { test, expect } from "@playwright/test";

test.describe("Admin Role Security & Boundary Verification", () => {
  test("denies anonymous access to admin overview and prompts for login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText(/Permission required/i);
    await expect(page.locator("text=Sign in with an editor or admin account")).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to login/i })).toBeVisible();
  });

  test("denies anonymous access to question bank and bulk import", async ({ page }) => {
    await page.goto("/admin/questions");
    await expect(page.locator("h1")).toContainText(/Permission required/i);

    await page.goto("/admin/questions/import");
    await expect(page.locator("h1")).toContainText(/Permission required/i);
  });

  test("denies anonymous access to admin attempts monitor, users, and reports", async ({ page }) => {
    await page.goto("/admin/attempts");
    await expect(page.locator("h1")).toContainText(/Permission required/i);

    await page.goto("/admin/users");
    await expect(page.locator("h1")).toContainText(/Permission required/i);

    await page.goto("/admin/reports");
    await expect(page.locator("h1")).toContainText(/Permission required/i);
  });
});
