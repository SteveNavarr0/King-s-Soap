/*
*   Test creating a product as an admin user.
*   This test assumes that you have already logged in as an admin user and saved the storage state to playwright/.auth/admin.json.
*   You can do this by running:
*   npx playwright test frontend/tests/admin-login.spec.ts --headed
* 
*   Then run this test with:
*   npx playwright test frontend/tests/admin-create-product.spec.ts --headed
* 
*/

import { test, expect } from "@playwright/test";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
test.use({
  // Change this if your frontend uses a different port.
  baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",

  // Repository root/playwright/.auth/admin.json
  storageState: path.resolve(
    __dirname,
    "../../playwright/.auth/admin.json"
  ),
});

test("admin can create a product with an image", async ({ page }) => {
  const productName = `E2E Test Add Product`;

  // frontend/tests/fixtures/product.png
  const imagePath = path.resolve(__dirname, "fixtures/product.png");

  await page.goto("/adminProducts");

  // Adjust this locator if your popup-opening button has another name.
  await page.getByRole("button", {
    name: /add.*product/i,
  }).click();

  const heading = page.getByRole("heading", {
    name: "Add a New Product",
    exact: true,
  });

  await expect(heading).toBeVisible();

  const popup = heading.locator("..");

  // Finds each input through its label's parent container.
  const field = (label: string) =>
    popup
      .getByText(label, { exact: true })
      .locator("..")
      .getByRole("textbox");

  await field("Product Name").fill(productName);
  await field("Price").fill("12.99");
  await field("Description").fill("Created by a Playwright E2E test.");
  await field("Inventory").fill("25");
  await field("Weight").fill("0.5");

  const categoryMenu = popup.locator("details");

  await categoryMenu.locator("summary").click();

  await categoryMenu.getByRole("checkbox", {
    name: "Coconut Oil",
    exact: true,
  }).check();

  await categoryMenu.getByRole("checkbox", {
    name: "Organic",
    exact: true,
  }).check();

  await categoryMenu.locator("summary").click();

  await popup.locator('input[type="file"]').setInputFiles(imagePath);

  await expect(
    popup.getByText("1 new image selected", { exact: true })
  ).toBeVisible();

  await expect(
    popup.getByAltText("New product preview 1", { exact: true })
  ).toBeVisible();

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === "http://localhost:3000/api/products" &&
      response.request().method() === "POST"
  );

  await popup.getByRole("button", {
    name: "Add Item",
    exact: true,
  }).click();

  const response = await responsePromise;

  expect(
    response.ok(),
    `Creation failed: ${response.status()} ${await response.text()}`
  ).toBeTruthy();

  await expect(
    popup.getByText("Product added successfully!", { exact: true })
  ).toBeVisible();

  // Verify that the product remains in the list after reloading.
  await page.reload();

  await expect(
    page.getByText(productName, { exact: true }).first()
  ).toBeVisible();
});