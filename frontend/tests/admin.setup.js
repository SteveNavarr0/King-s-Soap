import { test as setup, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import dotenv from "dotenv";

// Load environment variables from .env.test
dotenv.config({ path: ".env.test" });

const authFile = "playwright/.auth/admin.json";

setup("Authenticate as admin", async ({ page }) => {
  // Create authentication directory if needed
  mkdirSync(dirname(authFile), { recursive: true });

  // Get admin credentials
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Verify credentials exist
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.test"
    );
  }

  // Navigate to login page
  await page.goto("http://localhost:5173/login");

  // Enter admin credentials
  await page.getByPlaceholder("Email Address").fill(adminEmail);

  await page.getByPlaceholder("Password").fill(adminPassword);

  // Log in
  await page.getByRole("button", {
    name: "Log In"
  }).click();

  // Verify successful login
  await expect(page).toHaveURL(/\/Admin\/?$/i);

  // Save authenticated session
  await page.context().storageState({ path: authFile });
});