import { test as base, type Page } from '@playwright/test';

export const test = base.extend<{
  loggedInPage: Page;
}>({
  loggedInPage: async ({ page }, use) => {
    // Login as advertiser before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'advertiser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});
