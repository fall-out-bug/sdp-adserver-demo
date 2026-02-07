import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('displays campaigns list', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Мои кампании')).toBeVisible();
  });

  test('shows create campaign button', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Создать кампанию')).toBeVisible();
  });

  test('navigates to campaign creation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Создать кампанию');
    await expect(page).toHaveURL('/campaigns/new');
  });
});
