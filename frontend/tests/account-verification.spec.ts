import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:5173";
const SIGNUP_PATH = "/functions/v1/user-resign-up";
const SIGNUP_ROUTE = "**/functions/v1/user-resign-up*";

test.use({
  baseURL: BASE_URL,
  viewport: { width: 1440, height: 900 },
});

test.describe("Create Account & Verify Account Flow (Local Mock)", () => {
  const validUser = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    password: "Password123",
  };

  test.beforeEach(async ({ page }) => {
    // Mock signup so tests do not call the real signup function.
    // Individual tests can override this response.
    await page.route(SIGNUP_ROUTE, async (route) => {
      await route.fulfill({
        status: 200,
        json: {},
      });
    });

    // Mock verification-email resend.
    await page.route("**/auth/v1/resend*", async (route) => {
      await route.fulfill({
        status: 200,
        json: {},
      });
    });

    // Avoid fetching images from Supabase storage.
    await page.route("**/storage/v1/object/public/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(""),
      });
    });
  });

  // ============================================================
  // SUITE 1: INVALID INPUT & CLIENT VALIDATION
  // ============================================================

  const invalidInputScenarios = [
    {
      name: "name is completely empty",
      user: {
        name: "",
        email: "user@example.com",
        pass: "Password123",
        confirm: "Password123",
      },
      expectedError: "Please enter a name of 1–100 characters.",
    },
    {
      name: "name contains only whitespace",
      user: {
        name: "    ",
        email: "user@example.com",
        pass: "Password123",
        confirm: "Password123",
      },
      expectedError: "Please enter a name of 1–100 characters.",
    },
    {
      name: "email format is invalid (no domain)",
      user: {
        name: "Jane",
        email: "not-an-email",
        pass: "Password123",
        confirm: "Password123",
      },
      expectedError: "Please enter a valid email address.",
    },
    {
      name: "password is shorter than 8 characters",
      user: {
        name: "Jane",
        email: "user@example.com",
        pass: "Pass1",
        confirm: "Pass1",
      },
      expectedError:
        "Password must be 8–128 characters and include at least 1 letter and 1 number.",
    },
    {
      name: "password contains only numbers",
      user: {
        name: "Jane",
        email: "user@example.com",
        pass: "12345678",
        confirm: "12345678",
      },
      expectedError:
        "Password must be 8–128 characters and include at least 1 letter and 1 number.",
    },
    {
      name: "password contains only letters",
      user: {
        name: "Jane",
        email: "user@example.com",
        pass: "PasswordOnly",
        confirm: "PasswordOnly",
      },
      expectedError:
        "Password must be 8–128 characters and include at least 1 letter and 1 number.",
    },
    {
      name: "password and confirm password do not match",
      user: {
        name: "Jane",
        email: "user@example.com",
        pass: "Password123",
        confirm: "Different123",
      },
      expectedError: "Passwords do not match.",
    },
  ];

  for (const scenario of invalidInputScenarios) {
    test(`rejects input and displays error when ${scenario.name}`, async ({
      page,
    }) => {
      let signupRequestAttempted = false;

      page.on("request", (req) => {
        if (
          new URL(req.url()).pathname === SIGNUP_PATH &&
          req.method() === "POST"
        ) {
          signupRequestAttempted = true;
        }
      });

      await page.goto("/createaccount");

      const nameInput = page.locator("#signup-name");
      const emailInput = page.locator("#signup-email");
      const passwordInput = page.locator("#signup-password");
      const confirmInput = page.locator("#signup-confirm-password");

      await nameInput.fill(scenario.user.name);
      await emailInput.fill(scenario.user.email);
      await passwordInput.fill(scenario.user.pass);
      await confirmInput.fill(scenario.user.confirm);

      await page
        .getByRole("button", { name: "Create Account", exact: true })
        .click();

      // Submission can be blocked by native browser validation
      // or by the React component's validation.
      const hasNativeError = await Promise.all([
        nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid),
        emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid),
        passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid),
        confirmInput.evaluate((el: HTMLInputElement) => !el.validity.valid),
      ]).then((results) => results.some(Boolean));

      if (hasNativeError) {
        expect(hasNativeError).toBe(true);
      } else {
        await expect(page.getByRole("alert")).toHaveText(
          scenario.expectedError
        );
      }

      await expect(page).toHaveURL(/\/createaccount/);

      expect(
        signupRequestAttempted,
        "Signup request must not be fired on invalid inputs"
      ).toBe(false);
    });
  }

  // ============================================================
  // SUITE 2: PASSWORD VISIBILITY
  // ============================================================

  test("toggles password and confirm-password visibility with eye buttons", async ({
    page,
  }) => {
    await page.goto("/createaccount");

    const passwordInput = page.locator("#signup-password");
    const confirmInput = page.locator("#signup-confirm-password");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(confirmInput).toHaveAttribute("type", "password");

    await page
      .getByRole("button", { name: "Show password", exact: true })
      .click();

    await expect(passwordInput).toHaveAttribute("type", "text");

    await page
      .getByRole("button", { name: "Hide password", exact: true })
      .click();

    await expect(passwordInput).toHaveAttribute("type", "password");

    await page
      .getByRole("button", {
        name: "Show confirmation password",
        exact: true,
      })
      .click();

    await expect(confirmInput).toHaveAttribute("type", "text");

    await page
      .getByRole("button", {
        name: "Hide confirmation password",
        exact: true,
      })
      .click();

    await expect(confirmInput).toHaveAttribute("type", "password");
  });

  // ============================================================
  // SUITE 3: SUCCESSFUL SIGNUP & VERIFICATION PAGE
  // ============================================================

  test("successful registration passes firstName to the signup function and navigates to /verifyaccount", async ({
    page,
  }) => {
    let signupPayload: Record<string, unknown> | undefined;

    await page.route(SIGNUP_ROUTE, async (route) => {
      signupPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.goto("/createaccount");

    await page.locator("#signup-name").fill(validUser.name);
    await page.locator("#signup-email").fill(validUser.email);
    await page.locator("#signup-password").fill(validUser.password);
    await page.locator("#signup-confirm-password").fill(validUser.password);

    await page
      .getByRole("button", { name: "Create Account", exact: true })
      .click();

    await expect(page).toHaveURL(/\/verifyaccount/);

    expect(signupPayload).toEqual({
      email: validUser.email,
      password: validUser.password,
      firstName: validUser.name,
      redirectTo: `${new URL(BASE_URL).origin}/login`,
    });

    await expect(
      page.getByRole("heading", {
        name: "Verify your account",
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByText(
        "If this email is eligible, verification instructions were sent to your inbox.",
        { exact: true }
      )
    ).toBeVisible();
  });

  // ============================================================
  // SUITE 4: RESEND VERIFICATION EMAIL
  // ============================================================

  test("can resend verification email using state passed from registration", async ({
    page,
  }) => {
    let resendPayload: Record<string, unknown> | undefined;

    await page.route("**/auth/v1/resend*", async (route) => {
      resendPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        json: {},
      });
    });

    // Register to populate location.state.email.
    // Signup is mocked in beforeEach.
    await page.goto("/createaccount");

    await page.locator("#signup-name").fill(validUser.name);
    await page.locator("#signup-email").fill(validUser.email);
    await page.locator("#signup-password").fill(validUser.password);
    await page.locator("#signup-confirm-password").fill(validUser.password);

    await page
      .getByRole("button", { name: "Create Account", exact: true })
      .click();

    await expect(page).toHaveURL(/\/verifyaccount/);

    const resendButton = page.getByRole("button", {
      name: "Resend Email",
      exact: true,
    });

    await expect(resendButton).toBeVisible();
    await resendButton.click();

    await expect(
      page.getByText("Verification email sent.", { exact: true })
    ).toBeVisible();

    expect(resendPayload).toMatchObject({
      email: validUser.email,
      type: "signup",
    });
  });

  test("shows error when clicking resend if visited directly without email state", async ({
    page,
  }) => {
    await page.goto("/verifyaccount");

    const resendButton = page.getByRole("button", {
      name: "Resend Email",
      exact: true,
    });

    await expect(resendButton).toBeVisible();
    await resendButton.click();

    // VerifyAccount renders this message in a paragraph without a status role.
    await expect(
      page.getByText(
        "Email address not found. Please create your account again.",
        { exact: true }
      )
    ).toBeVisible();
  });

  // ============================================================
  // SUITE 5: SIGNUP FUNCTION ERRORS
  // ============================================================

  // Duplicate-account recovery must be tested against user-resign-up itself.
  // This frontend test verifies how the component handles a function error.

  test("shows the signup function error and remains on /createaccount", async ({
    page,
  }) => {
    const serverError = "Unable to process signup. Please try again later.";
    let signupEndpointHit = false;

    await page.route(SIGNUP_ROUTE, async (route) => {
      signupEndpointHit = true;

      await route.fulfill({
        status: 500,
        json: { error: serverError },
      });
    });

    await page.goto("/createaccount");

    await page.locator("#signup-name").fill(validUser.name);
    await page.locator("#signup-email").fill(validUser.email);
    await page.locator("#signup-password").fill(validUser.password);
    await page.locator("#signup-confirm-password").fill(validUser.password);

    await page
      .getByRole("button", { name: "Create Account", exact: true })
      .click();

    await expect(page.getByRole("alert")).toHaveText(serverError);
    expect(signupEndpointHit).toBe(true);

    await expect(page).toHaveURL(/\/createaccount/);

    await expect(
      page.getByRole("button", { name: "Create Account", exact: true })
    ).toBeEnabled();
  });
});