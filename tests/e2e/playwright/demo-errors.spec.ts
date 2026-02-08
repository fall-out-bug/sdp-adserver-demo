import { test, expect } from '@playwright/test';

/**
 * Тест для проверки ошибок на демо-странице
 */
test.use({ headless: false, slowMo: 1000 });

test.describe('Demo Website - Проверка ошибок', () => {
  test('проверить консоль на ошибки', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      }
    });

    page.on('pageerror', (err) => {
      console.log('❌ Page Error:', err.message);
      errors.push(err.message);
    });

    page.on('requestfailed', (request) => {
      console.log('❌ Request Failed:', request.url(), request.failure()?.errorText);
    });

    console.log('🌐 Открываю Demo Website...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✅ Главная загружена');

    console.log('🔗 Перехожу на /demo...');
    await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle' });
    console.log('✅ Demo страница загружена');

    // Wait for SDK to load banners (increase timeout)
    await page.waitForTimeout(10000);

    console.log('\n📊 Результаты:');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    console.log('Ошибки консоли:', errors.length);

    if (errors.length > 0) {
      console.log('\n❌ Найденные ошибки:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('\n✅ Ошибок не найдено!');
    }

    // Проверяем контейнеры баннеров
    const containers = page.locator('[id^="container-demo"]');
    const count = await containers.count();
    console.log(`\n📦 Найдено контейнеров: ${count}`);

    for (let i = 0; i < count; i++) {
      const container = containers.nth(i);
      const id = await container.getAttribute('id');
      const content = await container.innerHTML();
      const hasError = content.includes('Error') || content.includes('Failed');
      const hasLoading = content.includes('Loading');

      console.log(`  ${id}: ${hasError ? '❌ ERROR' : hasLoading ? '⏳ Loading' : '✅ OK'}`);
      if (content.length > 0 && !hasLoading) {
        console.log(`     Содержимое: ${content.substring(0, 100)}...`);
      }
    }

    // Делаем скриншот
    await page.screenshot({ path: 'test-results/demo-with-errors.png', fullPage: true });
    console.log('\n📸 Скриншот: test-results/demo-with-errors.png');
  });

  test('проверить работу SDK напрямую', async ({ page }) => {
    console.log('🧪 Тестирую SDK напрямую...');

    // Добавляем обработчик ошибок
    const sdkErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('DemoAdSDK') || msg.text().includes('Failed')) {
        sdkErrors.push(msg.text());
        console.log('SDK:', msg.text());
      }
    });

    await page.goto('http://localhost:3000/demo');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('SDK ошибок:', sdkErrors.length);
  });
});
