
import { test, expect } from "@playwright/test";

// Run tests in order
test.describe.configure({ mode: "serial" });

test("AB302 - Admin can open Add Product popup", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Click Add Product button
  await page.getByRole("button", {
    name: /Add a Product/i
  }).click();

  // Verify popup heading appears
  await expect(
    page.getByRole("heading", {
      name: "Add a New Product"
    })
  ).toBeVisible();

  // Verify Add Item button is visible
  await expect(
    page.getByRole("button", {
      name: "Add Item"
    })
  ).toBeVisible();

});


test("AB303 - Product name is required", async ({ page }) => {
  await page.goto("http://localhost:5173/AdminProducts");

  await page.getByRole("button", {
    name: /Add a Product/i
  }).click();

  await page.getByRole("button", {
    name: "Add Item"
  }).click();

  await expect(
    page.getByText("Product name is required")
  ).toBeVisible();
});

test("AB304 - Invalid price is rejected", async ({ page }) => {
  await page.goto("http://localhost:5173/AdminProducts");

  await page.getByRole("button", {
    name: /Add a Product/i
  }).click();

  await page.getByPlaceholder("Value").nth(0).fill("Test Soap");
  await page.getByPlaceholder("Value").nth(1).fill("abc");

  await page.getByRole("button", {
    name: "Add Item"
  }).click();

  await expect(
    page.getByText("Please enter a valid decimal for price")
  ).toBeVisible();
});

test("AB305 - Invalid inventory is rejected", async ({ page }) => {
  await page.goto("http://localhost:5173/AdminProducts");

  await page.getByRole("button", {
    name: /Add a Product/i
  }).click();

  await page.getByPlaceholder("Value").nth(0).fill("Test Soap");
  await page.getByPlaceholder("Value").nth(1).fill("9.99");
  await page.getByPlaceholder("Value").nth(3).fill("abc");

  await page.getByRole("button", {
    name: "Add Item"
  }).click();

  await expect(
    page.getByText("Please enter a valid number for inventory")
  ).toBeVisible();
});

test("AB306 - Product image is required", async ({ page }) => {
  await page.goto("http://localhost:5173/AdminProducts");

  await page.getByRole("button", {
    name: /Add a Product/i
  }).click();

  await page.getByPlaceholder("Value").nth(0).fill("Test Soap");
  await page.getByPlaceholder("Value").nth(1).fill("9.99");
  await page.getByPlaceholder("Value").nth(3).fill("10");
  await page.getByPlaceholder("Value").nth(4).fill("4");

  await page.getByRole("button", {
    name: "Add Item"
  }).click();

  await expect(
    page.getByText("Please upload at least one image for the product")
  ).toBeVisible();
});



test("AB307 - Admin can create a product", async ({ page }) => {

  // Unique product name to avoid duplicates
  const productName = `Playwright Test Soap ${Date.now()}`;

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Open Add Product popup
  await page.getByRole("button", {
    name: /Add a Product/i
  }).click();

  // Fill product information
  await page.getByPlaceholder("Value").nth(0).fill(productName);
  await page.getByPlaceholder("Value").nth(1).fill("9.99");
  await page.getByPlaceholder("Value").nth(2).fill(
    "Automated Playwright test product"
  );
  await page.getByPlaceholder("Value").nth(3).fill("10");
  await page.getByPlaceholder("Value").nth(4).fill("4");

  // Select category
  await page.locator("summary").filter({
    hasText: "Select"
  }).click();

  await page.getByText("All Natural", {
    exact: true
  }).click();

  // Upload test image
  await page.locator('input[type="file"]').setInputFiles({
    name: "test-soap.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=",
      "base64"
    ),
  });

  // Verify image was selected
  await expect(
    page.getByText("1 new image selected")
  ).toBeVisible();

  // Prepare to capture backend response
  const responsePromise = page.waitForResponse(
    response =>
      response.url().includes("/api/products") &&
      response.request().method() === "POST"
  );

  // Submit product
  await page.getByRole("button", {
    name: "Add Item"
  }).click();

  // Wait for backend response
  const response = await responsePromise;

  // Verify backend successfully created the product
  expect(response.ok()).toBeTruthy();

  // Print results
  console.log("Product created successfully!");
  console.log("Product name:", productName);
  console.log("Backend status:", response.status());

});





test("AB308 - Created product appears in inventory", async ({ page }) => {

  const productName = `Playwright AB308 Test Soap ${Date.now()}`;

  await page.goto("http://localhost:5173/AdminProducts");

  // Open Add Product popup
  await page.getByRole("button", {
    name: /Add a Product/i
  }).click();

  // Fill product information
  await page.getByPlaceholder("Value").nth(0).fill(productName);
  await page.getByPlaceholder("Value").nth(1).fill("9.99");
  await page.getByPlaceholder("Value").nth(2).fill(
    "Automated Playwright test product"
  );
  await page.getByPlaceholder("Value").nth(3).fill("10");
  await page.getByPlaceholder("Value").nth(4).fill("4");

  // Select category
  await page.locator("summary").filter({
    hasText: "Select"
  }).click();

  await page.getByText("All Natural", {
    exact: true
  }).click();

  // Upload test image
  await page.locator('input[type="file"]').setInputFiles({
    name: "test-soap.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=",
      "base64"
    ),
  });

  // Submit product
  const responsePromise = page.waitForResponse(
    response =>
      response.url().includes("/api/products") &&
      response.request().method() === "POST"
  );

  await page.getByRole("button", {
    name: "Add Item"
  }).click();

  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();

  // Verify product appears in inventory
  await page.goto("http://localhost:5173/AdminProducts");

  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Refresh and verify persistence
  await page.reload();

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open product to archive it
  await product.click();

  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Accept archive confirmation
  page.once("dialog", async dialog => {
    await dialog.accept();
  });

  await page.getByRole("button", {
    name: "Delete Product"
  }).click();

  // Verify popup closes
  await expect(
    page.getByRole("button", {
      name: "Delete Product"
    })
  ).toHaveCount(0, { timeout: 15000 });

  // Verify archived product disappears from active inventory
  await page.reload();

  await expect(
    page.getByText(productName, { exact: true })
  ).toHaveCount(0, { timeout: 15000 });

});





