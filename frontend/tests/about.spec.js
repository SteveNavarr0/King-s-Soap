
import { test, expect } from '@playwright/test';

test.describe('Kings Soap About Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/about');
  });

  // ==================================================
  // DT-674: ABOUT US SECTION
  // ==================================================

  // AB001: Verify About Us heading is visible and centered
  test('AB001: About Us section is visible and centered', async ({ page }) => {

    const aboutUs = page.getByRole('heading', { name: 'About Us' });

    await expect(aboutUs).toBeVisible();
    await expect(aboutUs).toHaveCSS('text-align', 'center');

  });

  // AB002: Verify soap image loads successfully
  test('AB002: Soap image loads successfully', async ({ page }) => {

    const soapImage = page.locator('img').first();

    await expect(soapImage).toBeVisible();
    await expect(soapImage).toHaveJSProperty('complete', true);

    const imageLoaded = await soapImage.evaluate(
      img => img.naturalWidth > 0
    );

    expect(imageLoaded).toBe(true);

  });


  // ==================================================
  // DT-675: ABOUT ANITA KING SECTION
  // ==================================================

  // AB003: Verify About Anita King heading is centered
  test('AB003: About Anita King section is visible and centered', async ({ page }) => {

    const aboutAnita = page.getByRole('heading', { name: 'About Anita King' });

    await expect(aboutAnita).toBeVisible();
    await expect(aboutAnita).toHaveCSS('text-align', 'center');

  });

    // AB004: Verify soap video loads
    test('AB004: Soap video loads and plays successfully', async ({ page }) => {

    const soapVideo = page.locator('video').first();

    // Verify video is visible
    await expect(soapVideo).toBeVisible();

    // Verify video data loads
    await expect.poll(async () => {
        return soapVideo.evaluate(video => video.readyState);
    }).toBeGreaterThanOrEqual(2);

    // Verify video settings
    await expect(soapVideo).toHaveJSProperty('autoplay', true);
    await expect(soapVideo).toHaveJSProperty('muted', true);
    await expect(soapVideo).toHaveJSProperty('loop', true);

    // Explicitly start playback
    await soapVideo.evaluate(async video => {
        await video.play();
    });

    // Verify video is playing
    await expect.poll(async () => {
        return soapVideo.evaluate(video => !video.paused);
    }).toBe(true);

    // Verify playback time advances
    const initialTime = await soapVideo.evaluate(video => video.currentTime);

    await expect.poll(async () => {
        return soapVideo.evaluate(video => video.currentTime);
    }).toBeGreaterThan(initialTime);

    });



  // ==================================================
  // DT-678: CONTACT ME SECTION
  // ==================================================

  // AB005: Verify Contact Me section displays
  test('AB005: Contact Me section displays correctly', async ({ page }) => {

    const contactHeading = page.getByRole('heading', { name: 'Contact Me' });

    await expect(contactHeading).toBeVisible();
    await expect(contactHeading).toHaveCSS('text-align', 'center');

    await expect(
      page.getByRole('button', { name: 'Email' })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Instagram' })
    ).toBeVisible();

  });

    // AB006: Verify Email button opens and closes contact form
    test('AB006: Email button opens and closes contact form', async ({ page }) => {

    // Open contact form
    await page.getByRole('button', { name: 'Email', exact: true }).click();

    // Verify contact form opened
    const sendButton = page.getByRole('button', { name: 'Send Message' });

    await expect(sendButton).toBeVisible();

    // Close contact form
    await page.getByRole('button', { name: '×' }).click();

    // Verify contact form closed
    await expect(sendButton).not.toBeVisible();

    });



  // AB007: Verify Instagram link
  test('AB007: Instagram button links to correct Instagram page', async ({ page }) => {

    const instagram = page.getByRole('link', { name: 'Instagram' });

    await expect(instagram).toHaveAttribute(
      'href',
      'https://instagram.com/kingssoap'
    );

    await expect(instagram).toHaveAttribute('target', '_blank');

  });


  // ==================================================
  // DT-678: CONTACT FORM VALIDATION
  // ==================================================

  // AB008: Verify name is required
  test('AB008: Contact form requires a name', async ({ page }) => {

    await page.getByRole('button', { name: 'Email', exact: true }).click();

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Please enter your name')
    ).toBeVisible();

  });

  // AB009: Verify email validation
  test('AB009: Contact form requires a valid email', async ({ page }) => {

    await page.getByRole('button', { name: 'Email', exact: true }).click();

    const inputs = page.locator('input');

    await inputs.nth(0).fill('Test User');
    await inputs.nth(1).fill('invalid-email');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Please enter a valid email address')
    ).toBeVisible();

  });

  // AB010: Verify subject is required
  test('AB010: Contact form requires a subject', async ({ page }) => {

    await page.getByRole('button', { name: 'Email', exact: true }).click();

    const inputs = page.locator('input');

    await inputs.nth(0).fill('Test User');
    await inputs.nth(1).fill('test@example.com');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Please enter a subject field')
    ).toBeVisible();

  });

  // AB011: Verify message is required
  test('AB011: Contact form requires a message', async ({ page }) => {

    await page.getByRole('button', { name: 'Email', exact: true }).click();

    const inputs = page.locator('input');

    await inputs.nth(0).fill('Test User');
    await inputs.nth(1).fill('test@example.com');
    await inputs.nth(2).fill('Test Subject');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Please enter a message')
    ).toBeVisible();

  });


  // ==================================================
  // DT-678: CONTACT FORM SUBMISSION
  // ==================================================

  // AB012: Verify successful message submission
  test('AB012: Contact form sends message successfully', async ({ page }) => {

    await page.route('http://localhost:3000/api/messages', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Message sent successfully' })
      });
    });

    await page.getByRole('button', { name: 'Email', exact: true }).click();

    const inputs = page.locator('input');

    await inputs.nth(0).fill('Test User');
    await inputs.nth(1).fill('test@example.com');
    await inputs.nth(2).fill('Test Subject');

    await page.locator('textarea').fill('This is a test message.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Message sent successfully!')
    ).toBeVisible();

  });

  // AB013: Verify backend error handling
  test('AB013: Contact form handles backend errors', async ({ page }) => {

    await page.route('http://localhost:3000/api/messages', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Failed to send message' })
      });
    });

    await page.getByRole('button', { name: 'Email', exact: true }).click();

    const inputs = page.locator('input');

    await inputs.nth(0).fill('Test User');
    await inputs.nth(1).fill('test@example.com');
    await inputs.nth(2).fill('Test Subject');

    await page.locator('textarea').fill('This is a test message.');

    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(
      page.getByText('Failed to send message')
    ).toBeVisible();

  });

});
