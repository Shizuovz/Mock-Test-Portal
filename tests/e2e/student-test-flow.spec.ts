import { test, expect } from "@playwright/test";

test.describe("Student Discovery & Navigation Flow", () => {
  test("visits home page and browses public exam catalog", async ({ page }) => {
    // 1. Home page
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse exams/i })).toBeVisible();

    // 2. Exams directory
    await page.goto("/exams");
    await expect(page.locator("h1")).toContainText(/Choose an exam/i);
    await expect(page.locator("h2", { hasText: "SSC CGL" })).toBeVisible();
  });

  test("browses available mock tests and validates login gate on active test", async ({ page }) => {
    // 1. Available mock tests
    await page.goto("/dashboard/tests");
    await expect(page.locator("h1")).toContainText(/Available Mock Tests/i);

    const testCard = page.locator("article").first();
    await expect(testCard).toBeVisible();
    await expect(testCard).toContainText(/Duration: 10 mins/i);

    // 2. Click Start Test / navigate to active test (unauthenticated gate)
    await page.goto("/test/55555555-5555-4555-8555-555555555555");
    await expect(page.locator("h1")).toContainText(/Log in to start this test/i);
    await expect(page.locator("text=Attempts are tied to your account")).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to login/i })).toBeVisible();
  });

  test("validates authentication screens", async ({ page }) => {
    // Login
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/Log in/i);
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.getByRole("link", { name: /Forgot password\?/i })).toBeVisible();

    // Register
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText(/Create account/i);

    // Forgot password
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toContainText(/Reset password/i);
  });

  test("visits student bookmarks and performance analytics hubs", async ({ page }) => {
    // Bookmarks hub
    await page.goto("/dashboard/bookmarks");
    await expect(page.locator("h1")).toContainText(/Bookmarked questions/i);

    // Performance & weak topics hub
    await page.goto("/dashboard/performance");
    await expect(page.locator("h1")).toContainText(/Performance & weak areas/i);
    await expect(page.locator("text=Overall accuracy")).toBeVisible();
    await expect(page.locator("text=Tests completed")).toBeVisible();
  });
});
