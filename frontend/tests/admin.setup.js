import { test as setup, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const authFile = "playwright/.auth/admin.json";

setup("Authenticate as admin", async ({ page }) => {
  // Create authentication directory if needed
  mkdirSync(dirname(authFile), { recursive: true });

  // Navigate to login page
  await page.goto("http://localhost:5173/login");

  // Enter admin credentials
  await page.getByPlaceholder("Email Address").fill(
    process.env.ADMIN_EMAIL
  );

  await page.getByPlaceholder("Password").fill(
    process.env.ADMIN_PASSWORD
  );

  // Log in
  await page.getByRole("button", {
    name: "Log In"
  }).click();

  // Verify successful login
  await expect(page).toHaveURL(/\/Admin\/?$/i);

  // Save authenticated session
  await page.context().storageState({ path: authFile });
});