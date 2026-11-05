import { test, expect } from "@playwright/test";

const productName = "Playwright Updated Test Soap";

// Run tests in order
test.describe.configure({ mode: "serial" });

// AB320 - Open Product Image Manager
test("AB320 - Admin can open product image manager", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Locate the test product
  const product = page.getByText(productName, {
    exact: true
  });

  // Verify product appears
  await expect(product).toBeVisible({
    timeout: 15000
  });

  // Open Update Product popup
  await product.click();

  // Wait for product data to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify Images section appears
  await expect(
    page.getByText("Images", {
      exact: true
    })
  ).toBeVisible();

  // Verify image upload input exists
  await expect(
    page.locator('input[type="file"]')
  ).toHaveCount(1);

  // Verify Save Changes button exists
  await expect(
    page.getByRole("button", {
      name: "Save Changes"
    })
  ).toBeVisible();

});


test("AB321 - Admin can upload a new product image", async ({ page }) => {

  await page.goto("http://localhost:5173/AdminProducts");

  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });
  await product.click();

  // Wait for product information to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Create a small PNG image for testing
  const testImage = {
    name: "playwright-test-image.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==",
      "base64"
    )
  };

  // Upload image through the file input
  await page.locator('input[type="file"]').setInputFiles(testImage);

  // Verify the image was selected
  await expect(
    page.getByText("1 new image selected")
  ).toBeVisible();

  // Verify the new image preview appears
  await expect(
    page.getByAltText("New product preview 1")
  ).toBeVisible();

  // Save the product
  await page.getByRole("button", {
    name: "Save Changes"
  }).click();

  // Verify success message
  await expect(
    page.getByText("Product updated successfully.")
  ).toBeVisible({ timeout: 15000 });

});


test("AB322 - Uploaded product image persists after refresh", async ({ page }) => {

  // Navigate to Admin Products
  await page.goto("http://localhost:5173/AdminProducts");

  // Find the test product
  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });
  await product.click();

  // Wait for product information to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify the uploaded image exists
  const existingImages = page.getByAltText("Existing product");

  await expect(existingImages.first()).toBeVisible({
    timeout: 15000
  });

  // Record the number of saved images
  const imageCount = await existingImages.count();

  expect(imageCount).toBeGreaterThan(0);

  // Refresh the page
  await page.reload();

  // Reopen the product
  const updatedProduct = page.getByText(productName, {
    exact: true
  });

  await expect(updatedProduct).toBeVisible({ timeout: 15000 });
  await updatedProduct.click();

  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify the saved images are still present
  await expect(
    page.getByAltText("Existing product")
  ).toHaveCount(imageCount, { timeout: 15000 });

});


test("AB323 - Admin can delete an existing product image", async ({ page }) => {

  await page.goto("http://localhost:5173/AdminProducts");

  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });
  await product.click();

  // Wait for product information to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Find existing images
  const existingImages = page.getByAltText("Existing product");

  await expect(existingImages.first()).toBeVisible({
    timeout: 15000
  });

  // Record original image count
  const originalCount = await existingImages.count();

  // Delete the first existing image
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.getByRole("button", {
    name: "Delete image"
  }).first().click();

  // Verify image was removed from the popup
  await expect(existingImages).toHaveCount(originalCount - 1);

  // Save changes
  await page.getByRole("button", {
    name: "Save Changes"
  }).click();

  await expect(
    page.getByText("Product updated successfully.")
  ).toBeVisible({ timeout: 15000 });

  // Refresh and reopen the product
  await page.reload();

  const updatedProduct = page.getByText(productName, {
    exact: true
  });

  await expect(updatedProduct).toBeVisible({ timeout: 15000 });
  await updatedProduct.click();

  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify deletion persisted
  await expect(
    page.getByAltText("Existing product")
  ).toHaveCount(originalCount - 1, { timeout: 15000 });

});



test("AB324 - Admin can reorder product images", async ({ page }) => {

  await page.goto("http://localhost:5173/AdminProducts");

  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });
  await product.click();

  // Wait for product information to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  const existingImages = page.getByAltText("Existing product");

  await expect(existingImages.first()).toBeVisible({
    timeout: 15000
  });

  // Upload another image if fewer than two exist
  if (await existingImages.count() < 2) {

    const testImage = {
      name: "playwright-reorder-image.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==",
        "base64"
      )
    };

    await page.locator('input[type="file"]').setInputFiles(testImage);

    await expect(
      page.getByText("1 new image selected")
    ).toBeVisible();

    await page.getByRole("button", {
      name: "Save Changes"
    }).click();

    await expect(
      page.getByText("Product updated successfully.")
    ).toBeVisible({ timeout: 15000 });

    // Reload to retrieve the newly saved image
    await page.reload();

    await expect(
      page.getByText(productName, { exact: true })
    ).toBeVisible({ timeout: 15000 });

    await page.getByText(productName, {
      exact: true
    }).click();

    await expect(
      page.getByPlaceholder("Value").nth(0)
    ).toHaveValue(productName, { timeout: 15000 });
  }

  // Find the saved images
  const images = page.getByAltText("Existing product");

  await expect(images).toHaveCount(2, { timeout: 15000 });

  // Remember original image order
  const firstImageUrl = await images.nth(0).getAttribute("src");
  const secondImageUrl = await images.nth(1).getAttribute("src");

  // Move second image to first position
  const positionDropdowns = page.getByRole("combobox", {
    name: "Change image position"
  });

  await positionDropdowns.nth(1).selectOption("1");

  // Verify the second image moved to the first position
  await expect(images.nth(0)).toHaveAttribute(
    "src",
    secondImageUrl
  );

  // Verify both images are still present
  await expect(images).toHaveCount(2);

  // Verify their positions
  await expect(positionDropdowns.nth(0)).toHaveValue("1");
  await expect(positionDropdowns.nth(1)).toHaveValue("2");

  // Save changes
  await page.getByRole("button", {
    name: "Save Changes"
  }).click();

  await expect(
    page.getByText("Product updated successfully.")
  ).toBeVisible({ timeout: 15000 });

});


test("AB325 - Product image order persists after refresh", async ({ page }) => {

  await page.goto("http://localhost:5173/AdminProducts");

  const product = page.getByText(productName, {
    exact: true
  });

  await expect(product).toBeVisible({ timeout: 15000 });
  await product.click();

  // Wait for product information to load
  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Find existing images
  const images = page.getByAltText("Existing product");

  await expect(images).toHaveCount(2, { timeout: 15000 });

  // Record current image order
  const firstImageUrl = await images.nth(0).getAttribute("src");
  const secondImageUrl = await images.nth(1).getAttribute("src");

  // Refresh the page
  await page.reload();

  // Reopen the product
  await expect(
    page.getByText(productName, { exact: true })
  ).toBeVisible({ timeout: 15000 });

  await page.getByText(productName, {
    exact: true
  }).click();

  await expect(
    page.getByPlaceholder("Value").nth(0)
  ).toHaveValue(productName, { timeout: 15000 });

  // Verify image order remains unchanged
  const savedImages = page.getByAltText("Existing product");

  await expect(savedImages).toHaveCount(2, { timeout: 15000 });

  await expect(savedImages.nth(0)).toHaveAttribute(
    "src",
    firstImageUrl
  );

  await expect(savedImages.nth(1)).toHaveAttribute(
    "src",
    secondImageUrl
  );

});
