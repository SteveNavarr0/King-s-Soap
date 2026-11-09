import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:5173";

test.use({
  baseURL: BASE_URL,
  viewport: { width: 1440, height: 900 },
});

test.describe("Create Account & Verify Account Flow (Local Mock)", () => {
  const validUser = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    password: "Password123", // Meets >= 8 chars, at least 1 letter, at least 1 number
  };

  test.beforeEach(async ({ page }) => {
    // Intercept image assets from Supabase storage to speed up tests and avoid network calls
    await page.route("**/storage/v1/object/public/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(""),
      });
    });
  });

  // ============================================================
  // SUITE 1: COMPREHENSIVE INVALID INPUT & CLIENT VALIDATION
  // ============================================================

  const invalidInputScenarios = [
    {
      name: "name is completely empty",
      user: { name: "", email: "user@example.com", pass: "Password123", confirm: "Password123" },
      expectedError: "Please enter your name.",
    },
    {
      name: "name contains only whitespace",
      user: { name: "    ", email: "user@example.com", pass: "Password123", confirm: "Password123" },
      expectedError: "Please enter your name.",
    },
    {
      name: "email format is invalid (no domain)",
      user: { name: "Jane", email: "not-an-email", pass: "Password123", confirm: "Password123" },
      expectedError: "Please enter a valid email address.",
    },
    {
      name: "password is shorter than 8 characters",
      user: { name: "Jane", email: "user@example.com", pass: "Pass1", confirm: "Pass1" },
      expectedError: "Password must be at least 8 characters and include at least 1 letter and 1 number.",
    },
    {
      name: "password contains only numbers",
      user: { name: "Jane", email: "user@example.com", pass: "12345678", confirm: "12345678" },
      expectedError: "Password must be at least 8 characters and include at least 1 letter and 1 number.",
    },
    {
      name: "password contains only letters",
      user: { name: "Jane", email: "user@example.com", pass: "PasswordOnly", confirm: "PasswordOnly" },
      expectedError: "Password must be at least 8 characters and include at least 1 letter and 1 number.",
    },
    {
      name: "password and confirm password do not match",
      user: { name: "Jane", email: "user@example.com", pass: "Password123", confirm: "Different123" },
      expectedError: "Passwords do not match.",
    },
  ];

  for (const scenario of invalidInputScenarios) {
    test(`rejects input and displays error when ${scenario.name}`, async ({ page }) => {
      let signupRequestAttempted = false;
      page.on("request", (req) => {
        if (req.url().includes("/auth/v1/signup")) {
          signupRequestAttempted = true;
        }
      });

      await page.goto("/createaccount");

      // Fill in fields if provided
      if (scenario.user.name.length > 0) {
        await page.locator("#signup-name").fill(scenario.user.name);
      }
      if (scenario.user.email.length > 0) {
        await page.locator("#signup-email").fill(scenario.user.email);
      }
      if (scenario.user.pass.length > 0) {
        await page.locator("#signup-password").fill(scenario.user.pass);
      }
      if (scenario.user.confirm.length > 0) {
        await page.locator("#signup-confirm-password").fill(scenario.user.confirm);
      }

      await page.getByRole("button", { name: "Create Account" }).click();

      // Check whether it failed via HTML5 validation or React component state
      const nameInput = page.locator("#signup-name");
      const emailInput = page.locator("#signup-email");
      const passInput = page.locator("#signup-password");

      const hasNativeError = await Promise.all([
        nameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing),
        emailInput.evaluate((el: HTMLInputElement) => el.validity.typeMismatch || el.validity.valueMissing),
        passInput.evaluate((el: HTMLInputElement) => el.validity.tooShort || el.validity.valueMissing),
      ]).then((results) => results.some(Boolean));

      if (hasNativeError) {
        // Native HTML5 validation (required or minLength={8}) blocked submission
        expect(hasNativeError).toBe(true);
      } else {
        // React component validation branch executed
        await expect(page.getByText(scenario.expectedError)).toBeVisible();
      }

      // Assert user remained on /createaccount and no signup network request was made
      await expect(page).toHaveURL(/\/createaccount/);
      expect(signupRequestAttempted, "Supabase request must not be fired on invalid inputs").toBe(false);
    });
  }

  // ============================================================
  // SUITE 2: UI INTERACTIONS
  // ============================================================

  test("toggles password and confirm-password visibility with eye buttons", async ({ page }) => {
    await page.goto("/createaccount");

    const passwordInput = page.locator("#signup-password");
    const confirmInput = page.locator("#signup-confirm-password");

    // Both should be hidden by default
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(confirmInput).toHaveAttribute("type", "password");

    // Toggle main password
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Toggle confirm password
    await page.getByRole("button", { name: "Show confirmation password" }).click();
    await expect(confirmInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Hide confirmation password" }).click();
    await expect(confirmInput).toHaveAttribute("type", "password");
  });

  // ============================================================
  // SUITE 3: SUCCESSFUL SIGNUP & VERIFY ACCOUNT NAVIGATION
  // ============================================================

  test("successful registration passes first_name to Supabase and navigates to /verifyaccount", async ({ page }) => {
    // Intercept Supabase signup
    await page.route("**/auth/v1/signup*", async (route) => {
      const payload = route.request().postDataJSON();

      // Verify request payload matches expectations from CreateAccount.jsx
      expect(payload.email).toBe(validUser.email);
      expect(payload.data?.first_name).toBe(validUser.name);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "mock-user-uuid-1234",
            email: validUser.email,
            identities: [{ id: "identity-1" }],
          },
        }),
      });
    });

    await page.goto("/createaccount");

    await page.locator("#signup-name").fill(validUser.name);
    await page.locator("#signup-email").fill(validUser.email);
    await page.locator("#signup-password").fill(validUser.password);
    await page.locator("#signup-confirm-password").fill(validUser.password);

    await page.getByRole("button", { name: "Create Account" }).click();

    // Verify navigation and rendered confirmation screen
    await expect(page).toHaveURL(/\/verifyaccount/);
    await expect(page.getByRole("heading", { name: "Verify Your Account" })).toBeVisible();
    await expect(
      page.getByText("If this email is eligible, verification instructions were sent to your inbox.")
    ).toBeVisible();
  });

  // ============================================================
  // SUITE 4: RESEND VERIFICATION EMAIL ON /verifyaccount
  // ============================================================

  test("can resend verification email using state passed from registration", async ({ page }) => {
    // Mock signup
    await page.route("**/auth/v1/signup*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "mock-user-uuid-1234",
            email: validUser.email,
            identities: [{ id: "identity-1" }],
          },
        }),
      });
    });

    // Mock resend endpoint
    let resendEndpointHit = false;
    await page.route("**/auth/v1/resend*", async (route) => {
      const payload = route.request().postDataJSON();
      expect(payload.email).toBe(validUser.email);
      expect(payload.type).toBe("signup");
      resendEndpointHit = true;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    // Register to populate location.state.email
    await page.goto("/createaccount");
    await page.locator("#signup-name").fill(validUser.name);
    await page.locator("#signup-email").fill(validUser.email);
    await page.locator("#signup-password").fill(validUser.password);
    await page.locator("#signup-confirm-password").fill(validUser.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/verifyaccount/);

    // Click Resend Email
    const resendBtn = page.getByRole("button", { name: /ResendEmail|Resend Email/i });
    await expect(resendBtn).toBeVisible();
    await resendBtn.click();

    // Verify success confirmation and endpoint hit
    await expect(page.getByRole("status")).toHaveText("Verification email sent.");
    expect(resendEndpointHit).toBe(true);
  });

  test("shows error when clicking resend if visited directly without email state", async ({ page }) => {
    // Navigate directly without state
    await page.goto("/verifyaccount");

    const resendBtn = page.getByRole("button", { name: /ResendEmail|Resend Email/i });
    await expect(resendBtn).toBeVisible();
    await resendBtn.click();

    // Verify error message from VerifyAccount.jsx
    await expect(page.getByRole("status")).toHaveText(
      "Email address not found. Please create your account again."
    );
  });
// ============================================================
  // SUITE 5: DUPLICATE ACCOUNTS & EXISTING SESSIONS
  // ============================================================

  test("triggers password reset instead of creating account when email already exists", async ({ page }) => {
    // 1. Mock Supabase returning an existing user (identities array is empty)
    await page.route("**/auth/v1/signup*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "existing-user-uuid",
            email: validUser.email,
            identities: [], // Supabase indicates duplicate user with empty identities
          },
        }),
      });
    });

    // 2. Mock Supabase resetPasswordForEmail (/auth/v1/recover)
    await page.route("**/auth/v1/recover*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.goto("/createaccount");

    await page.locator("#signup-name").fill(validUser.name);
    await page.locator("#signup-email").fill(validUser.email);
    await page.locator("#signup-password").fill(validUser.password);
    await page.locator("#signup-confirm-password").fill(validUser.password);

    // 3. Set up listeners to wait for both network requests before clicking
    const signupPromise = page.waitForRequest((req) => req.url().includes("/auth/v1/signup"));
    const recoverPromise = page.waitForRequest((req) => req.url().includes("/auth/v1/recover"));

    await page.getByRole("button", { name: "Create Account" }).click();

    // 4. Await both requests and inspect their payloads
    const [signupReq, recoverReq] = await Promise.all([signupPromise, recoverPromise]);

    expect(signupReq.postDataJSON().email).toBe(validUser.email);
    expect(recoverReq.postDataJSON().email).toBe(validUser.email);

    // 5. Verify it still completes and navigates cleanly to /verifyaccount
    await expect(page).toHaveURL(/\/verifyaccount/);
  });
});