
import { test, expect } from "@playwright/test";

const productName = "Playwright Updated Test Soap";

// Run tests in order
test.describe.configure({ mode: "serial" });

// AB314 - Open Product Editing Form
test("AB314 - Admin can open product editing form", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate the existing test product
  const product = page.getByText(productName, {
    exact: true
  });

  // Verify product is displayed
  await expect(product).toBeVisible({
    timeout: 15000
  });

  // Open the editing popup
  await product.click();

  // Verify popup displays the correct product name
  await expect(
    page.getByRole("heading", {
      name: productName
    })
  ).toBeVisible();

  // Verify editing fields are displayed
  await expect(page.getByText("Product Name", {
    exact: true
  })).toBeVisible();

  await expect(page.getByText("Price", {
    exact: true
  })).toBeVisible();

  await expect(page.getByText("Description", {
    exact: true
  })).toBeVisible();

  await expect(page.getByText("Inventory", {
    exact: true
  })).toBeVisible();

  await expect(page.getByText("Weight", {
    exact: true
  })).toBeVisible();

  // Verify Save Changes button exists
  await expect(
    page.getByRole("button", {
      name: "Save Changes"
    })
  ).toBeVisible();

  // Verify product name is loaded into the form
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName);

});


test("AB315 - Admin can update product name", async ({ page }) => {

  const updatedName = "Playwright Updated Test Soap";

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate the test product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open the editing popup
  await product.click();

  // Verify original product name loaded
  const nameField = page.getByPlaceholder("Value").nth(0);

  await expect(nameField).toHaveValue(productName);

  // Click the pencil icon to enable editing
  await page.getByRole("button", {
    name: "edit product name"
  }).click();

  // Update the product name
  await nameField.fill(updatedName);

  // Save and wait for the Supabase update
  const updateResponsePromise = page.waitForResponse(
    response =>
      response.url().includes("/rest/v1/products") &&
      response.request().method() === "PATCH",
    { timeout: 15000 }
  );

  await page.getByRole("button", {
    name: "Save Changes"
  }).click();

  const updateResponse = await updateResponsePromise;

  expect(updateResponse.ok()).toBeTruthy();

  // Verify success message
  await expect(
    page.getByText("Product updated successfully.")
  ).toBeVisible({ timeout: 15000 });

  // Refresh to verify the change persisted
  await page.reload();

  // Verify updated product appears in inventory
  await expect(
    page.getByText(updatedName, {
      exact: true
    })
  ).toBeVisible({ timeout: 15000 });

});




test("AB316 - Admin can update product price", async ({ page }) => {

  const updatedPrice = "12.99";

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate the test product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open the editing popup
  await product.click();

  // Locate form fields
  const nameField = page.getByPlaceholder("Value").nth(0);
  const priceField = page.getByPlaceholder("Value").nth(1);
  const stockField = page.getByPlaceholder("Value").nth(3);
  const weightField = page.getByPlaceholder("Value").nth(4);

  // IMPORTANT: Wait for Supabase product data to load
  await expect(nameField).toHaveValue(productName, {
    timeout: 15000
  });

  await expect(priceField).not.toHaveValue("", {
    timeout: 15000
  });

  await expect(stockField).not.toHaveValue("", {
    timeout: 15000
  });

  await expect(weightField).not.toHaveValue("", {
    timeout: 15000
  });

  // Enable editing for the price
  await page.getByRole("button", {
    name: "edit price"
  }).click();

  // Enter the updated price
  await priceField.fill(updatedPrice);

  // Verify new price was entered
  await expect(priceField).toHaveValue(updatedPrice);

  // Verify product name is still correct before saving
  await expect(nameField).toHaveValue(productName);

  // Save changes
  await page.getByRole("button", {
    name: "Save Changes"
  }).click();

  // Verify successful update
  await expect(
    page.getByText("Product updated successfully.")
  ).toBeVisible({ timeout: 15000 });

  // Refresh page to verify saved data
  await page.reload();

  // Locate product again
  const updatedProduct = page.getByText(productName, {
    exact: true
  });

  await expect(updatedProduct).toBeVisible({
    timeout: 15000
  });

  // Reopen editing popup
  await updatedProduct.click();

  // Verify product name persisted
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify updated price persisted
  await expect(
    page.getByPlaceholder("Value").nth(1)
  ).toHaveValue(updatedPrice, { timeout: 15000 });

});


test("AB317 - Admin can update inventory quantity", async ({ page }) => {

  const updatedStock = "25";

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate the test product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open editing popup
  await product.click();

  // Locate form fields
  const nameField = page.getByPlaceholder("Value").nth(0);
  const priceField = page.getByPlaceholder("Value").nth(1);
  const stockField = page.getByPlaceholder("Value").nth(3);
  const weightField = page.getByPlaceholder("Value").nth(4);

  // Wait for existing product information to load
  await expect(nameField).toHaveValue(productName, {
    timeout: 15000
  });

  await expect(priceField).not.toHaveValue("");
  await expect(stockField).not.toHaveValue("");
  await expect(weightField).not.toHaveValue("");

  // Click pencil icon to enable inventory editing
  await page.getByRole("button", {
    name: "edit stock"
  }).click();

  // Enter updated inventory quantity
  await stockField.fill(updatedStock);

  // Verify new quantity was entered
  await expect(stockField).toHaveValue(updatedStock);

  // Save changes
  await page.getByRole("button", {
    name: "Save Changes"
  }).click();

  // Verify successful update
  await expect(
    page.getByText("Product updated successfully.")
  ).toBeVisible({ timeout: 15000 });

  // Refresh to retrieve saved product data
  await page.reload();

  // Find product again
  const updatedProduct = page.getByText(productName, {
    exact: true
  });

  await expect(updatedProduct).toBeVisible({
    timeout: 15000
  });

  // Reopen editing popup
  await updatedProduct.click();

  // Wait for product data to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify inventory quantity persisted
  await expect(
    page.getByPlaceholder("Value").nth(3)
  ).toHaveValue(updatedStock, { timeout: 15000 });

});


test("AB318 - Admin can update product description", async ({ page }) => {

  const updatedDescription =
    "Updated Playwright test description for King's Soap.";

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate the test product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open editing popup
  await product.click();

  // Locate form fields
  const nameField = page.getByPlaceholder("Value").nth(0);
  const priceField = page.getByPlaceholder("Value").nth(1);
  const descriptionField = page.getByPlaceholder("Value").nth(2);
  const stockField = page.getByPlaceholder("Value").nth(3);
  const weightField = page.getByPlaceholder("Value").nth(4);

  // Wait for existing product information to load
  await expect(nameField).toHaveValue(productName, {
    timeout: 15000
  });

  await expect(priceField).not.toHaveValue("");
  await expect(stockField).not.toHaveValue("");
  await expect(weightField).not.toHaveValue("");

  // Enable description editing
  await page.getByRole("button", {
    name: "edit description"
  }).click();

  // Enter updated description
  await descriptionField.fill(updatedDescription);

  // Verify description was entered
  await expect(descriptionField).toHaveValue(updatedDescription);

  // Confirm product name remains unchanged
  await expect(nameField).toHaveValue(productName);

  // Save changes
  await page.getByRole("button", {
    name: "Save Changes"
  }).click();

  // Verify successful update
  await expect(
    page.getByText("Product updated successfully.")
  ).toBeVisible({ timeout: 15000 });

  // Refresh to retrieve saved product data
  await page.reload();

  // Find the product again
  const updatedProduct = page.getByText(productName, {
    exact: true
  });

  await expect(updatedProduct).toBeVisible({
    timeout: 15000
  });

  // Reopen editing popup
  await updatedProduct.click();

  // Wait for product data to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify updated description persisted
  await expect(
    page.getByPlaceholder("Value").nth(2)
  ).toHaveValue(updatedDescription, { timeout: 15000 });

});


test("AB319 - Updated product information persists", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Find the updated product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });

  // Open the editing popup
  await product.click();

  // Locate form fields
  const nameField = page.getByPlaceholder("Value").nth(0);
  const priceField = page.getByPlaceholder("Value").nth(1);
  const descriptionField = page.getByPlaceholder("Value").nth(2);
  const stockField = page.getByPlaceholder("Value").nth(3);

  // Verify saved product information
  await expect(nameField).toHaveValue(
    "Playwright Updated Test Soap",
    { timeout: 15000 }
  );

  await expect(priceField).toHaveValue("12.99");

  await expect(descriptionField).toHaveValue(
    "Updated Playwright test description for King's Soap."
  );

  await expect(stockField).toHaveValue("25");

  // Refresh the page
  await page.reload();

  // Reopen the product
  await expect(
    page.getByText(productName, { exact: true })
  ).toBeVisible({ timeout: 15000 });

  await page.getByText(productName, {
    exact: true
  }).click();

  // Verify values still persist
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue("Playwright Updated Test Soap", {
    timeout: 15000
  });

  await expect(
    page.getByPlaceholder("Value").nth(1)
  ).toHaveValue("12.99");

  await expect(
    page.getByPlaceholder("Value").nth(2)
  ).toHaveValue(
    "Updated Playwright test description for King's Soap."
  );

  await expect(
    page.getByPlaceholder("Value").nth(3)
  ).toHaveValue("25");

});
