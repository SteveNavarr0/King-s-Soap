import { test, expect } from "@playwright/test";

// ============================================================
// LOGIN PAGE END-TO-END
// Covers: credential login to the account page, the forgot
// password and create account links, the site navigation bar,
// and the footer contact information.
//
// Credentials: set PW_USER_EMAIL and PW_USER_PASSWORD for a
// regular test user. Falls back to ADMIN_EMAIL / ADMIN_PASSWORD
// from .env.test when those are not set.
// ============================================================

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:5173";
const EMAIL = process.env.PW_USER_EMAIL || process.env.ADMIN_EMAIL;
const PASSWORD = process.env.PW_USER_PASSWORD || process.env.ADMIN_PASSWORD;

test.use({
  baseURL: BASE_URL,

  // Desktop dimensions so the navigation bar links are visible
  viewport: {
    width: 1440,
    height: 900,
  },
});

// Identify the Supabase password-login response.
function isLoginResponse(response) {
  const url = new URL(response.url());

  return (
    url.pathname === "/auth/v1/token" &&
    url.searchParams.get("grant_type") === "password" &&
    response.request().method() === "POST"
  );
}

test.describe("King's Soap - Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  // LOGIN-001: Email & Password Login to Account Page
  test("LOGIN-001: User enters email and password and proceeds to the account page", async ({ page }) => {
    test.skip(
      !EMAIL || !PASSWORD,
      "Set PW_USER_EMAIL/PW_USER_PASSWORD or ADMIN_EMAIL/ADMIN_PASSWORD to run the login test."
    );

    await page
      .getByPlaceholder("Email Address", { exact: true })
      .fill(EMAIL);

    await page
      .getByPlaceholder("Password", { exact: true })
      .fill(PASSWORD);

    const [response] = await Promise.all([
      page.waitForResponse(isLoginResponse, { timeout: 20_000 }),
      page
        .getByRole("button", { name: "Log In", exact: true })
        .click(),
    ]);

    expect(
      response.ok(),
      `Login returned HTTP ${response.status()}`
    ).toBe(true);

    // Successful login leaves the login page
    // (admins land on /Admin, customers on /).
    await expect(page).not.toHaveURL(/\/login\/?$/i, {
      timeout: 15_000,
    });

    // The account page is protected and only reachable while authenticated.
    await page.goto("/userAccount");

    await expect(
      page.getByRole("heading", { name: /hello,/i })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Change Password", exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Change Address", exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Log Out", exact: true })
    ).toBeVisible();
  });

  // LOGIN-002: Forgot Password Navigation
  test("LOGIN-002: Forgot Password option navigates to the forgot password page", async ({ page }) => {
    await page
      .getByRole("link", { name: "Forgot Password?", exact: true })
      .click();

    await expect(page).toHaveURL(/\/emailToPWReset\/?$/i);

    await expect(
      page.getByRole("heading", { name: "Reset Your Password", exact: true })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("Enter your email", { exact: true })
    ).toBeVisible();
  });

  // LOGIN-003: Create Account Navigation
  test("LOGIN-003: Create an account option navigates to the create account page", async ({ page }) => {
    await page
      .getByRole("link", { name: "Create an account", exact: true })
      .click();

    await expect(page).toHaveURL(/\/createaccount\/?$/i);

    await expect(
      page.getByRole("button", { name: "Create Account", exact: true })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder("user@example.com", { exact: true })
    ).toBeVisible();
  });

  // LOGIN-004: Site Navigation Bar
  test("LOGIN-004: Site navigation bar renders and navigates", async ({ page }) => {
    const navbar = page.getByRole("navigation");

    await expect(navbar).toBeVisible();

    // Verify the public navigation links are visible
    for (const name of ["Home", "Shop", "About", "Log In"]) {
      await expect(
        navbar.getByRole("link", { name, exact: true })
      ).toBeVisible();
    }

    // Verify the shopping cart link is visible
    await expect(navbar.locator('a[href="/cart"]')).toBeVisible();

    // Verify a navigation link actually routes
    await navbar.getByRole("link", { name: "Shop", exact: true }).click();
    await expect(page).toHaveURL(/\/shop\/?$/i);
  });

  // LOGIN-005: Footer Contact Information
  test("LOGIN-005: Footer features contact information", async ({ page }) => {
    const footer = page.locator("footer");

    await expect(footer).toBeVisible();

    // Verify the Contact Us heading
    await expect(
      footer.getByRole("heading", { name: "Contact Us", exact: true })
    ).toBeVisible();

    // Verify the Google Maps location link
    const mapsLink = footer.locator(
      'a[href="https://maps.google.com/maps?q=Sacramento+CA"]'
    );

    await expect(mapsLink).toBeVisible();
    await expect(mapsLink).toHaveAttribute("target", "_blank");

    // Verify the Instagram link
    const instagramLink = footer.locator(
      'a[href="https://instagram.com/kingssoap"]'
    );

    await expect(instagramLink).toBeVisible();
    await expect(instagramLink).toHaveAttribute("target", "_blank");

    // Verify the contact form (email) button
    await expect(
      footer.getByRole("button", { name: "Open contact form", exact: true })
    ).toBeVisible();
  });
});
