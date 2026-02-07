import { test, expect } from '@playwright/test';

test.describe('Campaign Detail', () => {
  test('displays campaign details', async ({ page }) => {
    await page.goto('/campaigns/test-campaign-1');

    await expect(page.getByText('Spring Sale 2026')).toBeVisible();
    await expect(page.getByText('Тренд показов и кликов')).toBeVisible();
  });

  test('shows performance metrics', async ({ page }) => {
    await page.goto('/campaigns/test-campaign-1');

    await expect(page.getByText('Показы')).toBeVisible();
    await expect(page.getByText('Клики')).toBeVisible();
    await expect(page.getByText('CTR')).toBeVisible();
  });
});
