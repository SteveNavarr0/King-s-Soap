import { test, expect } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";

test.describe("Password Reset Page", () => {
  // The application uses a 30-second resend cooldown.
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/emailToPWReset`);
  });


  test("FP003: Confirmation message is displayed", async ({ page }) => {
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.getByLabel("Email").fill("test@example.com");

    const resetButton = page.locator('form button[type="submit"]');

    await resetButton.click();

    await expect(
      page.getByText("Reset email sent. Check your email inbox.")
    ).toBeVisible();
  });


  test("FP004: Resend Email becomes available after cooldown", async ({
    page,
  }) => {
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.getByLabel("Email").fill("test@example.com");

    const resetButton = page.locator('form button[type="submit"]');

    await resetButton.click();

    // Confirm that the countdown started.
    await expect(resetButton).toHaveText(/Resend in \d+s/);

    // Wait for the real 30-second cooldown.
    await expect(resetButton).toHaveText("Resend Email", {
      timeout: 50_000,
    });

    await expect(resetButton).toBeEnabled();
  });


  test("FP005: Resend Email sends another request", async ({ page }) => {
    let requestCount = 0;

    await page.route("**/auth/v1/recover**", async (route) => {
      requestCount += 1;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.getByLabel("Email").fill("test@example.com");

    const resetButton = page.locator('form button[type="submit"]');

    // Submit the first reset request.
    await resetButton.click();

    // Wait for the 30-second cooldown to finish.
    await expect(resetButton).toHaveText("Resend Email", {
      timeout: 50_000,
    });

    await expect(resetButton).toBeEnabled();

    // Submit the resend request.
    await resetButton.click();

    await expect.poll(() => requestCount).toBe(2);

    await expect(
      page.getByText("Reset email resent. Check your email inbox.")
    ).toBeVisible();
  });


  test("FP006: Reset password errors are displayed", async ({ page }) => {
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Unable to send reset email",
        }),
      });
    });

    await page.getByLabel("Email").fill("test@example.com");

    const resetButton = page.locator('form button[type="submit"]');

    await resetButton.click();

    await expect(
      page.getByText(/failed|unable|error/i).first()
    ).toBeVisible();
  });
});