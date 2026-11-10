import { test, expect as baseExpect } from '@playwright/test';

// Give retrying assertions in this file up to 15 seconds to pass.
// They continue immediately once the expected condition is met.
const expect = baseExpect.configure({
  timeout: 15000
});
// ============================================================
// REAL TEST ACCOUNT LOGIN
// ============================================================

// Sign in through the actual login form using an existing account.
// Credentials come from environment variables instead of being
// written directly into this test file.
// Use the main test account unless a test specifies other
// environment variable names, such as those for an empty account.
async function loginTestUser(
  page,
  emailVariable = 'PW_USER_EMAIL',
  passwordVariable = 'PW_USER_PASSWORD'
) {

  // Read the credentials from the selected environment variables.
  const email = process.env[emailVariable];
  const password = process.env[passwordVariable];

  // Show which environment variables are missing.
  if (!email || !password) {
    throw new Error(
      `Set ${emailVariable} and ${passwordVariable} before running this test.`
    );
  }
  // Open the site's actual login page.
  await page.goto('http://localhost:5173/login', {
    waitUntil: 'domcontentloaded'
  });

  // Enter the real test account's email address.
  await page.getByPlaceholder('Email Address', {
    exact: true
  }).fill(email);

  // Enter the real test account's password.
  await page.getByPlaceholder('Password', {
    exact: true
  }).fill(password);


  // Start listening before submitting the form so a fast response
  // cannot arrive before Playwright begins waiting for it.
  const [loginResponse] = await Promise.all([

    // Wait for Supabase's actual authentication response.
    page.waitForResponse(
      response =>
        new URL(response.url()).pathname.endsWith('/auth/v1/token') &&
        response.request().method() === 'POST',
      { timeout: 15000 }
    ),

    // Submit the login form.
    page.getByRole('button', {
      name: 'Log In',
      exact: true
    }).click()

  ]);

    // Read and save the response body BEFORE navigating to another page.
  // This keeps the account information available after navigation.
  const loginData = await loginResponse.json();

  // Report the reason if Supabase rejects the login.
  // Use the response data we already saved.
  if (!loginResponse.ok()) {

    const message =
      loginData.error_description ||
      loginData.msg ||
      loginData.message ||
      loginData.error_code ||
      'Unknown authentication error';

    throw new Error(
      `Login failed (${loginResponse.status()}): ${message}`
    );

  }


  // Wait for the app to navigate after successful authentication.
  await expect(page).not.toHaveURL(/\/login\/?$/i);

  // Open Home, matching your existing navigation test setup.
  await page.goto('http://localhost:5173/');

  // Confirm the app displays the signed-in customer navigation
  // before allowing the test to continue.
  await expect(
    page.getByRole('navigation')
      .getByRole('link', {
        name: 'Orders',
        exact: true
      })
  ).toBeVisible();


  // Make this information available to whichever test called the helper.
  // We will use it to check that returned orders belong to this account.
  return loginData;

}







// ============================================================
// USER PAST ORDER TESTS
// ============================================================

test.describe('User Past Orders', () => {

  // Start every test without cookies or local storage from a
  // previous login. Each signed-in test must log in for itself.
  test.use({
    storageState: { cookies: [], origins: [] }
  });







  // ==========================================================
  // PO001: SIGNED-OUT ACCESS
  // ==========================================================

  test('PO001: Signed-out user is redirected to login', async ({ page }) => {

    // Attempt to open order history without signing in.
    await page.goto('http://localhost:5173/orderHistory');

    // Verify ProtectedRoute redirects the user to login.
    await expect(page).toHaveURL(
      'http://localhost:5173/login'
    );

    // Verify the login form is displayed.
    await expect(
      page.getByPlaceholder('Email Address', {
        exact: true
      })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder('Password', {
        exact: true
      })
    ).toBeVisible();

  });









  // ==========================================================
  // PO002: SIGNED-IN ACCESS
  // ==========================================================

  test('PO002: Logged-in user can access order history', async ({ page }) => {

    // Sign in using the existing Supabase test account.
    await loginTestUser(page);

    // Listen for the actual orders response before opening the page.
    // This observes the request without changing its response.
    const [ordersResponse] = await Promise.all([

      page.waitForResponse(
        response =>
          new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
          response.request().method() === 'GET',
        { timeout: 15000 }
      ),

      page.goto('http://localhost:5173/orderHistory')

    ]);

    // Verify the real database request succeeded.
    expect(
      ordersResponse.ok(),
      'The order history database request should succeed.'
    ).toBe(true);

    // Read the actual saved orders returned by Supabase.
    const savedOrders = await ordersResponse.json();

    // Verify the response contains an array of orders.
    expect(Array.isArray(savedOrders)).toBe(true);

    // This test needs an account with an existing order so it can
    // confirm that an actual saved order appears on the page.
    expect(
      savedOrders.length,
      'The test account must have at least one saved order.'
    ).toBeGreaterThan(0);

    // Verify the order history page heading is visible.
    await expect(
      page.getByRole('heading', {
        name: 'Your Order History',
        exact: true
      })
    ).toBeVisible();

    // Build the expected heading from a real saved order ID.
    // The component displays only the first eight characters.
    const expectedOrderHeading =
      `Order #${savedOrders[0].id.slice(0, 8)}`;

    // Verify that the saved order actually appears.
    await expect(
      page.getByRole('heading', {
        name: expectedOrderHeading,
        exact: true
      })
    ).toBeVisible();

    // Verify loading finishes after the order details are fetched.
    await expect(
      page.getByText('Loading your past orders...', {
        exact: true
      })
    ).toBeHidden();

    // Verify the signed-in user remains on order history.
    await expect(page).toHaveURL(
      'http://localhost:5173/orderHistory'
    );

  });







    // ==========================================================
    // PO003: ORDERS BELONG TO THE SIGNED-IN ACCOUNT
    // ==========================================================

    test('PO003: Displayed orders belong to the signed-in account', async ({ page }) => {

    // Log in and save the actual account information returned by Supabase.
    const { user } = await loginTestUser(page);

    // Listen for the actual orders response before opening the page.
    const [ordersResponse] = await Promise.all([

        page.waitForResponse(
        response =>
            new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
            response.request().method() === 'GET',
        { timeout: 15000 }
        ),

        page.goto('http://localhost:5173/orderHistory')

    ]);

    // Confirm the database request succeeded before checking its records.
    expect(
        ordersResponse.ok(),
        'The orders request should succeed.'
    ).toBe(true);

    // Read the saved orders returned for this account.
    const orders = await ordersResponse.json();

    expect(Array.isArray(orders)).toBe(true);

    // Require an existing order so this ownership check actually tests data.
    expect(
        orders.length,
        'The test account must have at least one saved order.'
    ).toBeGreaterThan(0);

    // Check every returned order against the authenticated account.
    // Your component associates orders by user ID OR customer email.
    for (const order of orders) {

        const belongsToUser =
        order.user_id === user.id ||
        order.customer_email === user.email;

        expect(
        belongsToUser,
        `Order ${order.id} should belong to the signed-in account.`
        ).toBe(true);

    }

    // Build the expected order headings from the verified records.
    const expectedHeadings = orders.map(
        order => `Order #${order.id.slice(0, 8)}`
    );

    // Verify the page displays exactly those order headings.
    // This also waits for the order cards to finish rendering.
    await expect(
        page.locator('main h3')
    ).toHaveText(expectedHeadings);

    });





    // ==========================================================
    // PO004: ACCURATE ORDER DATES AND TOTALS
    // ==========================================================

    test('PO004: Order dates and totals match saved data', async ({ page }) => {

    // Sign in using the real test account.
    await loginTestUser(page);

    // Capture the actual saved orders while opening order history.
    const [ordersResponse] = await Promise.all([

        page.waitForResponse(
        response =>
            new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
            response.request().method() === 'GET',
        { timeout: 15000 }
        ),

        page.goto('http://localhost:5173/orderHistory')

    ]);

    // Verify the database request succeeded.
    expect(ordersResponse.ok()).toBe(true);

    // Read the saved order records.
    const orders = await ordersResponse.json();

    expect(Array.isArray(orders)).toBe(true);

    // Require saved orders so the date and total checks actually run.
    expect(
        orders.length,
        'The test account must have at least one saved order.'
    ).toBeGreaterThan(0);

    // Read the browser's timezone so the expected dates match
    // the timezone used by the page, even on a different computer.
    const browserTimezone = await page.evaluate(
        () => Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    // Check each order separately so a correct value on one card
    // cannot accidentally satisfy a check for another card.
    for (const order of orders) {

        // Locate this specific order by its displayed order number.
        const orderHeading = page.getByRole('heading', {
        name: `Order #${order.id.slice(0, 8)}`,
        exact: true
        });

        await expect(orderHeading).toBeVisible();

        // In your component, the heading's parent is the product grid.
        // Its grandparent is the complete order card.
        const orderCard = orderHeading.locator('../..');

        // Format the saved date in the page's month-and-day format.
        // For example: "Oct 20".
        const expectedDate = new Date(order.created_at).toLocaleDateString(
        'en-US',
        {
            month: 'short',
            day: 'numeric',
            timeZone: browserTimezone
        }
        );

        // Verify the date appears inside the correct order card.
        await expect(
        orderCard.getByText(expectedDate, {
            exact: true
        })
        ).toBeVisible();

        // Format the saved total as dollars with two decimal places.
        // For example: 24.5 becomes "Total: $24.50".
        const expectedTotal =
        `Total: $${Number(order.total_amount).toFixed(2)}`;

        // Verify the total appears inside the correct order card.
        await expect(
        orderCard.getByText(expectedTotal, {
            exact: true
        })
        ).toBeVisible();

    }

    });











    // ==========================================================
    // PO005: ACCURATE PRODUCT DETAILS AND QUANTITIES
    // ==========================================================

    test('PO005: Products and quantities match saved order items', async ({ page }) => {

    // Sign in using the real test account.
    await loginTestUser(page);

    // Listen for both database responses before opening the page.
    // OrderHistory first fetches orders, then their order items.
    const [ordersResponse, itemsResponse] = await Promise.all([

        page.waitForResponse(
        response =>
            new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
            response.request().method() === 'GET',
        { timeout: 15000 }
        ),

        page.waitForResponse(
        response =>
            new URL(response.url()).pathname.endsWith('/rest/v1/order_items') &&
            response.request().method() === 'GET',
        { timeout: 15000 }
        ),

        page.goto('http://localhost:5173/orderHistory')

    ]);

    // Verify both actual database requests succeeded.
    expect(
        ordersResponse.ok(),
        'The orders request should succeed.'
    ).toBe(true);

    expect(
        itemsResponse.ok(),
        'The order items request should succeed.'
    ).toBe(true);

    // Read the saved orders and their joined product information.
    const orders = await ordersResponse.json();
    const items = await itemsResponse.json();

    expect(Array.isArray(orders)).toBe(true);
    expect(Array.isArray(items)).toBe(true);

    // This test requires an account with existing orders and items.
    expect(
        orders.length,
        'The test account must have at least one saved order.'
    ).toBeGreaterThan(0);

    // Check the products belonging to each order separately.
    for (const order of orders) {

        // Match items to this order using their saved order_id.
        const savedItems = items.filter(
        item => item.order_id === order.id
        );

        // Prevent an order with no saved items from passing without
        // actually checking any product names or quantities.
        expect(
        savedItems.length,
        `Order ${order.id} must have saved items for this test.`
        ).toBeGreaterThan(0);

        // Locate the heading for this specific order.
        const orderHeading = page.getByRole('heading', {
        name: `Order #${order.id.slice(0, 8)}`,
        exact: true
        });

        await expect(orderHeading).toBeVisible();

        // Move up to the complete order card.
        const orderCard = orderHeading.locator('../..');

        // Build the expected product lines from the saved item records.
        // Match the page's fallback when a product is unavailable.
        const expectedProducts = savedItems.map(item => {

        const productName =
            item.products?.name || 'Product unavailable';

        return `${productName} × ${item.quantity}`;

        });

        // In your component, the paragraphs inside each order card
        // contain its product names and quantities.
        // Checking the full list also detects missing or extra lines.
        await expect(
        orderCard.locator('p')
        ).toHaveText(expectedProducts);

    }

    });









    // ==========================================================
    // PO006: ACCURATE ORDER STATUSES
    // ==========================================================

    test('PO006: Order statuses match saved data', async ({ page }) => {

    // Sign in using the real test account.
    await loginTestUser(page);

    // Capture the actual orders response while opening the page.
    const [ordersResponse] = await Promise.all([

        page.waitForResponse(
        response =>
            new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
            response.request().method() === 'GET',
        { timeout: 15000 }
        ),

        page.goto('http://localhost:5173/orderHistory')

    ]);

    // Verify the database request succeeded.
    expect(ordersResponse.ok()).toBe(true);

    // Read the saved order records.
    const orders = await ordersResponse.json();

    expect(Array.isArray(orders)).toBe(true);

    // Require existing orders so the status checks actually run.
    expect(
        orders.length,
        'The test account must have at least one saved order.'
    ).toBeGreaterThan(0);

    // Map the database status values to their displayed labels.
    // Both cancellation values display the same "Cancelled" badge.
    const statusLabels = {
        on_hold: 'On Hold',
        cancel_requested: 'Cancellation Requested',
        accepted: 'Accepted',
        postage_ready: 'Postage Ready',
        ready_to_ship: 'Ready to Ship',
        ready_for_pickup: 'Ready for Pickup',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        cancelled_no_refund: 'Cancelled',
        paid: 'Paid'
    };

    // Check the displayed status for every returned order.
    for (const order of orders) {

        // Locate the heading belonging to this saved order.
        const orderHeading = page.getByRole('heading', {
        name: `Order #${order.id.slice(0, 8)}`,
        exact: true
        });

        await expect(orderHeading).toBeVisible();

        // Move up to this order's complete card.
        const orderCard = orderHeading.locator('../..');

        // Use the expected label for recognized statuses.
        // For other values, match the component's fallback:
        // replace underscores with spaces, or show "Unknown".
        const expectedStatus =
        statusLabels[order.status] ??
        (order.status ? order.status.replace(/_/g, ' ') : 'Unknown');

        // Verify the correct status appears inside this specific card.
        await expect(
        orderCard.getByText(expectedStatus, {
            exact: true
        })
        ).toBeVisible();

    }

    });











    // ==========================================================
    // PO007: ACCOUNT WITH NO PAST ORDERS
    // ==========================================================

    test('PO007: Account with no orders sees the empty message', async ({ page }) => {

    // Sign into the real account that has no saved orders.
    // These names tell the helper which environment variables to read.
    await loginTestUser(
        page,
        'PW_EMPTY_USER_EMAIL',
        'PW_EMPTY_USER_PASSWORD'
    );

    // Capture the real database response while opening order history.
    const [ordersResponse] = await Promise.all([

        page.waitForResponse(
        response =>
            new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
            response.request().method() === 'GET',
        { timeout: 15000 }
        ),

        page.goto('http://localhost:5173/orderHistory')

    ]);

    // Confirm the request succeeded.
    // A failed database request must not count as an empty history.
    expect(ordersResponse.ok()).toBe(true);

    // Confirm Supabase actually returned no orders for this account.
    const orders = await ordersResponse.json();

    expect(
        orders,
        'The empty-history test account must have no matching orders.'
    ).toEqual([]);

    // Verify the page displays its empty order history message.
  await expect(
    page.getByText('No past orders found.', {
      exact: true
    })
  ).toBeVisible();

    // Verify no order cards appear.
    // Each order card in your component contains an h3 heading.
    await expect(
        page.locator('main h3')
    ).toHaveCount(0);

    });












    // ==========================================================
    // PO008: DESKTOP ORDER HISTORY LAYOUT
    // ==========================================================

    test('PO008: Order history fits and remains readable on desktop', async ({ page }) => {

    // Set the browser to a desktop screen size.
    await page.setViewportSize({
        width: 1440,
        height: 900
    });

    // Sign in using the real account that has saved orders.
    await loginTestUser(page);

    // Open the actual order history page.
    await page.goto('http://localhost:5173/orderHistory');

    // Wait for a saved order to appear before measuring the layout.
    const orderHeadings = page.locator('main h3');

    // Wait for the first order using the file-wide 15-second timeout.
    await expect(orderHeadings.first()).toBeVisible();

    // Check whether the page content extends beyond the screen width.
    // Horizontal overflow would force the user to scroll sideways.
    const pageWidths = await page.evaluate(() => ({
        contentWidth: document.documentElement.scrollWidth,
        screenWidth: window.innerWidth
    }));

    // Allow one pixel for browser rounding.
    expect(
        pageWidths.contentWidth,
        'The desktop page should not require horizontal scrolling.'
    ).toBeLessThanOrEqual(pageWidths.screenWidth + 1);

    const orderCards = orderHeadings.locator('../..');

    // Check every displayed order card.
    for (let i = 0; i < await orderCards.count(); i++) {

        const card = orderCards.nth(i);

        // Scroll to orders farther down the page before checking them.
        await card.scrollIntoViewIfNeeded();

        await expect(card).toBeInViewport();

        // Read the card's position and width.
        const cardBox = await card.boundingBox();

        expect(cardBox).not.toBeNull();

        // Verify both horizontal edges fit inside the desktop viewport.
        expect(cardBox.x).toBeGreaterThanOrEqual(-1);

        expect(
        cardBox.x + cardBox.width
        ).toBeLessThanOrEqual(1441);

        // Check the font sizes of the order number, product lines,
        // date, total, and status badge.
        const textElements = card.locator('h3, p, span');

        for (let j = 0; j < await textElements.count(); j++) {

        const textElement = textElements.nth(j);

        await expect(textElement).toBeVisible();

        // Measure the font size the browser actually applies.
        const fontSize = await textElement.evaluate(
            element => parseFloat(getComputedStyle(element).fontSize)
        );

        // Use 12px as the minimum font size for this automated check.
        expect(
            fontSize,
            'Order information should use a font size of at least 12px.'
        ).toBeGreaterThanOrEqual(12);

        }

    }

    });










    // ==========================================================
    // PO009: MOBILE ORDER HISTORY LAYOUT
    // ==========================================================

    test('PO009: Order history fits and remains readable on mobile', async ({ page }) => {

    // Log in at desktop size because the login helper checks
    // the desktop navigation for the Orders link.
    await page.setViewportSize({
        width: 1440,
        height: 900
    });

    await loginTestUser(page);

    // Switch to a mobile screen size before opening order history.
    // This test focuses on the order history page's mobile layout.
    await page.setViewportSize({
        width: 375,
        height: 812
    });

    // Open the actual order history page at the mobile width.
    await page.goto('http://localhost:5173/orderHistory');

    // Wait for a saved order to appear before checking the layout.
    const orderHeadings = page.locator('main h3');

    // Wait for the first order using the file-wide 15-second timeout.
    await expect(orderHeadings.first()).toBeVisible();

    // Measure whether the page content extends beyond the screen.
    const pageWidths = await page.evaluate(() => ({
        contentWidth: document.documentElement.scrollWidth,
        screenWidth: window.innerWidth
    }));

    // Mobile users should not need to scroll sideways.
    // Allow one pixel for browser rounding.
    expect(
        pageWidths.contentWidth,
        'The mobile page should not require horizontal scrolling.'
    ).toBeLessThanOrEqual(pageWidths.screenWidth + 1);

    // Locate each complete order card through its heading.
    const orderCards = orderHeadings.locator('../..');

    for (let i = 0; i < await orderCards.count(); i++) {

        const card = orderCards.nth(i);

        // Scroll down to cards that are below the visible screen.
        await card.scrollIntoViewIfNeeded();

        await expect(card).toBeInViewport();

        // Verify the card fits within the 375px screen width.
        const cardBox = await card.boundingBox();

        expect(cardBox).not.toBeNull();

        expect(cardBox.x).toBeGreaterThanOrEqual(-1);

        expect(
        cardBox.x + cardBox.width
        ).toBeLessThanOrEqual(376);

        // Check the order number, products, date, total, and status.
        const textElements = card.locator('h3, p, span');

        for (let j = 0; j < await textElements.count(); j++) {

        const textElement = textElements.nth(j);

        // Long orders may extend beyond one screen vertically.
        // Scroll to each piece of information before checking it.
        await textElement.scrollIntoViewIfNeeded();

        await expect(textElement).toBeInViewport();

        // Verify the text itself stays within the screen's width.
        const textBox = await textElement.boundingBox();

        expect(textBox).not.toBeNull();

        expect(textBox.x).toBeGreaterThanOrEqual(-1);

        expect(
            textBox.x + textBox.width
        ).toBeLessThanOrEqual(376);

        // Measure the actual font size applied on mobile.
        const fontSize = await textElement.evaluate(
            element => parseFloat(getComputedStyle(element).fontSize)
        );

        // Use the same minimum font size as the desktop test.
        expect(
            fontSize,
            'Mobile order information should use a font size of at least 12px.'
        ).toBeGreaterThanOrEqual(12);

        }

    }

    });











    // ==========================================================
    // PO010: BLOCK DIRECT ACCESS TO ANOTHER ACCOUNT'S ORDER
    // ==========================================================

    test('PO010: Another account cannot directly read a user order', async ({ page, browser }) => {

    // Sign into the main account and save its real user information.
    const ownerLogin = await loginTestUser(page);

    // Capture the main account's actual orders response.
    const [ordersResponse] = await Promise.all([

        page.waitForResponse(
        response =>
            new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
            response.request().method() === 'GET',
        { timeout: 15000 }
        ),

        page.goto('http://localhost:5173/orderHistory')

    ]);

    expect(ordersResponse.ok()).toBe(true);

    const orders = await ordersResponse.json();

    expect(Array.isArray(orders)).toBe(true);

    expect(
        orders.length,
        'The main test account must have at least one saved order.'
    ).toBeGreaterThan(0);

    // Read the public API key already used by the site's orders request.
    // The signed-in user's access token determines their account permissions.
    const requestHeaders = await ordersResponse.request().allHeaders();
    const publicApiKey = requestHeaders.apikey;

    expect(
        publicApiKey,
        'The orders request should include the Supabase public API key.'
    ).toBeTruthy();

    // Create a separate browser context for the second account.
    // Its cookies and local storage are independent of the main account.
    const otherContext = await browser.newContext({
        viewport: {
        width: 1440,
        height: 900
        },
        storageState: {
        cookies: [],
        origins: []
        }
    });

    // Always close this extra context, including when an assertion fails.
    try {

        const otherPage = await otherContext.newPage();

        // Sign into the second real account using its own credentials.
        const otherLogin = await loginTestUser(
        otherPage,
        'PW_EMPTY_USER_EMAIL',
        'PW_EMPTY_USER_PASSWORD'
        );

        // Confirm the two sets of credentials identify different users.
        expect(
        otherLogin.user.id,
        'This test requires two different accounts.'
        ).not.toBe(ownerLogin.user.id);

        // Choose an order associated with the main account
        // that is not associated with the second account.
        const targetOrder = orders.find(order => {

        const belongsToOwner =
            order.user_id === ownerLogin.user.id ||
            order.customer_email === ownerLogin.user.email;

        const belongsToOtherUser =
            order.user_id === otherLogin.user.id ||
            order.customer_email === otherLogin.user.email;

        return belongsToOwner && !belongsToOtherUser;

        });

        expect(
        targetOrder,
        'The main account needs an order not associated with the second account.'
        ).toBeTruthy();

        // Start with the real Supabase orders URL used by the site.
        const directOrderUrl = new URL(ordersResponse.url());

        // Remove the page's original account filters.
        // Request the target order directly by its ID instead.
        directOrderUrl.search = '';
        directOrderUrl.searchParams.set('select', 'id');
        directOrderUrl.searchParams.set('id', `eq.${targetOrder.id}`);

        // Send the request using ONLY the second account's access token.
        // This checks database access without relying on the page's filters.
        const directResponse = await otherPage.request.get(
        directOrderUrl.href,
        {
            headers: {
            apikey: publicApiKey,
            Authorization: `Bearer ${otherLogin.access_token}`
            }
        }
        );

        // Accept either a successful response that hides the order
        // or an explicit Forbidden response.
        // A 401 or server error should fail rather than count as a pass.
        expect(
        [200, 403],
        'The request should hide the order or explicitly deny access.'
        ).toContain(directResponse.status());

        if (directResponse.status() === 200) {

        // A successful query must return no records for this foreign order.
        const returnedOrders = await directResponse.json();

        expect(
            returnedOrders,
            'The second account must not receive the first account’s order.'
        ).toEqual([]);

        }

    } finally {

        // Release the separate browser context after the check finishes.
        await otherContext.close();

    }

    });








  // ==========================================================
  // PO011: REQUEST CANCELLATION DIALOG
  // ==========================================================

  test('PO011: Request Cancellation opens the correct order dialog', async ({ page }) => {

    // Sign in using the real account with saved orders.
    await loginTestUser(page);

    // Capture the actual orders response while opening the page.
    const [ordersResponse] = await Promise.all([

      page.waitForResponse(
        response =>
          new URL(response.url()).pathname.endsWith('/rest/v1/orders') &&
          response.request().method() === 'GET',
        { timeout: 15000 }
      ),

      page.goto('http://localhost:5173/orderHistory')

    ]);

    // Confirm the order request succeeded.
    expect(ordersResponse.ok()).toBe(true);

    const orders = await ordersResponse.json();

    expect(Array.isArray(orders)).toBe(true);

    // Cancellation is available only for orders with on_hold status.
    // Find an actual eligible order instead of assuming the first qualifies.
    const cancellableOrder = orders.find(
      order => order.status === 'on_hold'
    );

    // Report a clear setup issue if the account has no eligible orders.
    expect(
      cancellableOrder,
      'The main test account needs at least one On Hold order.'
    ).toBeTruthy();

    // Locate the eligible order by its displayed order number.
    const orderHeading = page.getByRole('heading', {
      name: `Order #${cancellableOrder.id.slice(0, 8)}`,
      exact: true
    });

    await expect(orderHeading).toBeVisible();

    // Move up to this specific order's complete card.
    const orderCard = orderHeading.locator('../..');

    // Locate the cancellation button inside this card.
    // This prevents accidentally clicking another order's button.
    const cancelButton = orderCard.getByRole('button', {
      name: 'Request Cancellation',
      exact: true
    });

    await expect(cancelButton).toBeVisible();

    // Open the confirmation dialog.
    await cancelButton.click();

    // The dialog gets its accessible name from its Cancel Order heading.
    const dialog = page.getByRole('dialog', {
      name: 'Cancel Order',
      exact: true
    });

    await expect(dialog).toBeVisible();

    // Verify the dialog references the order whose button we clicked.
    // The dialog displays the full ID rather than the shortened number.
    await expect(
      dialog.getByText(`Order Reference: #${cancellableOrder.id}`, {
        exact: true
      })
    ).toBeVisible();

    // Verify the confirmation action is available.
    await expect(
      dialog.getByRole('button', {
        name: 'Confirm Cancellation',
        exact: true
      })
    ).toBeVisible();

    // Close the dialog using Keep Order.
    // This exercises dismissal without submitting a cancellation.
    await dialog.getByRole('button', {
      name: 'Keep Order',
      exact: true
    }).click();

    // Verify the dialog has been removed.
    await expect(dialog).toHaveCount(0);

    // Verify the order still displays its original status.
    await expect(
      orderCard.getByText('On Hold', {
        exact: true
      })
    ).toBeVisible();

  });





});