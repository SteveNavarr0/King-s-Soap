
import { test, expect } from "@playwright/test";

test("AB300 - Admin can log in", async ({ page }) => {

  // Navigate to login page
  await page.goto("http://localhost:5173/login");

  // Enter admin credentials
  await page.getByPlaceholder("Email Address").fill(
    process.env.ADMIN_EMAIL
  );

  await page.getByPlaceholder("Password").fill(
    process.env.ADMIN_PASSWORD
  );

  // Click Log In
  await page.getByRole("button", {
    name: "Log In"
  }).click();

  // Verify successful navigation
  await expect(page).toHaveURL(/\/Admin\/?$/i);

});
