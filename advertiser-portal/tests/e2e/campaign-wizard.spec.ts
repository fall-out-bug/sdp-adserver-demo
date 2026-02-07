import { test, expect } from '@playwright/test';

test.describe('Campaign Wizard', () => {
  test('completes 4-step wizard', async ({ page }) => {
    await page.goto('/campaigns/new');

    // Step 1: Campaign Details
    await page.fill('input[name="name"]', 'Test Campaign 2026');
    await page.click('text=Next →');

    // Step 2: Budget
    await expect(page.getByText('Бюджет и ставки')).toBeVisible();
    await page.click('text=Next →');

    // Step 3: Banners
    await expect(page.getByText('Загрузите баннеры')).toBeVisible();
    await page.click('text=Next →');

    // Step 4: Review
    await expect(page.getByText('Проверьте и запустите')).toBeVisible();
    await expect(page.getByText('Test Campaign 2026')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/campaigns/new');

    // Try to proceed without entering name
    await page.click('text=Next →');

    await expect(page.getByText('Введите название кампании')).toBeVisible();
  });
});
