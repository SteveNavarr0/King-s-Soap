
import { test, expect } from "@playwright/test";

test.describe("King's Soap - Home Page Functionality", () => {

    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:5173/");
    });

    // HP-001: Home Page Loading
    test("HP-001: Home page loads successfully", async ({ page }) => {
        await expect(page.locator("body")).toBeVisible();
    });

    // HP-002: Popular Products
    test("HP-002: Best sellers display correctly", async ({ page }) => {

        // Verify the Best Sellers heading is visible
        await expect(
            page.getByRole("heading", { name: "Our Best Sellers" })
        ).toBeVisible();

        // Find product links in the Best Sellers section
        const products = page.locator('a[href^="/product/"]');

        // Wait for at least one product to load
        await expect(products.first()).toBeVisible();

        // Verify no more than six products appear
        const productCount = await products.count();

        expect(productCount).toBeGreaterThan(0);
        expect(productCount).toBeLessThanOrEqual(6);

    });

        
    // HP-003: Best Seller Product Navigation
    test("HP-003: Clicking a best seller opens its product page", async ({ page }) => {

        // Find the first product link
        const firstProduct = page.locator('a[href^="/product/"]').first();

        // Wait for the product to appear
        await expect(firstProduct).toBeVisible();

        // Get the expected destination URL
        const productURL = await firstProduct.getAttribute("href");

        // Click the product
        await firstProduct.click();

        // Verify navigation to the correct product page
        await expect(page).toHaveURL(
            new RegExp(`${productURL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`)
        );

    });

    
    
    // HP-004: Navigation Bar Functionality
    test("HP-004: Navigation bar links work correctly", async ({ page }) => {

        // Test Shop navigation
        await page.getByRole("navigation")
            .getByRole("link", { name: "Shop" }).click();

        await expect(page).toHaveURL(/\/shop\/?$/);

        // Test About navigation
        await page.getByRole("navigation")
            .getByRole("link", { name: "About" }).click();

        await expect(page).toHaveURL(/\/about\/?$/);

        // Test Home navigation
        await page.getByRole("navigation")
            .getByRole("link", { name: "Home" }).click();

        await expect(page).toHaveURL(/\/$/);

        // Test logo navigation
        await page.getByRole("navigation")
            .getByRole("link", { name: "Logo" }).click();

        await expect(page).toHaveURL(/\/$/);

    });

    
    // HP-005: Shopping Cart Navigation
    test("HP-005: Shopping cart navigation works", async ({ page }) => {

        // Find shopping cart link
        const cartLink = page.locator('nav a[href="/cart"]');

        // Verify cart link is visible
        await expect(cartLink).toBeVisible();

        // Click cart
        await cartLink.click();

        // Verify navigation to cart
        await expect(page).toHaveURL(/\/cart\/?$/);

    });

    
    // HP-006: Mobile Navigation
    test("HP-006: Mobile navigation menu works", async ({ page }) => {

        // Set viewport to mobile dimensions
        await page.setViewportSize({
            width: 375,
            height: 812
        });

        // Find hamburger menu button
        const menuButton = page.getByRole("button", {
            name: "Open navigation menu"
        });

        // Verify button is visible
        await expect(menuButton).toBeVisible();

        // Verify menu is initially closed
        await expect(menuButton).toHaveAttribute("aria-expanded", "false");

        // Open mobile menu
        await menuButton.click();

        // Verify the menu opened
        await expect(
            page.getByRole("button", {
                name: "Close navigation menu"
            })
        ).toBeVisible();

        await expect(
            page.getByRole("button", {
                name: "Close navigation menu"
            })
        ).toHaveAttribute("aria-expanded", "true");

        // Click Shop
        await page.getByRole("navigation")
            .getByRole("link", { name: "Shop" }).click();

        // Verify Shop page opened
        await expect(page).toHaveURL(/\/shop\/?$/);

        // Verify menu closed after navigation
        await expect(
            page.getByRole("button", {
                name: "Open navigation menu"
            })
        ).toHaveAttribute("aria-expanded", "false");

    });

    
    // HP-007: Home page hero section displays correctly
    test("HP-007: Home page hero section displays correctly", async ({ page }) => {

    // Navigate to the home page
    await page.goto("http://localhost:5173/");

    // Verify the home page loads
    await expect(page).toHaveURL("http://localhost:5173/");

    // Verify the Best Sellers heading is visible
    await expect(
        page.getByRole("heading", { name: "Our Best Sellers" })
    ).toBeVisible();

    });

    
    // HP-009: Contact Form Validation
    test("HP-009: Contact form validates required fields", async ({ page }) => {

        // Open contact form
        await page.getByRole("button", {
            name: "Open contact form"
        }).click();

        const sendButton = page.getByRole("button", {
            name: "Send Message"
        });

        const inputs = page.locator('input[placeholder="Value"]');

        // Test 1: Submit with no name
        await sendButton.click();

        await expect(
            page.getByText("Please enter your name")
        ).toBeVisible();

        // Enter name
        await inputs.nth(0).fill("Test User");

        // Test 2: Submit with invalid email
        await inputs.nth(1).fill("invalid-email");

        await sendButton.click();

        await expect(
            page.getByText("Please enter a valid email address")
        ).toBeVisible();

        // Enter valid email
        await inputs.nth(1).fill("test@example.com");

        // Test 3: Submit without subject
        await sendButton.click();

        await expect(
            page.getByText("Please enter a subject field")
        ).toBeVisible();

        // Enter subject
        await inputs.nth(2).fill("Test Subject");

        // Test 4: Submit without message
        await sendButton.click();

        await expect(
            page.getByText("Please enter a message")
        ).toBeVisible();

    });



});
