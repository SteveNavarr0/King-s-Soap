
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

    
    // HP-007: Home Page Hero Section (Checks Home Page Image and Text Display)
    test("HP-007: Home page hero section displays correctly", async ({ page }) => {

        // Verify the King's Soap heading is visible
        await expect(
            page.getByRole("heading", { name: "King’s Soap" })
        ).toBeVisible();

        // Verify the tagline is visible
        await expect(
            page.getByText("Enjoying the art of soap-making since 2016.")
        ).toBeVisible();

        // Verify the family-owned text is visible
        await expect(
            page.getByText("Hand-Made | Family-Owned")
        ).toBeVisible();

        // Verify the home page image exists
        const homeImage = page.getByRole("img", { name: "HomePageImage" });

        await expect(homeImage).toBeVisible();

        // Verify the image loaded successfully
        const imageLoaded = await homeImage.evaluate((img) => {
            return img.complete && img.naturalWidth > 0;
        });

        expect(imageLoaded).toBe(true);

    });

    
    // HP-008: Footer Functionality
    test("HP-008: Footer functions correctly", async ({ page }) => {

        // Find the footer
        const footer = page.locator("footer");

        // Verify the footer is visible
        await expect(footer).toBeVisible();

        // Verify the Contact Us heading
        await expect(
            footer.getByRole("heading", { name: "Contact Us" })
        ).toBeVisible();

        // Verify Google Maps link
        const mapsLink = footer.locator(
            'a[href="https://maps.google.com/maps?q=Sacramento+CA"]'
        );

        await expect(mapsLink).toBeVisible();

        await expect(mapsLink).toHaveAttribute("target", "_blank");

        // Verify Instagram link
        const instagramLink = footer.locator(
            'a[href="https://instagram.com/kingssoap"]'
        );

        await expect(instagramLink).toBeVisible();

        await expect(instagramLink).toHaveAttribute("target", "_blank");

            
        // Find the contact form button
        const contactButton = footer.getByRole("button", {
            name: "Open contact form"
        });

        // Verify the contact button is visible
        await expect(contactButton).toBeVisible();

        // Verify the contact form is initially closed
        await expect(
            page.getByRole("button", { name: "Send Message" })
        ).toHaveCount(0);

        // Open the contact form
        await contactButton.click();

        // Verify the contact form opened
        await expect(
            page.getByRole("button", { name: "Send Message" })
        ).toBeVisible();

        // Verify all four input fields appear
        const inputs = page.locator('input[placeholder="Value"]');

        await expect(inputs).toHaveCount(3);

        await expect(
            page.getByPlaceholder("Enter your message")
        ).toBeVisible();

        // Close the contact form
        await page.getByRole("button", { name: "×" }).click();

        // Verify the form closed
        await expect(
            page.getByRole("button", { name: "Send Message" })
        ).toHaveCount(0);


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
