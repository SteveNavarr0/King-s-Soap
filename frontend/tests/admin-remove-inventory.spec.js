import { test, expect } from "@playwright/test";

// Run tests in order
test.describe.configure({ mode: "serial" });

// Manually enter the product name you want to test
const productName = "Playwright Test Soap 1793137769683";

// AB309 - Open Update Product popup
test("AB309 - Admin can open product update popup", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate the test product
  const product = page.getByText(productName, {
    exact: true
  });

  // Verify product exists
  await expect(product).toBeVisible();

  // Click product to open popup
  await product.click();

  // Verify popup displays product name
  await expect(
    page.getByRole("heading", {
      name: productName
    })
  ).toBeVisible();

  // Verify Delete Product button exists
  await expect(
    page.getByRole("button", {
      name: "Delete Product"
    })
  ).toBeVisible();

});



test("AB310 - Admin can remove product", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate test product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open Update Product popup
  await product.click();

  // Verify Delete Product button appears
  await expect(
    page.getByRole("button", {
      name: "Delete Product"
    })
  ).toBeVisible();

  // Handle confirmation dialog
  page.once("dialog", async dialog => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });

  // Wait for the Supabase archive request
const archiveResponsePromise = page.waitForResponse(
  response =>
    response.url().includes("/rest/v1/products") &&
    response.request().method() === "PATCH",
  { timeout: 15000 }
);

// Click Delete Product
await page.getByRole("button", {
  name: "Delete Product"
}).click();

// Verify Supabase accepted the archive request
const archiveResponse = await archiveResponsePromise;

expect(archiveResponse.ok()).toBeTruthy();

console.log("Archive response:", archiveResponse.status());

  // Verify product disappears from active inventory
 // Wait for the update popup to close
await expect(
  page.getByRole("button", {
    name: "Delete Product"
  })
).toHaveCount(0, { timeout: 15000 });

// Refresh inventory from Supabase
await page.reload();

// Verify product is no longer in active inventory
await expect(
  page.getByRole("button", {
    name: new RegExp(productName)
  })
).toHaveCount(0, { timeout: 15000 });

  // Refresh the page
  await page.reload();

  // Verify product remains absent after refresh
  await expect(
    page.getByText(productName, {
      exact: true
    })
  ).toHaveCount(0);

});


test("AB311 - Archived product is removed from active inventory", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Verify the inventory page loads
  await expect(
    page.getByRole("heading", {
      name: "Your Products"
    })
  ).toBeVisible();

  // Verify the archived product is not displayed
  await expect(
    page.getByRole("button", {
      name: new RegExp(productName)
    })
  ).toHaveCount(0);

});



test("AB312 - Archived product appears in Admin Archive", async ({ page }) => {

  await page.goto("http://localhost:5173/adminArchive");

  console.log("Current URL:", page.url());

  // Check whether the archive page loaded
  await expect(page.locator("body")).toBeVisible();

  // Display page headings
  console.log(
    "Page headings:",
    await page.locator("h1, h2").allTextContents()
  );

  // Display product buttons
  console.log(
    "Product buttons:",
    await page.locator("button").allTextContents()
  );

  // Verify archived product appears
  await expect(
    page.getByText(productName, { exact: true })
  ).toBeVisible({ timeout: 15000 });

});




test("AB313 - Admin can restore archived product", async ({ page }) => {

  // Navigate to Admin Archive
  await page.goto("http://localhost:5173/adminArchive");

  // Find the archived product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open Update Product popup
  await product.click();

  // Find the Re-add Product button
  const restoreButton = page.getByRole("button", {
    name: "Re-add Product",
    exact: true
  });

  // Wait for the product information to load
  await expect(restoreButton).toBeVisible({
    timeout: 15000
  });

  // Handle the confirmation dialog
  page.once("dialog", async (dialog) => {

    expect(dialog.type()).toBe("confirm");

    expect(dialog.message()).toBe(
      "Are you sure you want to re-add this product to the shop?"
    );

    await dialog.accept();

  });

  // Wait for the Supabase restore request
  const restoreResponsePromise = page.waitForResponse(
    response =>
      response.url().includes("/rest/v1/products") &&
      response.request().method() === "PATCH",
    { timeout: 15000 }
  );

  // Click Re-add Product
  await restoreButton.click();

  // Verify Supabase accepted the update
  const restoreResponse = await restoreResponsePromise;

  expect(restoreResponse.ok()).toBeTruthy();

  // Wait for the popup to close
  await expect(
    page.getByRole("button", {
      name: "Re-add Product",
      exact: true
    })
  ).toHaveCount(0, { timeout: 15000 });

  // Check for any restore error message
  await expect(
    page.getByText("Unable to re-add product.")
  ).toHaveCount(0);

  // Navigate to active inventory
  await page.goto("http://localhost:5173/AdminProducts");

  // Verify inventory page loads
  await expect(
    page.getByRole("heading", {
      name: "Your Products"
    })
  ).toBeVisible();

  // Verify the restored product appears
  await expect(
    page.getByText(productName, {
      exact: true
    })
  ).toBeVisible({ timeout: 15000 });

});




