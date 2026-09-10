import { test, expect } from "@playwright/test";

test.describe("Password Recovery & Update Flow", () => {
  test("submits password reset request form and validates feedback", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toContainText(/Reset password/i);

    const emailInput = page.locator("input[name='email']");
    await expect(emailInput).toBeVisible();

    await emailInput.fill("student@example.com");
    await page.getByRole("button", { name: /Send reset instructions/i }).click();

    // Verification that submission redirects with query message
    await expect(page).toHaveURL(/forgot-password\?success=/);
    await expect(page.locator("text=Check your email for the password reset link")).toBeVisible();
  });

  test("renders set new password interface correctly", async ({ page }) => {
    await page.goto("/update-password");
    await expect(page.locator("h1")).toContainText(/Set new password/i);
    await expect(page.locator("input[name='password']")).toBeVisible();
    await expect(page.locator("input[name='confirmPassword']")).toBeVisible();
    await expect(page.getByRole("button", { name: /Update Password/i })).toBeVisible();
  });
});
