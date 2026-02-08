import { test, expect } from '@playwright/test';

test.use({ headless: false, slowMo: 500 });

test('Demo Debug - Проверка DOM', async ({ page }) => {
  console.log('🌐 Открываю demo страницу...');

  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
    console.log('Console:', msg.text());
  });

  await page.goto('http://localhost:3000/demo');
  console.log('✅ Страница загружена');

  // Wait for React to render AND SDK to inject HTML
  await page.waitForTimeout(15000);

  // Check page content
  const content = await page.content();
  console.log('HTML length:', content.length);

  // Check for containers
  const hasLeaderboard = content.includes('container-demo-leaderboard');
  const hasMediumRect = content.includes('container-demo-medium-rect');
  const hasSkyscraper = content.includes('container-demo-skyscraper');

  console.log('container-demo-leaderboard в HTML:', hasLeaderboard);
  console.log('container-demo-medium-rect в HTML:', hasMediumRect);
  console.log('container-demo-skyscraper в HTML:', hasSkyscraper);

  // Try to find with Playwright locators
  const leaderboard = page.locator('#container-demo-leaderboard');
  const count = await leaderboard.count();
  console.log('Playwright нашёл #container-demo-leaderboard:', count);

  if (count > 0) {
    const isVisible = await leaderboard.isVisible();
    console.log('Элемент виден:', isVisible);

    const html = await leaderboard.innerHTML();
    console.log('Содержимое элемента:', html.substring(0, 200));
  }

  // Screenshot
  await page.screenshot({ path: 'test-results/demo-debug.png', fullPage: true });
  console.log('📸 Скриншот: test-results/demo-debug.png');
});
