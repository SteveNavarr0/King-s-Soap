import { test, expect } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";

test.describe("Login - Forgot Password", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/auth/v1/session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: null,
          token_type: "bearer",
          user: null,
        }),
      });
    });
  });

  // ==================================================
  // FP001: FORGOT PASSWORD NAVIGATION
  // ==================================================

  test("FP001: Forgot Password link navigates to the reset page", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`);

    await page
      .getByRole("link", { name: "Forgot Password?" })
      .click();

    // Wait for React Router to finish navigation.
    await page.waitForURL(/\/emailToPWReset\/?$/i, {
      timeout: 15_000,
    });

    await expect(
      page.getByRole("heading", {
        name: "Reset Your Password",
      })
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  // ==================================================
  // FP002: ENTER KEY SUBMISSION
  // ==================================================

  test("FP002: Pressing Enter submits the password reset request", async ({
    page,
  }) => {
    let requestCount = 0;

    await page.route("**/auth/v1/recover**", async (route) => {
      requestCount += 1;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page
      .getByRole("link", { name: "Forgot Password?" })
      .click();

    await page.waitForURL(/\/emailToPWReset\/?$/i, {
      timeout: 15_000,
    });

    const emailInput = page.getByLabel("Email");

    await emailInput.fill("test@example.com");
    await emailInput.press("Enter");

    await expect(
      page.getByText("Reset email sent. Check your email inbox.")
    ).toBeVisible();

    expect(requestCount).toBe(1);
  });
});