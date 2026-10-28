
import { test, expect } from "@playwright/test";

test("AB301 - Admin session is restored", async ({ page }) => {

  // Navigate directly to the Admin dashboard
  await page.goto("http://localhost:5173/Admin");

  // Verify the Admin dashboard loads
  await expect(page.getByRole("heading", {
    name: /^Welcome/
  })).toBeVisible();

  // Verify the dashboard description
  await expect(
    page.getByText("Here's your shop at a glance")
  ).toBeVisible();

  // Verify the Top Sellers section
  await expect(page.getByRole("heading", {
    name: "Top Sellers"
  })).toBeVisible();

  // Verify the View All link
  await expect(page.getByRole("link", {
    name: /View All/
  })).toBeVisible();

  // Verify we remain on the Admin page
  await expect(page).toHaveURL(/\/Admin\/?$/i);

});
