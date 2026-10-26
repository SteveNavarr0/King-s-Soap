import { test, expect } from '@playwright/test';

test('E-Commerce Cart Flow: List items, verify total cost, and checkout', async ({ page }) => {
  // 1. Go to the app origin first to set up localStorage
  await page.goto('http://localhost:5173');

  // 2. Inject a mock item into guestCart localStorage
  await page.evaluate(() => {
    const mockItem = [{
      id: "test-product-1",
      name: "Sample Organic Soap",
      price: 10.00,
      stock: 10,
      quantity: 1,
      image: ""
    }];
    localStorage.setItem("guestCart", JSON.stringify(mockItem));
  });

  // 3. Navigate to the Cart page
  await page.goto('http://localhost:5173/cart');

  // --- DT-689: List cart items ---
  const cartItemName = page.locator('text=Sample Organic Soap');
  await expect(cartItemName).toBeVisible();

  // --- DT-690: View total cost ---
  const totalHeading = page.locator('h2', { hasText: 'Estimated Total:' });
  await expect(totalHeading).toBeVisible();
  
  // Use expect().toHaveText() with a retry loop so WebKit has time to calculate the total state
  await expect(totalHeading).toHaveText('Estimated Total: $10.00', { timeout: 5000 });

  // --- DT-691: Checkout ---
  const shippingCheckoutBtn = page.getByRole('button', { name: 'Shipping Checkout' });
  await expect(shippingCheckoutBtn).toBeEnabled();

  await shippingCheckoutBtn.click();
  await page.waitForTimeout(1000);
});