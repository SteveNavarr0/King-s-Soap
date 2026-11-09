import { test as base, expect, Page } from "@playwright/test";

// ============================================================
// CONFIGURATION & CREDENTIALS
// ============================================================

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:5173";

const USER_EMAIL = process.env.PW_USER_EMAIL;
const USER_PASSWORD = process.env.PW_USER_PASSWORD;

const ADMIN_EMAIL = process.env.PW_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PW_ADMIN_PASSWORD;

const loginPath = /\/login\/?$/i;
const homePath = new RegExp(`^${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/?$`, "i");

// User routes guarded by <ProtectedRoute>
const USER_PROTECTED_ROUTES = [
  "/orderHistory",
  "/userChangePassword",
];

// Admin routes guarded by <CheckAdminPerm>
const ADMIN_ROUTES = [
  "/admin",
  "/adminInbox",
  "/adminProducts",
  "/adminDiscounts",
  "/adminOrders",
  "/adminArchivedOrders",
  "/adminArchive",
  "/adminShipping",
  "/admin/shipping",
  "/adminPostage",
  "/adminOrders/sample-order-id",
];

// ============================================================
// AUTHENTICATION HELPER
// ============================================================

function isLoginResponse(response) {
  const url = new URL(response.url());
  return (
    url.pathname === "/auth/v1/token" &&
    url.searchParams.get("grant_type") === "password" &&
    response.request().method() === "POST"
  );
}

async function loginAs(page: Page, email: string, pass: string) {
  await page.goto("/login");

  await page.getByPlaceholder("Email Address", { exact: true }).fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(pass);

  const [response] = await Promise.all([
    page.waitForResponse(isLoginResponse, { timeout: 20_000 }),
    page.getByRole("button", { name: "Log In", exact: true }).click(),
  ]);

  expect(response.ok(), `Login failed for ${email} with HTTP ${response.status()}`).toBe(true);
  await expect(page).not.toHaveURL(loginPath, { timeout: 15_000 });
}

// ============================================================
// TEST FIXTURES
// ============================================================

const test = base.extend<{
  userPage: Page;
  adminPage: Page;
}>({
  userPage: async ({ browser }, use) => {
    if (!USER_EMAIL || !USER_PASSWORD) {
      throw new Error("Set PW_USER_EMAIL and PW_USER_PASSWORD before running RBAC tests.");
    }
    const context = await browser.newContext({
      baseURL: BASE_URL,
      viewport: { width: 1440, height: 900 },
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Set PW_ADMIN_EMAIL and PW_ADMIN_PASSWORD before running RBAC tests.");
    }
    const context = await browser.newContext({
      baseURL: BASE_URL,
      viewport: { width: 1440, height: 900 },
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await use(page);
    await context.close();
  },
});

test.use({
  baseURL: BASE_URL,
  viewport: { width: 1440, height: 900 },
  storageState: { cookies: [], origins: [] },
});

test.setTimeout(60_000);

// ============================================================
// SUITE 1: UNAUTHENTICATED GUEST ACCESS
// ============================================================

test.describe("RBAC - Unauthenticated Guest", () => {
  for (const route of USER_PROTECTED_ROUTES) {
    test(`redirects guest from protected user route ${route} to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(loginPath);
      await expect(page.getByPlaceholder("Email Address", { exact: true })).toBeVisible();
    });
  }

  for (const route of ADMIN_ROUTES) {
    test(`redirects guest from admin route ${route} to /login`, async ({ page }) => {
      await page.goto(route);
      // CheckAdminPerm sets status "signed-out" and renders <Navigate to="/login" replace />
      await expect(page).toHaveURL(loginPath);
      await expect(page.getByPlaceholder("Email Address", { exact: true })).toBeVisible();
    });
  }
});

// ============================================================
// SUITE 2: STANDARD LOGGED-IN USER ACCESS
// ============================================================

test.describe("RBAC - Standard User", () => {
    for (const route of USER_PROTECTED_ROUTES) {
      test(`grants standard user access to ${route}`, async ({ userPage }) => {
        await userPage.goto(route);
  
        await expect(userPage).not.toHaveURL(loginPath);
        await expect(userPage).toHaveURL(new RegExp(`${route}/?$`, "i"), { timeout: 10_000 });
        await expect(userPage.getByRole("navigation")).toBeVisible({ timeout: 10_000 });
      });
    }
  
    for (const route of ADMIN_ROUTES) {
      test(`blocks standard user from admin route ${route} and redirects to home`, async ({ userPage }) => {
        await userPage.goto(route);
  
        // 1. Wait for CheckAdminPerm's async getUser() call to finish resolving
        await expect(userPage.getByText("Checking access...")).not.toBeVisible({ timeout: 10_000 });
  
        // 2. Wait for redirect to home ("/")
        await expect(userPage).toHaveURL(homePath, { timeout: 10_000 });
        await expect(userPage).not.toHaveURL(new RegExp(route, "i"));
  
        // 3. Confirm navbar is rendered on home page
        await expect(userPage.getByRole("navigation")).toBeVisible({ timeout: 10_000 });
      });
    }
  });

// ============================================================
// SUITE 3: ADMIN USER ACCESS
// ============================================================

test.describe("RBAC - Admin User", () => {
  for (const route of ADMIN_ROUTES) {
    test(`grants admin access to ${route} and suppresses regular navbar/footer`, async ({ adminPage }) => {
      await adminPage.goto(route);

      // Confirm admin remains on the requested path
      await expect(adminPage).not.toHaveURL(loginPath);
      await expect(adminPage).not.toHaveURL(homePath);
      await expect(adminPage).toHaveURL(new RegExp(`${route}/?$`, "i"));

      // AppContent suppresses <Navbar /> and <Footer /> for any route starting with /admin
      if (route.toLowerCase().startsWith("/admin")) {
        await expect(adminPage.getByRole("navigation")).toHaveCount(0);
        await expect(adminPage.locator("footer")).toHaveCount(0);
      }
    });
  }
});