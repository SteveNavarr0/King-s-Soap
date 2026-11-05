import { test, expect } from "@playwright/test";

const mockProducts = [
  {
    id: "shop-test-1",
    name: "Lavender Soap",
    price: 8,
    stock: 2,
    product_images: [
      {
        image_url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%238B6B4A'/%3E%3C/svg%3E",
        display_order: 1,
      },
      {
        image_url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%23C5AE98'/%3E%3C/svg%3E",
        display_order: 2,
      },
    ],
  },
  {
    id: "shop-test-2",
    name: "Coconut Oil Soap",
    price: 10.5,
    stock: 0,
    product_images: [
      {
        image_url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%23D9C7B5'/%3E%3C/svg%3E",
        display_order: 1,
      },
    ],
  },
  {
    id: "shop-test-3",
    name: "Soap Dish",
    price: 6.25,
    stock: 5,
    product_images: [],
  },
];

const mockSearchProducts = [
  {
    id: "search-test-1",
    name: "Lavender Soap",
    price: 8,
    description: "A gentle lavender bar",
    product_images: [],
  },
  {
    id: "search-test-2",
    name: "Lavender Soap Gift Set",
    price: 20,
    description: "A lavender gift set",
    product_images: [],
  },
  {
    id: "search-test-3",
    name: "French Lavender Bar",
    price: 9,
    description: "Lavender essential oil soap",
    product_images: [],
  },
  {
    id: "search-test-4",
    name: "Organic Lavender Scrub",
    price: 11,
    description: "An organic exfoliating bar",
    product_images: [],
  },
  {
    id: "search-test-5",
    name: "Lavender Soap Dish Set",
    price: 15,
    description: "Soap and dish bundle",
    product_images: [],
  },
];

test.describe("King's Soap - Shop Page Functionality", () => {

  test.beforeEach(async ({ page }) => {
    // Return a predictable product list instead of changing live Supabase data.
    await page.route("**/rest/v1/products*", async (route) => {
      const requestUrl = decodeURIComponent(
        route.request().url()
      );

      const responseProducts = requestUrl.includes("or=(")
        ? mockSearchProducts
        : mockProducts;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(responseProducts),
      });
    });

    // Begin every test with an empty guest cart.
    await page.addInitScript(() => {
      window.localStorage.removeItem("guestCart");
    });

    await page.goto("http://localhost:5173/shop");

    // Wait for the mocked products to render.
    await expect(
      page.getByRole("heading", { name: "Lavender Soap" })
    ).toBeVisible();
  });

  // DT-657: SHOP PRODUCT LIST

  // SP001: Verify the Shop page loads successfully
  test("SP001: Shop page loads successfully", async ({ page }) => {

    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL(/\/shop\/?$/);

  });

  // SP002: Verify all returned products display
  test("SP002: Product list displays all returned products", async ({ page }) => {

    await expect(
      page.locator('a[href^="/product/"]')
    ).toHaveCount(mockProducts.length);

    await expect(
      page.getByRole("heading", { name: "Lavender Soap" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Coconut Oil Soap" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Soap Dish" })
    ).toBeVisible();

  });

  // SP003: Verify product prices use currency formatting
  test("SP003: Product prices display correctly", async ({ page }) => {

    const lavenderCard = page
      .locator('a[href="/product/shop-test-1"]')
      .locator("..");

    const coconutCard = page
      .locator('a[href="/product/shop-test-2"]')
      .locator("..");

    await expect(
      lavenderCard.getByText("$8.00", { exact: true })
    ).toBeVisible();

    await expect(
      coconutCard.getByText("$10.50", { exact: true })
    ).toBeVisible();

  });

  // SP004: Verify product images load successfully
  test("SP004: Product images load successfully", async ({ page }) => {

    const lavenderImage = page.getByRole("img", {
      name: "Lavender Soap",
    });

    await expect(lavenderImage).toBeVisible();

    const imageLoaded = await lavenderImage.evaluate((image) => {
      return image.complete && image.naturalWidth > 0;
    });

    expect(imageLoaded).toBe(true);

  });

  // SP005: Verify the fallback appears when a product has no image
  test("SP005: Missing product image displays fallback", async ({ page }) => {

    const soapDishCard = page
      .locator('a[href="/product/shop-test-3"]');

    await expect(
      soapDishCard.getByText("No image available")
    ).toBeVisible();

  });

  // SP006: Verify each product has an Add to Cart button
  test("SP006: Every product displays an Add to Cart button", async ({ page }) => {

    await expect(
      page.getByRole("button", { name: "Add to Cart" })
    ).toHaveCount(mockProducts.length);

  });

  // SP007: Verify product cards link to the correct product pages
  test("SP007: Product cards link to the correct product pages", async ({ page }) => {

    await expect(
      page.locator('a[href="/product/shop-test-1"]')
    ).toBeVisible();

    await expect(
      page.locator('a[href="/product/shop-test-2"]')
    ).toBeVisible();

    await expect(
      page.locator('a[href="/product/shop-test-3"]')
    ).toBeVisible();

  });

  // SP008: Verify clicking a product opens the matching product page
  test("SP008: Clicking a product opens its product page", async ({ page }) => {

    await page
      .locator('a[href="/product/shop-test-1"]')
      .click();

    await expect(page).toHaveURL(
      /\/product\/shop-test-1\/?$/
    );

  });


  // ==================================================
  // DT-657: GUEST CART FUNCTIONALITY
  // ==================================================

  // SP009: Verify an available product can be added to the guest cart
  test("SP009: Available product is added to guest cart", async ({ page }) => {

    const lavenderCard = page
      .locator('a[href="/product/shop-test-1"]')
      .locator("..");

    await lavenderCard
      .getByRole("button", { name: "Add to Cart" })
      .click();

    await expect(
      page.getByRole("status")
    ).toHaveText("Added Lavender Soap to cart.");

    const guestCart = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem("guestCart") || "[]"
      );
    });

    expect(guestCart).toHaveLength(1);
    expect(guestCart[0].id).toBe("shop-test-1");
    expect(guestCart[0].name).toBe("Lavender Soap");
    expect(guestCart[0].quantity).toBe(1);

  });

  // SP010: Verify adding the same guest product increases its quantity
  test("SP010: Repeated Add to Cart increases guest quantity", async ({ page }) => {

    const addLavenderButton = page
      .locator('a[href="/product/shop-test-1"]')
      .locator("..")
      .getByRole("button", { name: "Add to Cart" });

    await addLavenderButton.click();
    await addLavenderButton.click();

    const guestCart = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem("guestCart") || "[]"
      );
    });

    expect(guestCart).toHaveLength(1);
    expect(guestCart[0].quantity).toBe(2);

  });

  // SP011: Verify the guest cannot exceed available stock
  test("SP011: Guest cart respects product stock limit", async ({ page }) => {

    const addLavenderButton = page
      .locator('a[href="/product/shop-test-1"]')
      .locator("..")
      .getByRole("button", { name: "Add to Cart" });

    await addLavenderButton.click();
    await addLavenderButton.click();
    await addLavenderButton.click();

    await expect(
      page.getByRole("alert")
    ).toHaveText(
      "Cannot add more than 2 of Lavender Soap to cart."
    );

    const guestCart = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem("guestCart") || "[]"
      );
    });

    expect(guestCart[0].quantity).toBe(2);

  });

  // SP012: Verify an out-of-stock product is rejected
  test("SP012: Out-of-stock product cannot be added to cart", async ({ page }) => {

    const coconutCard = page
      .locator('a[href="/product/shop-test-2"]')
      .locator("..");

    await coconutCard
      .getByRole("button", { name: "Add to Cart" })
      .click();

    await expect(
      page.getByRole("alert")
    ).toHaveText("Coconut Oil Soap is out of stock.");

    const guestCart = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem("guestCart") || "[]"
      );
    });

    expect(guestCart).toEqual([]);

  });


  // ==================================================
  // DT-657: RESPONSIVE PRODUCT GRID
  // ==================================================

  // SP013: Verify products remain visible on a mobile viewport
  test("SP013: Product grid displays on mobile", async ({ page }) => {

    await page.setViewportSize({
      width: 375,
      height: 812,
    });

    await expect(
      page.getByRole("heading", { name: "Lavender Soap" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Coconut Oil Soap" })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Add to Cart" })
    ).toHaveCount(mockProducts.length);

  });


  // ==================================================
  // DT-658: CATEGORY FILTERS
  // ==================================================

  // SP014: Verify all current category filters display
  test("SP014: Current category filters display", async ({ page }) => {

    await expect(
      page.getByRole("link", { name: "All Products" })
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Coconut Oil Soaps" })
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Organic Soaps" })
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "All Natural Soaps" })
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Soap Dishes" })
    ).toBeVisible();

  });

  // SP015: Verify category filters point to the correct routes
  test("SP015: Category filters have correct routes", async ({ page }) => {

    await expect(
      page.getByRole("link", { name: "All Products" })
    ).toHaveAttribute("href", "/Shop");

    await expect(
      page.getByRole("link", { name: "Coconut Oil Soaps" })
    ).toHaveAttribute("href", "/coconutOilShop");

    await expect(
      page.getByRole("link", { name: "Organic Soaps" })
    ).toHaveAttribute("href", "/organicShop");

    await expect(
      page.getByRole("link", { name: "All Natural Soaps" })
    ).toHaveAttribute("href", "/allNaturalShop");

    await expect(
      page.getByRole("link", { name: "Soap Dishes" })
    ).toHaveAttribute("href", "/soapDishShop");

  });

  // SP016: Verify selecting a category opens its category page
  test("SP016: Category filter navigation works", async ({ page }) => {

    await page
      .getByRole("link", { name: "Coconut Oil Soaps" })
      .click();

    await expect(page).toHaveURL(
      /\/coconutOilShop\/?$/
    );

  });

  // SP017: Verify the discontinued Lip Balm category is absent
  test("SP017: Lip Balm category is not displayed", async ({ page }) => {

    await expect(
      page.getByRole("link", { name: /lip balm/i })
    ).toHaveCount(0);

  });


  // ==================================================
  // DT-659: PRODUCT SEARCH
  // ==================================================

  // SP018: Verify the search bar displays on the Shop page
  test("SP018: Product search bar displays", async ({ page }) => {

    await expect(
      page.getByPlaceholder("Search")
    ).toBeVisible();

  });

  // SP019: Verify focusing an empty search displays popular products
  test("SP019: Empty search displays popular products", async ({ page }) => {

    const searchInput = page.getByPlaceholder("Search");
    const searchContainer = searchInput.locator("..");

    await searchInput.focus();

    await expect(
      searchContainer.locator('a[href="/product/shop-test-1"]')
    ).toBeVisible();

    await expect(
      searchContainer.locator('a[href^="/product/"]')
    ).toHaveCount(mockProducts.length);

  });

  // SP020: Verify typing a search term displays matching results
  test("SP020: Search term displays product results", async ({ page }) => {

    const searchInput = page.getByPlaceholder("Search");
    const searchContainer = searchInput.locator("..");

    await searchInput.fill("lavender");

    await expect(
      searchContainer.locator('a[href^="/product/"]')
    ).toHaveCount(4);

    await expect(
      searchContainer.getByText("Lavender Soap", {
        exact: true,
      })
    ).toBeVisible();

  });

  // SP021: Verify exact product-name matches rank first
  test("SP021: Exact product-name match ranks first", async ({ page }) => {

    const searchInput = page.getByPlaceholder("Search");
    const searchContainer = searchInput.locator("..");

    await searchInput.fill("Lavender Soap");

    const searchResults = searchContainer.locator(
      'a[href^="/product/"]'
    );

    await expect(searchResults).toHaveCount(4);

    await expect(
      searchResults.first()
    ).toHaveAttribute(
      "href",
      "/product/search-test-1"
    );

  });

  // SP022: Verify search limits the result list to four products
  test("SP022: Search displays no more than four results", async ({ page }) => {

    const searchInput = page.getByPlaceholder("Search");
    const searchContainer = searchInput.locator("..");

    await searchInput.fill("lavender");

    await expect(
      searchContainer.locator('a[href^="/product/"]')
    ).toHaveCount(4);

  });

  // SP023: Verify search requests only active products
  test("SP023: Search requests only active products", async ({ page }) => {

    const activeSearchRequest = page.waitForRequest((request) => {
      const requestUrl = decodeURIComponent(request.url());

      return (
        requestUrl.includes("/rest/v1/products") &&
        requestUrl.includes("or=(") &&
        requestUrl.includes("is_active=eq.true")
      );
    });

    await page.getByPlaceholder("Search").fill("lavender");

    await activeSearchRequest;

  });

  // SP024: Verify clicking a search result opens its product page
  test("SP024: Clicking a search result opens its product page", async ({ page }) => {

    const searchInput = page.getByPlaceholder("Search");
    const searchContainer = searchInput.locator("..");

    await searchInput.fill("Lavender Soap");

    const exactResult = searchContainer.locator(
      'a[href="/product/search-test-1"]'
    );

    await expect(exactResult).toBeVisible();
    await exactResult.click();

    await expect(page).toHaveURL(
      /\/product\/search-test-1\/?$/
    );

  });

});
