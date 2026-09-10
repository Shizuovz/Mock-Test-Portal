import { test, expect } from "@playwright/test";

test.describe("Operational Health API & Student Billing Views", () => {
  test("verifies /api/health endpoint returns 200 with db status and zero secret leakage", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body.status).toBe("healthy");
    expect(body.services.database).toBe("connected");
    expect(body).toHaveProperty("timestamp");

    // Critical invariant: zero credentials/secrets in health response
    expect(body).not.toHaveProperty("key");
    expect(body).not.toHaveProperty("secret");
    expect(body).not.toHaveProperty("password");
    expect(body).not.toHaveProperty("SUPABASE_DATABASE_URL");
  });

  test("visits pricing page and verifies all-access plan display", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1")).toContainText(/Prepare Without Limits/i);
    await expect(page.locator("text=Free Tier")).toBeVisible();
    await expect(page.locator("text=All-Access Pass")).toBeVisible();
    await expect(page.getByRole("button", { name: /Unlock All-Access Pass/i })).toBeVisible();
  });
});
