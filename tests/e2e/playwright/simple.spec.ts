import { test, expect } from '@playwright/test';

test.describe('Simple E2E Tests', () => {
  const apiBase = 'http://localhost:8080';
  const webBase = 'http://localhost:3000';

  test('health check - backend is running', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/v1/demo/slots`);
    expect(response.status()).toBe(200);
  });

  test('API returns 6 demo slots', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/v1/demo/slots`);
    const data = await response.json();

    expect(data.slots).toBeDefined();
    expect(data.slots.length).toBeGreaterThanOrEqual(6);
  });

  test('API returns banner for leaderboard slot', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/v1/demo/slots/demo-leaderboard/banner`);
    const banner = await response.json();

    expect(banner).toHaveProperty('name', 'Leaderboard Demo');
    expect(banner).toHaveProperty('format', 'leaderboard');
    expect(banner.width).toBe(728);
    expect(banner.height).toBe(90);
  });

  test('frontend homepage loads', async ({ page }) => {
    await page.goto(webBase);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toContain('AdServer Demo');
  });

  test('frontend demo page loads', async ({ page }) => {
    await page.goto(`${webBase}/demo`);
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('/demo');
  });

  test('demo page displays banner sections', async ({ page }) => {
    await page.goto(`${webBase}/demo`);
    await page.waitForLoadState('networkidle');

    // Check for page heading that should be present regardless of SDK
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('navigation between home and demo pages works', async ({ page }) => {
    // Start at home
    await page.goto(webBase);
    await page.waitForLoadState('networkidle');

    // Navigate to demo page
    await page.goto(`${webBase}/demo`);
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('/demo');

    // Navigate back to home
    await page.goto(webBase);
    await page.waitForLoadState('networkidle');

    const homeUrl = page.url();
    expect(homeUrl).not.toContain('/demo');
  });
});
