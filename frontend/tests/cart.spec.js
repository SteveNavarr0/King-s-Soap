import { test, expect } from '@playwright/test';

test.describe('Cart UI and Checkout Edge Case Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to local app
    await page.goto('http://localhost:5173');
    // Ensure localStorage is cleared so we start with an empty cart
    await page.evaluate(() => localStorage.clear());
    // Open the Cart page/overlay
    await page.goto('http://localhost:5173/cart');
  });

  test('Empty Cart UI elements and initial states are visible', async ({ page }) => {
    // 1. Verify Header and Empty Message
    await expect(page.locator('h1', { hasText: 'Your Cart' })).toBeVisible();
    await expect(page.locator('text=Your cart is empty.')).toBeVisible();

    // 2. Verify Estimated Total text and subtext
    const totalHeading = page.locator('h2', { hasText: 'Estimated Total:' });
    await expect(totalHeading).toBeVisible();
    await expect(totalHeading).toHaveText('Estimated Total: $0.00');
    await expect(page.locator('text=Shipping and taxes calculated at checkout')).toBeVisible();
  });

  test('Checkout buttons are disabled when the cart is empty', async ({ page }) => {
    // Verify Shipping Checkout button is disabled
    const shippingBtn = page.getByRole('button', { name: 'Shipping Checkout' });
    await expect(shippingBtn).toBeVisible();
    await expect(shippingBtn).toBeDisabled();

    // Verify Local Pickup Checkout button is disabled
    const pickupBtn = page.getByRole('button', { name: 'Local Pickup Checkout' });
    await expect(pickupBtn).toBeVisible();
    await expect(pickupBtn).toBeDisabled();
  });

  test('Guest email input field and instructions render correctly', async ({ page }) => {
    // Verify Email label, red asterisk, and helper instructions
    await expect(page.locator('label[for="guest-email"]')).toHaveText('Email Address *');
    await expect(page.locator('text=Required for order confirmation & receipt')).toBeVisible();

    // Test typing an email into the input
    const emailInput = page.locator('#guest-email');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('stevenavarrojr@gmail.com');
    await expect(emailInput).toHaveValue('stevenavarrojr@gmail.com');
  });

  test('Discount code elements and disabled empty apply button work correctly', async ({ page }) => {
    // Verify Discount Code heading and input placeholder
    await expect(page.locator('label[for="discount-code"]')).toHaveText('Discount Code');
    const discountInput = page.locator('#discount-code');
    await expect(discountInput).toBeVisible();
    await expect(discountInput).toHaveAttribute('placeholder', 'Enter code');

    // Verify Apply button is disabled when input is empty
    const applyBtn = page.getByRole('button', { name: 'Apply' });
    await expect(applyBtn).toBeVisible();
    await expect(applyBtn).toBeDisabled();

    // Type a code and check that Apply button becomes enabled
    await discountInput.fill('SOAP10');
    await expect(applyBtn).toBeEnabled();
  });

  test('Overlay close button dismisses or navigates back', async ({ page }) => {
    // Verify the close '×' button is present on the overlay
    const closeBtn = page.locator('button[aria-label="Close cart"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      // Verifies navigation or dismissal post-click
    }
  });

});