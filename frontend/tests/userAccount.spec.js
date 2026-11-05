import { test as base, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

// Use a dedicated regular-user test account.
// Run this file with --workers=1.
// Do not run other tests using the same account simultaneously.

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:5173";
const EMAIL = process.env.PW_USER_EMAIL;
const ORIGINAL_PASSWORD = process.env.PW_USER_PASSWORD;

const loginPath = /\/login\/?$/i;


// ============================================================
// SHARED HELPERS AND TEST SETUP
// ============================================================

// Identify the Supabase password-login response.
function isLoginResponse(response) {
  const url = new URL(response.url());

  return (
    url.pathname === "/auth/v1/token" &&
    url.searchParams.get("grant_type") === "password" &&
    response.request().method() === "POST"
  );
}

// Identify a Supabase user-update request.
function isPasswordUpdate(request) {
  return (
    new URL(request.url()).pathname === "/auth/v1/user" &&
    request.method() === "PUT"
  );
}

// Submit the actual login form.
async function submitLogin(page, password) {
  await page.goto("/login");

  await page
    .getByPlaceholder("Email Address", { exact: true })
    .fill(EMAIL);

  await page
    .getByPlaceholder("Password", { exact: true })
    .fill(password);

  const [response] = await Promise.all([
    page.waitForResponse(isLoginResponse, {
      timeout: 20_000,
    }),

    page
      .getByRole("button", {
        name: "Log In",
        exact: true,
      })
      .click(),
  ]);

  return response;
}

// Log in and verify the signed-in navigation appears.
async function login(page, password) {
  const response = await submitLogin(page, password);

  expect(
    response.ok(),
    `Login returned HTTP ${response.status()}`
  ).toBe(true);

  await expect(page).not.toHaveURL(loginPath, {
    timeout: 15_000,
  });

  await page.goto("/");

  await expect(
    page.getByRole("navigation").getByRole("button", {
      name: "Account menu",
      exact: true,
    })
  ).toBeVisible();

  const headers = await response.request().allHeaders();

  if (!headers.apikey) {
    throw new Error(
      "Supabase login request has no apikey header."
    );
  }

  return {
    tokenUrl: response.url(),
    apikey: headers.apikey,
  };
}

// Automatically log in before each test.
const test = base.extend({
  account: [
    async ({ page }, use) => {
      if (!EMAIL || !ORIGINAL_PASSWORD) {
        throw new Error(
          "Set PW_USER_EMAIL and PW_USER_PASSWORD before running account tests."
        );
      }

      const account = await login(page, ORIGINAL_PASSWORD);

      await use(account);
    },
    { auto: true },
  ],
});

test.use({
  baseURL: BASE_URL,

  viewport: {
    width: 1440,
    height: 900,
  },

  storageState: {
    cookies: [],
    origins: [],
  },
});

test.setTimeout(60_000);

// Keep tests independent while disabling parallel execution
// within this file.
test.describe.configure({
  mode: "default",
  retries: 0,
});

// Password changes must not overlap across browser projects.
test.beforeAll(async ({}, testInfo) => {
  if (testInfo.config.workers !== 1) {
    throw new Error(
      "Account tests require --workers=1 because they change a shared account password."
    );
  }
});

// Open the account dropdown.
async function openAccountMenu(page) {
  const navbar = page.getByRole("navigation");

  const accountButton = navbar.getByRole("button", {
    name: "Account menu",
    exact: true,
  });

  await expect(accountButton).toBeVisible();

  await accountButton.click();

  await expect(accountButton).toHaveAttribute(
    "aria-expanded",
    "true"
  );

  return navbar;
}

// Reach Change Password through the actual menu.
async function openPasswordPage(page) {
  await page.goto("/");

  const navbar = await openAccountMenu(page);

  await navbar
    .getByRole("link", {
      name: "Change Password",
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(
    /\/userChangePassword\/?$/i
  );

  await expect(
    page.getByRole("heading", {
      name: "Reset Your Password",
      exact: true,
    })
  ).toBeVisible();
}

// Sign out through the actual menu.
async function logout(page) {
  const navbar = await openAccountMenu(page);

  await navbar
    .getByRole("button", {
      name: "Sign Out",
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(loginPath);

  await expect(
    navbar.getByRole("link", {
      name: "Log In",
      exact: true,
    })
  ).toBeVisible();
}

// Use a fresh browser context when verifying credentials.
async function withFreshPage(browser, callback) {
  const context = await browser.newContext({
    baseURL: BASE_URL,

    viewport: {
      width: 1440,
      height: 900,
    },

    storageState: {
      cookies: [],
      origins: [],
    },
  });

  try {
    return await callback(await context.newPage());
  } finally {
    await context.close();
  }
}

// Confirm invalid input did not change the original password.
async function verifyOriginalPassword(browser) {
  await withFreshPage(browser, page =>
    login(page, ORIGINAL_PASSWORD)
  );
}

// Restore the original password after a password-change test.
async function restorePassword(
  request,
  account,
  temporaryPassword
) {
  const headers = {
    apikey: account.apikey,
  };

  const temporaryLogin = await request.post(
    account.tokenUrl,
    {
      headers,

      data: {
        email: EMAIL,
        password: temporaryPassword,
      },

      timeout: 15_000,
    }
  );

  // If the change never happened, confirm the original still works.
  if (!temporaryLogin.ok()) {
    const originalLogin = await request.post(
      account.tokenUrl,
      {
        headers,

        data: {
          email: EMAIL,
          password: ORIGINAL_PASSWORD,
        },

        timeout: 15_000,
      }
    );

    if (!originalLogin.ok()) {
      throw new Error(
        "PASSWORD CLEANUP FAILED: neither password could authenticate. Reset the test account before rerunning."
      );
    }

    return;
  }

  const {
    access_token: accessToken,
  } = await temporaryLogin.json();

  const updateUrl = new URL(
    "/auth/v1/user",
    account.tokenUrl
  ).href;

  const restored = await request.put(updateUrl, {
    headers: {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    },

    data: {
      password: ORIGINAL_PASSWORD,
    },

    timeout: 15_000,
  });

  if (!restored.ok()) {
    throw new Error(
      `PASSWORD CLEANUP FAILED (HTTP ${restored.status()}): reset the test account to PW_USER_PASSWORD before rerunning.`
    );
  }

  const confirmation = await request.post(
    account.tokenUrl,
    {
      headers,

      data: {
        email: EMAIL,
        password: ORIGINAL_PASSWORD,
      },

      timeout: 15_000,
    }
  );

  expect(
    confirmation.ok(),
    "Original password must work after cleanup"
  ).toBe(true);
}


// ============================================================
// SUBTASK 1: CHANGE PASSWORD
// ============================================================

test.describe("King's Soap - Change Password", () => {

  // ACC-PW-001: Valid Password Change, Confirmation, and Login Verification
  test(
    "ACC-PW-001: A valid change is saved, confirmed, and replaces the old password",
    async ({ page, browser, request, account }) => {
      test.setTimeout(150_000);

      const temporaryPassword = `Account!9a${randomUUID()}`;

      await openPasswordPage(page);

      await page
        .getByLabel("New Password", { exact: true })
        .fill(temporaryPassword);

      await page
        .getByLabel("Retype New Password", { exact: true })
        .fill(temporaryPassword);

      try {
        // Submit the password change and capture its response.
        const [response] = await Promise.all([
          page.waitForResponse(
            response => isPasswordUpdate(response.request()),
            { timeout: 20_000 }
          ),

          page
            .getByRole("button", {
              name: "Change Password",
              exact: true,
            })
            .click(),
        ]);

        await expect(
          response.ok(),
          `Password update returned HTTP ${response.status()}`
        ).toBe(true);

        // Verify the success confirmation.
        await expect(
          page.getByText(
            "Password changed successfully. You will be redirected to the login page.",
            { exact: true }
          )
        ).toBeVisible();

        await expect(page).toHaveURL(loginPath, {
          timeout: 10_000,
        });

        // Redirecting to Login alone does not end the session.
        await logout(page);

        // Verify the previous password no longer works.
        await withFreshPage(browser, async freshPage => {
          const rejection = await submitLogin(
            freshPage,
            ORIGINAL_PASSWORD
          );

          expect(
            rejection.status(),
            "Old password must be rejected as invalid credentials"
          ).toBe(400);

          const body = await rejection.json();

          const reason =
            body.error_code ||
            body.code ||
            body.error_description ||
            body.msg ||
            body.message;

          expect(reason).toMatch(
            /invalid_credentials|invalid login credentials/i
          );

          await expect(freshPage).toHaveURL(loginPath);

          const navbar = freshPage.getByRole("navigation");

          await expect(
            navbar.getByRole("link", {
              name: "Log In",
              exact: true,
            })
          ).toBeVisible();

          await expect(
            navbar.getByRole("button", {
              name: "Account menu",
              exact: true,
            })
          ).toHaveCount(0);
        });

        // Verify the updated password works in a fresh session.
        await withFreshPage(browser, freshPage =>
          login(freshPage, temporaryPassword)
        );
      } finally {
        // Attempt restoration even if an assertion fails.
        await restorePassword(
          request,
          account,
          temporaryPassword
        );
      }
    }
  );


  const invalidCases = [

    // ACC-PW-002: Reject Both Password Fields Empty
    {
      id: "002",
      name: "both fields empty",
      password: "",
      confirmation: "",
      field: "New Password",
      validity: "valueMissing",
    },

    // ACC-PW-003: Reject an Empty New Password
    {
      id: "003",
      name: "new password empty",
      password: "",
      confirmation: "ValidExample!92",
      field: "New Password",
      validity: "valueMissing",
    },

    // ACC-PW-004: Reject an Empty Confirmation Password
    {
      id: "004",
      name: "confirmation empty",
      password: "ValidExample!92",
      confirmation: "",
      field: "Retype New Password",
      validity: "valueMissing",
    },

    // ACC-PW-005: Reject a Password Shorter Than Six Characters
    {
      id: "005",
      name: "password shorter than six characters",
      password: "Ab!12",
      confirmation: "Ab!12",
      field: "New Password",
      validity: "tooShort",
    },
  ];


  // ACC-PW-002 through ACC-PW-005: Generate One Test for Each Invalid Case
  for (const example of invalidCases) {
    test(
      `ACC-PW-${example.id}: Reject ${example.name} without changing the password`,
      async ({ page, browser, request, account }) => {
        await openPasswordPage(page);

        const updates = [];

        page.on("request", request => {
          if (isPasswordUpdate(request)) {
            updates.push(request);
          }
        });

        try {
          await page
            .getByLabel("New Password", { exact: true })
            .fill(example.password);

          await page
            .getByLabel("Retype New Password", { exact: true })
            .fill(example.confirmation);

          await page
            .getByRole("button", {
              name: "Change Password",
              exact: true,
            })
            .click();

          const input = page.getByLabel(example.field, {
            exact: true,
          });

          // Verify the browser rejects the invalid input.
          expect(
            await input.evaluate(
              (element, key) => element.validity[key],
              example.validity
            )
          ).toBe(true);

          // Native error wording varies by browser.
          expect(
            await input.evaluate(
              element => element.validationMessage
            )
          ).not.toBe("");

          await expect(input).toBeFocused();

          await expect(page).toHaveURL(
            /\/userChangePassword\/?$/i
          );

          // Invalid input should never submit an update.
          expect(
            updates,
            "Invalid input must not submit a password update"
          ).toHaveLength(0);

          await verifyOriginalPassword(browser);
        } finally {
          // Recover if invalid input unexpectedly reaches the server.
          if (updates.length) {
            await restorePassword(
              request,
              account,
              example.password
            );
          }
        }
      }
    );
  }


  // ACC-PW-006: Reject Mismatched Passwords Without Changing the Password
  test(
    "ACC-PW-006: Mismatched passwords show an error and leave the password unchanged",
    async ({ page, browser, request, account }) => {
      await openPasswordPage(page);

      const updates = [];

      page.on("request", request => {
        if (isPasswordUpdate(request)) {
          updates.push(request);
        }
      });

      try {
        await page
          .getByLabel("New Password", { exact: true })
          .fill("ExamplePassword!92");

        await page
          .getByLabel("Retype New Password", { exact: true })
          .fill("DifferentPassword!92");

        await page
          .getByRole("button", {
            name: "Change Password",
            exact: true,
          })
          .click();

        await expect(
          page.getByText("Passwords do not match.", {
            exact: true,
          })
        ).toBeVisible();

        expect(
          updates,
          "Mismatched passwords must not reach Supabase"
        ).toHaveLength(0);

        await verifyOriginalPassword(browser);
      } finally {
        if (updates.length) {
          await restorePassword(
            request,
            account,
            "ExamplePassword!92"
          );
        }
      }
    }
  );

});


// ============================================================
// SUBTASK 2: LOGOUT AND ACCOUNT ACCESS
// ============================================================

test.describe("King's Soap - Account Logout", () => {

  // ACC-OUT-001: Sign Out Redirects to Login and Updates the Navigation
  test(
    "ACC-OUT-001: Menu Sign Out returns to Login and updates the navigation",
    async ({ page }) => {
      await logout(page);

      const navbar = page.getByRole("navigation");

      await expect(
        navbar.getByRole("link", {
          name: "Orders",
          exact: true,
        })
      ).toHaveCount(0);

      await expect(
        navbar.getByRole("button", {
          name: "Account menu",
          exact: true,
        })
      ).toHaveCount(0);
    }
  );


  // ACC-OUT-002: Refresh Keeps the User Signed Out
  test(
    "ACC-OUT-002: Refresh does not restore the signed-in session",
    async ({ page }) => {
      await logout(page);

      await page.reload();

      const navbar = page.getByRole("navigation");

      await expect(
        navbar.getByRole("link", {
          name: "Log In",
          exact: true,
        })
      ).toBeVisible();

      await expect(
        navbar.getByRole("button", {
          name: "Account menu",
          exact: true,
        })
      ).toHaveCount(0);
    }
  );


  // ACC-OUT-003: Direct Password-Page Access Requires Login After Sign Out
  // This may fail because the supplied route lacks protection.
  test(
    "ACC-OUT-003: Direct access to Change Password requires login after logout",
    async ({ page }) => {
      await logout(page);

      await page.goto("/userChangePassword");

      await expect(
        page,
        "The password form must require an authenticated or valid recovery session"
      ).toHaveURL(loginPath);

      await expect(
        page.getByPlaceholder("Email Address", {
          exact: true,
        })
      ).toBeVisible();
    }
  );


  // ACC-OUT-004: Browser Back Cannot Restore Password-Page Access After Sign Out
  test(
    "ACC-OUT-004: Back cannot restore access to Change Password after logout",
    async ({ page }) => {
      await openPasswordPage(page);

      await logout(page);

      await page.goBack();

      await expect(page).toHaveURL(loginPath);

      await expect(
        page.getByRole("heading", {
          name: "Reset Your Password",
          exact: true,
        })
      ).toHaveCount(0);
    }
  );


  // ACC-OUT-005: The User Can Log In Again After Sign Out
  test(
    "ACC-OUT-005: The user can log in again after logout",
    async ({ page }) => {
      await logout(page);

      await login(page, ORIGINAL_PASSWORD);

      const navbar = await openAccountMenu(page);

      await expect(
        navbar.getByRole("button", {
          name: "Sign Out",
          exact: true,
        })
      ).toBeVisible();

      await expect(
        navbar.getByRole("link", {
          name: "Change Password",
          exact: true,
        })
      ).toBeVisible();
    }
  );

});