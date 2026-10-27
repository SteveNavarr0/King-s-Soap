import { test, expect } from "@playwright/test";


// ============================================================
// SIGNED-OUT USER NAVIGATION
// ============================================================
test.describe("King's Soap - Signed-Out Navigation", () => {


    test.beforeEach(async ({ page }) => {
        // Set the browser to desktop dimensions
        await page.setViewportSize({
            width: 1440,
            height: 900
        });

        // Open the Home page before each test
        await page.goto("http://localhost:5173/");
    });

    // NAV-001: Signed-Out Desktop Navigation Display
    test("NAV-001: Correct navigation links appear when signed out", async ({ page }) => {

        // Find the navigation bar
        const navbar = page.getByRole("navigation");

        // Verify the public navigation links are visible
        for (const name of ["Home", "Shop", "About", "Log In"]) {
            await expect(
                navbar.getByRole("link", { name, exact: true })
            ).toBeVisible();
        }

        // Verify the shopping cart link is visible
        await expect(
            navbar.locator('a[href="/cart"]')
        ).toBeVisible();

        // Orders should only appear for logged-in users
        await expect(
            navbar.getByRole("link", { name: "Orders", exact: true })
        ).toHaveCount(0);

        // The mobile menu button should be hidden on desktop
        await expect(
            navbar.getByRole("button", {
                name: "Open navigation menu"
            })
        ).toBeHidden();

    });



    // NAV-002: Signed-Out Desktop Navigation Links
    const publicPages = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: "About", path: "/about" },
        { name: "Log In", path: "/login" }
    ];

    // Create navigation tests starting from each public page
    for (const source of publicPages) {

        // Test every destination link from the current source page
        for (const destination of publicPages) {

            test(`NAV-002: ${source.name} → ${destination.name} on desktop`, async ({ page }) => {

                // Open the starting page
                await page.goto(
                    `http://localhost:5173${source.path}`
                );

                // Find the destination link in the navigation bar
                const link = page.getByRole("navigation")
                    .getByRole("link", {
                        name: destination.name,
                        exact: true
                    });

                // Verify the link is visible and click it
                await expect(link).toBeVisible();
                await link.click();

                // Verify the browser reaches the expected URL
                await expect(page).toHaveURL(
                    `http://localhost:5173${destination.path}`
                );

            });

        }
    }



        // NAV-003: Signed-Out Desktop Cart Navigation
    for (const source of publicPages) {

        test(`NAV-003: Open and close Cart from ${source.name} on desktop`, async ({ page }) => {

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`
            );

            // Find the Cart link in the navigation bar
            const cartLink = page.getByRole("navigation")
                .locator('a[href="/cart"]');

            // Verify the Cart link is visible and click it
            await expect(cartLink).toBeVisible();
            await cartLink.click();

            // Verify the browser reaches the Cart URL
            await expect(page).toHaveURL(
                "http://localhost:5173/cart"
            );

            // Verify the Cart interface appears
            const cartHeading = page.getByRole("heading", {
                name: "Your Cart",
                exact: true
            });

            await expect(cartHeading).toBeVisible();

            // Close the Cart
            await page.getByRole("button", {
                name: "Close cart",
                exact: true
            }).click();

            // Verify navigation returns to the starting page
            await expect(page).toHaveURL(
                `http://localhost:5173${source.path}`
            );

            // Verify the Cart interface disappears
            await expect(cartHeading).toBeHidden();

        });

    }





        // NAV-004: Signed-Out Mobile Menu Display
    for (const source of publicPages) {

        test(`NAV-004: Mobile menu opens and closes on ${source.name}`, async ({ page }) => {

            // Set the browser to mobile dimensions
            await page.setViewportSize({
                width: 375,
                height: 812
            });

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`
            );

            const navbar = page.getByRole("navigation");

            // Verify the mobile menu button appears and is closed
            const openButton = navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            });

            await expect(openButton).toBeVisible();
            await expect(openButton).toHaveAttribute(
                "aria-expanded", "false"
            );

            // Verify navigation links are initially hidden
            await expect(
                navbar.getByRole("link", {
                    name: "Home",
                    exact: true
                })
            ).toBeHidden();

            // Open the mobile menu
            await openButton.click();

            const closeButton = navbar.getByRole("button", {
                name: "Close navigation menu",
                exact: true
            });

            await expect(closeButton).toBeVisible();
            await expect(closeButton).toHaveAttribute(
                "aria-expanded", "true"
            );

            // Verify all public navigation links appear
            for (const destination of publicPages) {
                await expect(
                    navbar.getByRole("link", {
                        name: destination.name,
                        exact: true
                    })
                ).toBeVisible();
            }

            // Verify the Cart link appears
            await expect(
                navbar.locator('a[href="/cart"]')
            ).toBeVisible();

            // Close the mobile menu
            await closeButton.click();

            // Verify the menu returns to its closed state
            await expect(openButton).toBeVisible();
            await expect(openButton).toHaveAttribute(
                "aria-expanded", "false"
            );

            await expect(
                navbar.getByRole("link", {
                    name: "Home",
                    exact: true
                })
            ).toBeHidden();

        });

    }





    // NAV-005: Signed-Out Mobile Navigation Links
    for (const source of publicPages) {

        for (const destination of publicPages) {

            test(`NAV-005: ${source.name} → ${destination.name} on mobile`, async ({ page }) => {

                // Set the browser to mobile dimensions
                await page.setViewportSize({
                    width: 375,
                    height: 812
                });

                // Open the starting page
                await page.goto(
                    `http://localhost:5173${source.path}`
                );

                const navbar = page.getByRole("navigation");

                // Open the mobile menu
                await navbar.getByRole("button", {
                    name: "Open navigation menu",
                    exact: true
                }).click();

                // Find the destination link
                const link = navbar.getByRole("link", {
                    name: destination.name,
                    exact: true
                });

                // Verify the link is visible and click it
                await expect(link).toBeVisible();
                await link.click();

                // Verify navigation reaches the expected URL
                await expect(page).toHaveURL(
                    `http://localhost:5173${destination.path}`
                );

                // Verify the mobile menu closes after navigation
                const menuButton = navbar.getByRole("button", {
                    name: "Open navigation menu",
                    exact: true
                });

                await expect(menuButton).toBeVisible();
                await expect(menuButton).toHaveAttribute(
                    "aria-expanded", "false"
                );

                // Verify the navigation links are hidden again
                await expect(link).toBeHidden();

            });

        }
    }






        // NAV-006: Signed-Out Mobile Cart Navigation
    for (const source of publicPages) {

        test(`NAV-006: Open Cart and return to ${source.name} on mobile`, async ({ page }) => {

            // Set the browser to mobile dimensions
            await page.setViewportSize({
                width: 375,
                height: 812
            });

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`
            );

            const navbar = page.getByRole("navigation");

            // Open the mobile menu
            await navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            }).click();

            // Verify the Cart link is visible and click it
            const cartLink = navbar.locator('a[href="/cart"]');

            await expect(cartLink).toBeVisible();
            await cartLink.click();

            // Verify the browser reaches the Cart URL
            await expect(page).toHaveURL(
                "http://localhost:5173/cart"
            );

            // Verify the Cart interface appears
            const cartHeading = page.getByRole("heading", {
                name: "Your Cart",
                exact: true
            });

            await expect(cartHeading).toBeVisible();

            // Verify the mobile menu closed after clicking Cart
            const menuButton = navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            });

            await expect(menuButton).toBeVisible();
            await expect(menuButton).toHaveAttribute(
                "aria-expanded", "false"
            );

            // Reopen the menu while viewing Cart
            await menuButton.click();

            // Navigate back to the starting page
            await navbar.getByRole("link", {
                name: source.name,
                exact: true
            }).click();

            // Verify the starting page URL and that Cart disappears
            await expect(page).toHaveURL(
                `http://localhost:5173${source.path}`
            );

            await expect(cartHeading).toBeHidden();

            // Verify the menu closes after returning
            await expect(menuButton).toHaveAttribute(
                "aria-expanded", "false"
            );

        });

    }



})





// ============================================================
// LOGGED-IN USER NAVIGATION
// ============================================================

test.describe("King's Soap - Logged-In User Navigation", () => {

    test.beforeEach(async ({ page }) => {

        // Read the test account credentials from environment variables
        const email = process.env.PW_USER_EMAIL;
        const password = process.env.PW_USER_PASSWORD;

        if (!email || !password) {
            throw new Error(
                "Set PW_USER_EMAIL and PW_USER_PASSWORD before running these tests."
            );
        }

        // Set the browser to desktop dimensions
        await page.setViewportSize({
            width: 1440,
            height: 900
        });

        // Open the login page
        await page.goto("http://localhost:5173/login", {
            waitUntil: "domcontentloaded"
        });

        // Enter the test account credentials
        await page.getByPlaceholder("Email Address", {
            exact: true
        }).fill(email);

        await page.getByPlaceholder("Password", {
            exact: true
        }).fill(password);

                // Wait for the login response while submitting the form
        const [loginResponse] = await Promise.all([
            page.waitForResponse(
                response =>
                    response.url().includes("/auth/v1/token") &&
                    response.request().method() === "POST",
                { timeout: 15000 }
            ),

            page.getByRole("button", {
                name: "Log In",
                exact: true
            }).click()
        ]);

        // Report the authentication error if login was rejected
        if (!loginResponse.ok()) {
            const data = await loginResponse.json();

            const message =
                data.error_description ||
                data.msg ||
                data.message ||
                data.error_code ||
                "Unknown authentication error";

            throw new Error(
                `Login failed (${loginResponse.status()}): ${message}`
            );
        }

        // Wait for navigation after successful login
        await expect(page).not.toHaveURL(/\/login\/?$/i);

        // Open the user Home page
        await page.goto("http://localhost:5173/");

        // Wait for the logged-in navigation to appear
        await expect(
            page.getByRole("navigation")
                .getByRole("link", {
                    name: "Orders",
                    exact: true
                })
        ).toBeVisible();

    });






    // NAV-007: Logged-In Desktop Navigation Display
    test("NAV-007: Correct navigation links appear when logged in", async ({ page }) => {

        const navbar = page.getByRole("navigation");

        // Verify the logged-in navigation links are visible
        for (const name of ["Home", "Shop", "About", "Orders"]) {
            await expect(
                navbar.getByRole("link", {
                    name,
                    exact: true
                })
            ).toBeVisible();
        }

        // Verify the Cart link is visible
        await expect(
            navbar.locator('a[href="/cart"]')
        ).toBeVisible();

        // Verify the account menu button replaces Log In
        await expect(
            navbar.getByRole("button", {
                name: "Account menu",
                exact: true
            })
        ).toBeVisible();

        await expect(
            navbar.getByRole("link", {
                name: "Log In",
                exact: true
            })
        ).toHaveCount(0);

        // Verify the mobile menu button is hidden on desktop
        await expect(
            navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            })
        ).toBeHidden();

    });






    // NAV-008: Logged-In Desktop Navigation Links
    const loggedInPages = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: "About", path: "/about" },
        { name: "Orders", path: "/OrderHistory" }
    ];

    // Create navigation tests starting from each logged-in page
    for (const source of loggedInPages) {

        // Test every destination link from the current source page
        for (const destination of loggedInPages) {

            test(`NAV-008: ${source.name} → ${destination.name} on desktop when logged in`, async ({ page }) => {

                // Open the starting page
                await page.goto(
                    `http://localhost:5173${source.path}`
                );

                const navbar = page.getByRole("navigation");

                // Wait for authentication to load on the starting page
                await expect(
                    navbar.getByRole("link", {
                        name: "Orders",
                        exact: true
                    })
                ).toBeVisible();

                // Find the destination link
                const link = navbar.getByRole("link", {
                    name: destination.name,
                    exact: true
                });

                // Verify the link is visible and click it
                await expect(link).toBeVisible();
                await link.click();

                // Verify navigation reaches the expected URL
                await expect(page).toHaveURL(
                    `http://localhost:5173${destination.path}`
                );

            });

        }
    }







    // NAV-009: Logged-In Desktop Sign Out
    for (const source of loggedInPages) {

        test(`NAV-009: Sign out from ${source.name} on desktop`, async ({ page }) => {

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`
            );

            const navbar = page.getByRole("navigation");

            // Find the account menu button
            const accountButton = navbar.getByRole("button", {
                name: "Account menu",
                exact: true
            });

            // Wait for the logged-in account controls and open the menu
            await expect(accountButton).toBeVisible();
            await accountButton.click();

            // Verify the account menu opened
            await expect(accountButton).toHaveAttribute(
                "aria-expanded", "true"
            );

            // Find and click Sign Out
            const signOutButton = navbar.getByRole("button", {
                name: "Sign Out",
                exact: true
            });

            await expect(signOutButton).toBeVisible();
            await signOutButton.click();

            // Verify the user is redirected to Login
            await expect(page).toHaveURL(
                "http://localhost:5173/login"
            );

            // Verify the signed-out Log In link appears
            await expect(
                navbar.getByRole("link", {
                    name: "Log In",
                    exact: true
                })
            ).toBeVisible();

            // Verify Orders is removed
            await expect(
                navbar.getByRole("link", {
                    name: "Orders",
                    exact: true
                })
            ).toHaveCount(0);

            // Verify the signed-in account button is removed
            await expect(accountButton).toHaveCount(0);

        });

    }







    // NAV-010: Logged-In Desktop Cart Navigation
    for (const source of loggedInPages) {

        test(`NAV-010: Open and close Cart from ${source.name} when logged in`, async ({ page }) => {

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`,
                { waitUntil: "domcontentloaded" }
            );

            const navbar = page.getByRole("navigation");

            // Wait for the logged-in navigation to appear
            await expect(
                navbar.getByRole("link", {
                    name: "Orders",
                    exact: true
                })
            ).toBeVisible();

            // Find and click the Cart link
            const cartLink = navbar.locator('a[href="/cart"]');

            await expect(cartLink).toBeVisible();
            await cartLink.click();

            // Verify navigation reaches the Cart URL
            await expect(page).toHaveURL(
                "http://localhost:5173/cart"
            );

            // Verify the Cart interface appears
            const cartHeading = page.getByRole("heading", {
                name: "Your Cart",
                exact: true
            });

            await expect(cartHeading).toBeVisible();

            // Close the Cart
            await page.getByRole("button", {
                name: "Close cart",
                exact: true
            }).click();

            // Verify navigation returns to the starting page
            await expect(page).toHaveURL(
                `http://localhost:5173${source.path}`
            );

            // Verify the Cart interface disappears
            await expect(cartHeading).toBeHidden();

            // Verify the user remains signed in
            await expect(
                navbar.getByRole("link", {
                    name: "Orders",
                    exact: true
                })
            ).toBeVisible();

        });

    }






    // NAV-011: Logged-In Mobile Menu Display
    for (const source of loggedInPages) {

        test(`NAV-011: Logged-in mobile menu opens and closes on ${source.name}`, async ({ page }) => {

            // Set the browser to mobile dimensions
            await page.setViewportSize({
                width: 375,
                height: 812
            });

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`,
                { waitUntil: "domcontentloaded" }
            );

            const navbar = page.getByRole("navigation");

            // Verify the mobile menu is initially closed
            const openButton = navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            });

            await expect(openButton).toBeVisible();
            await expect(openButton).toHaveAttribute(
                "aria-expanded", "false"
            );

            // Verify navigation links are initially hidden
            await expect(
                navbar.getByRole("link", {
                    name: "Home",
                    exact: true
                })
            ).toBeHidden();

            // Open the mobile menu
            await openButton.click();

            const closeButton = navbar.getByRole("button", {
                name: "Close navigation menu",
                exact: true
            });

            await expect(closeButton).toBeVisible();
            await expect(closeButton).toHaveAttribute(
                "aria-expanded", "true"
            );

            // Verify all logged-in navigation links appear
            for (const destination of loggedInPages) {
                await expect(
                    navbar.getByRole("link", {
                        name: destination.name,
                        exact: true
                    })
                ).toBeVisible();
            }

            // Verify the Cart link appears
            await expect(
                navbar.locator('a[href="/cart"]')
            ).toBeVisible();

            // Verify the mobile account controls appear
            await expect(
                navbar.getByRole("link", {
                    name: "Change Password",
                    exact: true
                })
            ).toBeVisible();

            await expect(
                navbar.getByRole("button", {
                    name: "Sign Out",
                    exact: true
                })
            ).toBeVisible();

            // Verify Log In is not shown to a signed-in user
            await expect(
                navbar.getByRole("link", {
                    name: "Log In",
                    exact: true
                })
            ).toHaveCount(0);

            // Close the mobile menu
            await closeButton.click();

            // Verify the menu returns to its closed state
            await expect(openButton).toBeVisible();
            await expect(openButton).toHaveAttribute(
                "aria-expanded", "false"
            );

            await expect(
                navbar.getByRole("link", {
                    name: "Home",
                    exact: true
                })
            ).toBeHidden();

        });

    }






    // NAV-012: Logged-In Mobile Navigation Links
    for (const source of loggedInPages) {

        for (const destination of loggedInPages) {

            test(`NAV-012: ${source.name} → ${destination.name} on mobile when logged in`, async ({ page }) => {

                // Set the browser to mobile dimensions
                await page.setViewportSize({
                    width: 375,
                    height: 812
                });

                // Open the starting page
                await page.goto(
                    `http://localhost:5173${source.path}`,
                    { waitUntil: "domcontentloaded" }
                );

                const navbar = page.getByRole("navigation");

                // Open the mobile menu
                await navbar.getByRole("button", {
                    name: "Open navigation menu",
                    exact: true
                }).click();

                // Wait for the logged-in navigation to appear
                await expect(
                    navbar.getByRole("link", {
                        name: "Orders",
                        exact: true
                    })
                ).toBeVisible();

                // Find the destination link
                const link = navbar.getByRole("link", {
                    name: destination.name,
                    exact: true
                });

                // Verify the link is visible and click it
                await expect(link).toBeVisible();
                await link.click();

                // Verify navigation reaches the expected URL
                await expect(page).toHaveURL(
                    `http://localhost:5173${destination.path}`
                );

                // Verify the menu closes after navigation
                const menuButton = navbar.getByRole("button", {
                    name: "Open navigation menu",
                    exact: true
                });

                await expect(menuButton).toBeVisible();
                await expect(menuButton).toHaveAttribute(
                    "aria-expanded", "false"
                );

                // Verify the navigation link is hidden again
                await expect(link).toBeHidden();

            });

        }
    }







    // NAV-013: Logged-In Mobile Cart Navigation
    for (const source of loggedInPages) {

        test(`NAV-013: Open Cart and return to ${source.name} on mobile when logged in`, async ({ page }) => {

            // Set the browser to mobile dimensions
            await page.setViewportSize({
                width: 375,
                height: 812
            });

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`,
                { waitUntil: "domcontentloaded" }
            );

            const navbar = page.getByRole("navigation");

            // Open the mobile menu
            await navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            }).click();

            // Wait for the logged-in navigation to appear
            await expect(
                navbar.getByRole("link", {
                    name: "Orders",
                    exact: true
                })
            ).toBeVisible();

            // Find and click the Cart link
            const cartLink = navbar.locator('a[href="/cart"]');

            await expect(cartLink).toBeVisible();
            await cartLink.click();

            // Verify navigation reaches the Cart URL
            await expect(page).toHaveURL(
                "http://localhost:5173/cart"
            );

            // Verify the Cart interface appears
            const cartHeading = page.getByRole("heading", {
                name: "Your Cart",
                exact: true
            });

            await expect(cartHeading).toBeVisible();

            // Verify the mobile menu closed after clicking Cart
            const menuButton = navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            });

            await expect(menuButton).toBeVisible();
            await expect(menuButton).toHaveAttribute(
                "aria-expanded", "false"
            );

            // Reopen the navigation menu while viewing Cart
            await menuButton.click();

            // Verify the user remains signed in
            await expect(
                navbar.getByRole("link", {
                    name: "Orders",
                    exact: true
                })
            ).toBeVisible();

            // Navigate back to the starting page
            await navbar.getByRole("link", {
                name: source.name,
                exact: true
            }).click();

            // Verify navigation returns to the starting page
            await expect(page).toHaveURL(
                `http://localhost:5173${source.path}`
            );

            // Verify the Cart interface disappears
            await expect(cartHeading).toBeHidden();

            // Verify the mobile menu closes after returning
            await expect(menuButton).toBeVisible();
            await expect(menuButton).toHaveAttribute(
                "aria-expanded", "false"
            );

        });

    }









    // NAV-014: Logged-In Mobile Sign Out
    for (const source of loggedInPages) {

        test(`NAV-014: Sign out from ${source.name} on mobile`, async ({ page }) => {

            // Set the browser to mobile dimensions
            await page.setViewportSize({
                width: 375,
                height: 812
            });

            // Open the starting page
            await page.goto(
                `http://localhost:5173${source.path}`,
                { waitUntil: "domcontentloaded" }
            );

            const navbar = page.getByRole("navigation");

            // Open the mobile menu
            const menuButton = navbar.getByRole("button", {
                name: "Open navigation menu",
                exact: true
            });

            await menuButton.click();

            // Wait for the logged-in navigation to appear
            await expect(
                navbar.getByRole("link", {
                    name: "Orders",
                    exact: true
                })
            ).toBeVisible();

            // Find and click Sign Out
            const signOutButton = navbar.getByRole("button", {
                name: "Sign Out",
                exact: true
            });

            await expect(signOutButton).toBeVisible();
            await signOutButton.click();

            // Verify the user is redirected to Login
            await expect(page).toHaveURL(
                "http://localhost:5173/login"
            );

            // Verify the mobile menu closed
            await expect(menuButton).toBeVisible();
            await expect(menuButton).toHaveAttribute(
                "aria-expanded", "false"
            );

            // Reopen the menu to inspect the signed-out navigation
            await menuButton.click();

            // Verify Log In now appears
            await expect(
                navbar.getByRole("link", {
                    name: "Log In",
                    exact: true
                })
            ).toBeVisible();

            // Verify Orders is removed
            await expect(
                navbar.getByRole("link", {
                    name: "Orders",
                    exact: true
                })
            ).toHaveCount(0);

            // Verify the signed-in account controls are removed
            await expect(signOutButton).toHaveCount(0);

            await expect(
                navbar.getByRole("link", {
                    name: "Change Password",
                    exact: true
                })
            ).toHaveCount(0);

        });

    }



});











// ============================================================
// ADMIN NAVIGATION
// ============================================================

test.describe("King's Soap - Admin Navigation", () => {

    // Define the admin navigation links and their destinations
    const adminPages = [
        { name: "Home", path: "/admin" },
        { name: "Orders", path: "/AdminOrders" },
        { name: "Shipping", path: "/adminShipping" },
        { name: "Products", path: "/AdminProducts" },
        { name: "Inbox", path: "/AdminInbox" },
        { name: "Discounts", path: "/AdminDiscounts" }
    ];

    // Define desktop and mobile sizes and their test IDs
    const screens = [
        {
            name: "desktop",
            viewport: { width: 1440, height: 900 },
            menuId: "NAV-015",
            linksId: "NAV-016",
            signOutId: "NAV-019"
        },
        {
            name: "mobile",
            viewport: { width: 375, height: 812 },
            menuId: "NAV-017",
            linksId: "NAV-018",
            signOutId: "NAV-020"
        }
    ];

    // Keep JavaScript errors separate for each browser page
    const pageErrors = new WeakMap();

    test.beforeEach(async ({ page }) => {

        // Record uncaught JavaScript errors during the test
        const errors = [];
        pageErrors.set(page, errors);

        page.on("pageerror", error => {
            errors.push(error.message);
        });



        // Read the admin test account credentials
        const email = process.env.PW_ADMIN_EMAIL;
        const password = process.env.PW_ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error(
                "Set PW_ADMIN_EMAIL and PW_ADMIN_PASSWORD before running admin tests."
            );
        }

        // Use desktop dimensions while signing in
        await page.setViewportSize({
            width: 1440,
            height: 900
        });

        // Open the login page
        await page.goto("http://localhost:5173/login", {
            waitUntil: "domcontentloaded"
        });

        // Enter the admin account credentials
        await page.getByPlaceholder("Email Address", {
            exact: true
        }).fill(email);

        await page.getByPlaceholder("Password", {
            exact: true
        }).fill(password);

        // Submit the form and capture the login response
        const [loginResponse] = await Promise.all([
            page.waitForResponse(
                response =>
                    response.url().includes("/auth/v1/token") &&
                    response.request().method() === "POST",
                { timeout: 15000 }
            ),

            page.getByRole("button", {
                name: "Log In",
                exact: true
            }).click()
        ]);

        // Report the authentication error if login was rejected
        if (!loginResponse.ok()) {
            const data = await loginResponse.json();

            const message =
                data.error_description ||
                data.msg ||
                data.message ||
                data.error_code ||
                "Unknown authentication error";

            throw new Error(
                `Admin login failed (${loginResponse.status()}): ${message}`
            );
        }

        // Verify successful login reaches the admin Home page
        await expect(page).toHaveURL(/\/admin\/?$/i);

        // Wait for the admin header to appear
        await expect(
            page.getByRole("button", {
                name: "Open admin menu",
                exact: true
            })
        ).toBeVisible();

    });

    test.afterEach(async ({ page }) => {

        // Fail if the page produced an uncaught JavaScript error
        expect(
            pageErrors.get(page) || [],
            "Unexpected JavaScript errors"
        ).toEqual([]);

    });


       // Reach the starting page through the admin navigation
    async function visitAdminPage(page, source, screen) {

        await page.setViewportSize(screen.viewport);

        const currentPath =
            new URL(page.url()).pathname.toLowerCase();

        // Navigate only if we are not already on the starting page
        if (currentPath !== source.path.toLowerCase()) {

            const menu = await openAdminMenu(page);

            await menu.locator(
                `a[href="${source.path}"]`
            ).click();

        }

        // Verify the correct starting page is open
        await expect(page).toHaveURL(url =>
            url.origin === "http://localhost:5173" &&
            url.pathname.toLowerCase() ===
                source.path.toLowerCase()
        );

        // Verify the admin menu is available and closed
        const menuButton = page.getByRole("button", {
            name: "Open admin menu",
            exact: true
        });

        await expect(menuButton).toBeVisible();

        await expect(menuButton).toHaveAttribute(
            "aria-expanded", "false"
        );

    }

    // Open the admin menu and return its navigation element
    async function openAdminMenu(page) {

        await page.getByRole("button", {
            name: "Open admin menu",
            exact: true
        }).click();

        const menu = page.getByRole("navigation", {
            name: "Admin navigation",
            exact: true
        });

        await expect(menu).toBeVisible();

        await expect(
            page.getByRole("button", {
                name: "Close admin menu",
                exact: true
            })
        ).toHaveAttribute("aria-expanded", "true");

        return menu;

    }

    // Create desktop and mobile tests
    for (const screen of screens) {

        // Start the tests from each admin page
        for (const source of adminPages) {






            // NAV-015 / NAV-017: Admin Menu Display (For both desktop and mobile)
            test(`${screen.menuId}: Admin menu opens and closes on ${source.name} on ${screen.name}`, async ({ page }) => {

                await visitAdminPage(page, source, screen);

                const openButton = page.getByRole("button", {
                    name: "Open admin menu",
                    exact: true
                });

                // Verify the menu is initially closed
                await expect(openButton).toHaveAttribute(
                    "aria-expanded", "false"
                );

                await expect(
                    page.getByRole("navigation", {
                        name: "Admin navigation",
                        exact: true
                    })
                ).toHaveCount(0);

                // Open the admin menu
                const menu = await openAdminMenu(page);

                // Verify every admin link is visible and labeled
                for (const destination of adminPages) {

                    // Use href because Inbox may include an unread badge
                    const link = menu.locator(
                        `a[href="${destination.path}"]`
                    );

                    await expect(link).toBeVisible();
                    await expect(link).toContainText(
                        destination.name
                    );

                }

                // Verify Sign Out is available
                await expect(
                    menu.getByRole("button", {
                        name: "Sign Out",
                        exact: true
                    })
                ).toBeVisible();

                // Close the menu
                await page.getByRole("button", {
                    name: "Close admin menu",
                    exact: true
                }).click();

                // Verify the menu is removed and the button resets
                await expect(menu).toHaveCount(0);
                await expect(openButton).toBeVisible();

                await expect(openButton).toHaveAttribute(
                    "aria-expanded", "false"
                );

            });






            // NAV-016 / NAV-018: Admin Navigation Links (For both desktop and mobile)
            for (const destination of adminPages) {

                test(`${screen.linksId}: ${source.name} → ${destination.name} on ${screen.name} as admin`, async ({ page }) => {

                    await visitAdminPage(page, source, screen);

                    // Open the admin menu
                    const menu = await openAdminMenu(page);

                    // Find the destination link by its route
                    const link = menu.locator(
                        `a[href="${destination.path}"]`
                    );

                    await expect(link).toBeVisible();
                    await expect(link).toContainText(
                        destination.name
                    );

                    // Click the link
                    await link.click();

                    // Verify navigation reaches the expected URL
                    await expect(page).toHaveURL(
                        `http://localhost:5173${destination.path}`
                    );

                    // Verify the destination displays an admin header
                    const menuButton = page.getByRole("button", {
                        name: "Open admin menu",
                        exact: true
                    });

                    await expect(menuButton).toBeVisible();

                    // Verify the menu closes after navigation
                    await expect(menuButton).toHaveAttribute(
                        "aria-expanded", "false"
                    );

                    await expect(
                        page.getByRole("navigation", {
                            name: "Admin navigation",
                            exact: true
                        })
                    ).toHaveCount(0);

                });

            }








            // NAV-019 / NAV-020: Admin Sign Out (For both desktop and mobile)
            test(`${screen.signOutId}: Sign out from admin ${source.name} on ${screen.name}`, async ({ page }) => {

                await visitAdminPage(page, source, screen);

                // Open the admin menu
                const menu = await openAdminMenu(page);

                // Find and click Sign Out
                const signOutButton = menu.getByRole("button", {
                    name: "Sign Out",
                    exact: true
                });

                await expect(signOutButton).toBeVisible();
                await signOutButton.click();

                // Verify navigation reaches Login
                await expect(page).toHaveURL(
                    "http://localhost:5173/login",
                     { timeout: 15000 }
                );

                // Verify the admin menu and controls are removed
                await expect(menu).toHaveCount(0);

                await expect(
                    page.getByRole("button", {
                        name: "Open admin menu",
                        exact: true
                    })
                ).toHaveCount(0);

                await expect(
                    page.getByRole("button", {
                        name: "Close admin menu",
                        exact: true
                    })
                ).toHaveCount(0);

                // Open the public navigation menu on mobile
                if (screen.name === "mobile") {
                    await page.getByRole("button", {
                        name: "Open navigation menu",
                        exact: true
                    }).click();
                }

                const navbar = page.getByRole("navigation");

                // Verify the signed-out Log In link appears
                await expect(
                    navbar.getByRole("link", {
                        name: "Log In",
                        exact: true
                    })
                ).toBeVisible();

                // Verify signed-in user controls are removed
                await expect(
                    navbar.getByRole("link", {
                        name: "Orders",
                        exact: true
                    })
                ).toHaveCount(0);

                await expect(
                    navbar.getByRole("button", {
                        name: "Account menu",
                        exact: true
                    })
                ).toHaveCount(0);

                await expect(
                    navbar.getByRole("button", {
                        name: "Sign Out",
                        exact: true
                    })
                ).toHaveCount(0);

            });

        }
    }

});







