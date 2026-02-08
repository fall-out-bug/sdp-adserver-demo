import { test, expect } from '@playwright/test';

test.use({ headless: false, slowMo: 500 });

test('Simple Demo Test - Проверка загрузки баннеров', async ({ page }) => {
  console.log('🌐 Открываю простую тестовую страницу...');

  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('file:///home/fall_out_bug/projects/vibe_coding/demo-adserver/demo-simple-test.html');
  console.log('✅ Страница загружена');

  // Wait for banners to load
  await page.waitForTimeout(5000);

  const status = page.locator('#status');
  const statusText = await status.textContent();
  console.log('Status:', statusText);

  // Check if banners loaded
  const leaderboard = page.locator('#container-demo-leaderboard');
  const hasContent = await leaderboard.evaluate(el => el.innerHTML.includes('🚀') || el.innerHTML.includes('AdServer'));

  console.log('Leaderboard has content:', hasContent);
  console.log('Leaderboard HTML length:', (await leaderboard.innerHTML()).length);

  // Screenshot
  await page.screenshot({ path: 'test-results/simple-demo-test.png' });
  console.log('📸 Скриншот сохранён');

  expect(hasContent).toBe(true);
});