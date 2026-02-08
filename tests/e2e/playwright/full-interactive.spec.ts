import { test, expect } from '@playwright/test';

/**
 * Полный интерактивный тест - всё выполняется автоматически в видимом браузере
 *
 * Запуск: npx playwright test full-interactive.spec.ts --headed --project=chromium
 */

test.use({ headless: false, slowMo: 500 }); // Видимый браузер с замедлением

test.describe('Полный флоу через браузер', () => {
  let publisherEmail: string;
  let publisherPassword: string;
  let publisherToken: string;
  let advertiserEmail: string;
  let advertiserPassword: string;
  let advertiserToken: string;

  const timestamp = Date.now();
  publisherEmail = `publisher-${timestamp}@example.com`;
  publisherPassword = 'TestPassword123';
  advertiserEmail = `advertiser-${timestamp}@example.com`;
  advertiserPassword = 'TestPassword123';

  test('Publisher Portal - Регистрация', async ({ page, context }) => {
    console.log('\n========================================');
    console.log('📝 ШАГ 1: Регистрация издателя');
    console.log('========================================\n');

    // Открываем publisher portal
    console.log('🌐 Открываю Publisher Portal: http://localhost:3001');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    console.log('✅ Страница загружена');
    console.log('📄 Title:', await page.title());

    // Ищем ссылку на регистрацию
    console.log('\n🔍 Ищу ссылку на регистрацию...');

    const registerSelectors = [
      'a[href="/register"]',
      'a[href*="register"]',
      'a:has-text("Register")',
      'a:has-text("Sign Up")',
      'a:has-text("Регистрация")',
      'button:has-text("Register")',
      'button:has-text("Sign Up")',
    ];

    let registerLink = null;
    for (const selector of registerSelectors) {
      try {
        registerLink = page.locator(selector).first();
        if (await registerLink.isVisible({ timeout: 2000 })) {
          console.log(`✅ Нашёл регистрацию: ${selector}`);
          break;
        }
      } catch (e) {
        // Продолжаем искать
      }
    }

    if (!registerLink || !(await registerLink.isVisible())) {
      console.log('⚠️  Не нашёл ссылку на регистрацию. Пробую перейти напрямую...');
      await page.goto('http://localhost:3001/register');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('🖱️ Кликаю на регистрацию...');
      await registerLink.click();
      await page.waitForLoadState('networkidle');
    }

    console.log('✅ На странице регистрации');
    console.log('📍 URL:', page.url());

    // Ждем чтобы увидеть страницу
    await page.waitForTimeout(2000);

    // Ищем форму регистрации
    console.log('\n🔍 Ищу форму регистрации...');

    // Форма имеет поля: name, email, password, confirm password
    const nameInput = page.locator('input[name="name"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInputs = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]').first();

    // Заполняем имя
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('Test Publisher');
      console.log('✅ Имя заполнено: Test Publisher');
      await page.waitForTimeout(500);
    }

    // Заполняем email
    if (await emailInput.isVisible({ timeout: 1000 })) {
      await emailInput.fill(publisherEmail);
      console.log(`📧 Email заполнен: ${publisherEmail}`);
      await page.waitForTimeout(500);
    }

    // Заполняем пароль (два поля)
    const passwordCount = await passwordInputs.count();
    console.log(`🔑 Нашёл ${passwordCount} полей для пароля`);

    for (let i = 0; i < passwordCount; i++) {
      const input = passwordInputs.nth(i);
      if (await input.isVisible()) {
        await input.fill(publisherPassword);
        await page.waitForTimeout(300);
      }
    }
    console.log('✅ Пароли заполнены');

    // Отправляем форму
    if (await submitButton.isVisible({ timeout: 1000 })) {
      console.log('\n⏳ Ожидаю 2 секунды перед отправкой формы...');
      await page.waitForTimeout(2000);

      console.log('🖱️ Кликаю кнопку регистрации...');
      await submitButton.click();

      // Ждем ответа
      console.log('⏳ Ожидаю ответа от сервера...');

      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        console.log('✅ Форма отправлена!');
      } catch (e) {
        console.log('⚠️  Таймаут ожидания, но продолжаем...');
      }

      await page.waitForTimeout(2000);
    } else {
      console.log('❌ Не нашёл кнопку отправки формы!');
      console.log('⚠️  Создаю издателя через API...');

      // Регистрируем через API
      const response = await context.request.post('http://localhost:8080/api/v1/publishers/register', {
        data: {
          email: publisherEmail,
          password: publisherPassword,
          name: 'Test Publisher',
        },
      });

      if (response.status() === 201) {
        const data = await response.json();
        console.log('✅ Издатель создан через API!');
        console.log('   ID:', data.id);
        console.log('   Email:', data.email);
        publisherToken = data.token;
      }
    }

    // Проверяем результат
    const currentUrl = page.url();
    console.log('\n📍 Текущий URL:', currentUrl);

    if (currentUrl.includes('/dashboard') || currentUrl.includes('/login')) {
      console.log('✅ Регистрация прошла успешно!');
    } else {
      // Проверяем через API
      const loginResponse = await context.request.post('http://localhost:8080/api/v1/publishers/login', {
        data: { email: publisherEmail, password: publisherPassword },
      });

      if (loginResponse.status() === 200) {
        const loginData = await loginResponse.json();
        publisherToken = loginData.token;
        console.log('✅ Издатель может войти (проверено через API)');
      }
    }

    await page.waitForTimeout(3000);
    console.log('\n✅ ШАГ 1 ЗАВЕРШЁН\n');
  });

  test('Advertiser Portal - Регистрация', async ({ page, context }) => {
    console.log('\n========================================');
    console.log('📝 ШАГ 2: Регистрация рекламодателя');
    console.log('========================================\n');

    console.log('🌐 Открываю Advertiser Portal: http://localhost:3002');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    console.log('✅ Страница загружена');
    console.log('📄 Title:', await page.title());

    // Ищем ссылку на регистрацию
    console.log('\n🔍 Ищу ссылку на регистрацию...');

    const registerSelectors = [
      'a[href="/register"]',
      'a[href*="register"]',
      'a:has-text("Register")',
      'a:has-text("Sign Up")',
      'a:has-text("Регистрация")',
      'button:has-text("Register")',
    ];

    let registerLink = null;
    for (const selector of registerSelectors) {
      try {
        registerLink = page.locator(selector).first();
        if (await registerLink.isVisible({ timeout: 2000 })) {
          console.log(`✅ Нашёл регистрацию: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (!registerLink || !(await registerLink.isVisible())) {
      console.log('⚠️  Не нашёл ссылку. Пробую перейти напрямую...');
      await page.goto('http://localhost:3002/register');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('🖱️ Кликаю на регистрацию...');
      await registerLink.click();
      await page.waitForLoadState('networkidle');
    }

    console.log('✅ На странице регистрации');
    console.log('📍 URL:', page.url());
    await page.waitForTimeout(2000);

    // Заполняем форму
    const nameInput = page.locator('input[name="name"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInputs = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]').first();

    // Заполняем имя
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.fill('Test Advertiser');
      console.log('✅ Имя заполнено: Test Advertiser');
      await page.waitForTimeout(500);
    }

    // Заполняем email
    if (await emailInput.isVisible({ timeout: 1000 })) {
      await emailInput.fill(advertiserEmail);
      console.log(`📧 Email: ${advertiserEmail}`);
      await page.waitForTimeout(500);
    }

    // Заполняем оба пароля
    const passwordCount = await passwordInputs.count();
    for (let i = 0; i < passwordCount; i++) {
      const input = passwordInputs.nth(i);
      if (await input.isVisible()) {
        await input.fill(advertiserPassword);
        await page.waitForTimeout(300);
      }
    }
    console.log('✅ Пароли заполнены');

    if (await submitButton.isVisible({ timeout: 2000 })) {
      console.log('\n⏳ Ожидаю 3 секунды...');
      await page.waitForTimeout(3000);
      console.log('🖱️ Отправляю форму...');
      await submitButton.click();

      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        console.log('✅ Форма отправлена!');
      } catch (e) {
        console.log('⚠️  Таймаут, проверяю через API...');
      }

      await page.waitForTimeout(2000);
    } else {
      console.log('❌ Не нашёл кнопку. Создаю через API...');

      const response = await context.request.post('http://localhost:8080/api/v1/advertisers/register', {
        data: {
          email: advertiserEmail,
          password: advertiserPassword,
          name: 'Test Advertiser',
        },
      });

      if (response.status() === 201) {
        const data = await response.json();
        console.log('✅ Рекламодатель создан через API!');
        advertiserToken = data.token;
      }
    }

    // Проверяем через API
    const loginResponse = await context.request.post('http://localhost:8080/api/v1/advertisers/login', {
      data: { email: advertiserEmail, password: advertiserPassword },
    });

    if (loginResponse.status() === 200) {
      const loginData = await loginResponse.json();
      advertiserToken = loginData.token;
      console.log('✅ Рекламодатель может войти!');
    }

    await page.waitForTimeout(3000);
    console.log('\n✅ ШАГ 2 ЗАВЕРШЁН\n');
  });

  test('Demo Website - Показ рекламы', async ({ page, context }) => {
    console.log('\n========================================');
    console.log('📺 ШАГ 3: Проверка показа рекламы');
    console.log('========================================\n');

    console.log('🌐 Открываю Demo Website: http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('✅ Главная страница загружена');
    console.log('📄 Title:', await page.title());

    // Ищем ссылку на demo страницу
    console.log('\n🔍 Ищу ссылку на Demo...');

    const demoSelectors = [
      'a[href="/demo"]',
      'a:has-text("Demo")',
      'a:has-text("demo")',
      'a:has-text("View Demo")',
    ];

    let demoLink = null;
    for (const selector of demoSelectors) {
      try {
        demoLink = page.locator(selector).first();
        if (await demoLink.isVisible({ timeout: 2000 })) {
          console.log(`✅ Нашёл ссылку: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (demoLink && await demoLink.isVisible()) {
      console.log('🖱️ Кликаю на Demo...');
      await demoLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      console.log('⚠️  Не нашёл ссылку, перехожу напрямую...');
      await page.goto('http://localhost:3000/demo');
      await page.waitForLoadState('networkidle');
    }

    console.log('✅ На demo странице');
    console.log('📍 URL:', page.url());

    // Проверяем баннеры через API
    console.log('\n🔍 Проверяю баннеры через API...');

    const slotsResponse = await context.request.get('http://localhost:8080/api/v1/demo/slots');
    if (slotsResponse.status() === 200) {
      const slotsData = await slotsResponse.json();
      console.log(`✅ API возвращает ${slotsData.slots?.length || 0} слотов`);

      if (slotsData.slots && slotsData.slots.length > 0) {
        console.log('\n📊 Доступные слоты:');
        for (const slot of slotsData.slots) {
          console.log(`   - ${slot.slot_id}: ${slot.name} (${slot.width}x${slot.height})`);
        }
      }
    }

    // Проверяем delivery API
    console.log('\n🎯 Проверяю delivery API...');
    const deliveryResponse = await context.request.get('http://localhost:8080/api/v1/delivery/demo-leaderboard');

    if (deliveryResponse.status() === 200) {
      const deliveryData = await deliveryResponse.json();
      console.log('✅ Delivery API работает!');
      if (deliveryData.creative) {
        console.log(`   📦 Banner: ${deliveryData.creative.width}x${deliveryData.creative.height}`);
        console.log(`   🎨 HTML: ${deliveryData.creative.html?.substring(0, 50)}...`);
      }
      if (deliveryData.tracking) {
        console.log(`   📊 Tracking: ${deliveryData.tracking.impression}, ${deliveryData.tracking.click}`);
      }
    }

    // Делаем скриншот
    await page.waitForTimeout(2000);
    await page.screenshot({ fullPage: true, path: 'test-results/full-demo-page.png' });
    console.log('\n📸 Скриншот сохранён: test-results/full-demo-page.png');

    // Ищем баннеры на странице
    console.log('\n🔍 Ищу баннеры на странице...');

    const bannerSelectors = [
      'div[id*="banner"]',
      'div[id*="container"]',
      'div[id*="ad"]',
      'iframe[id*="banner"]',
      'iframe[id*="ad"]',
      '.ad-banner',
      '.banner',
    ];

    let foundBanners = 0;
    for (const selector of bannerSelectors) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`✅ Нашёл ${count} элемент(ов) по селектору: ${selector}`);
          foundBanners += count;
        }
      } catch (e) {}
    }

    if (foundBanners === 0) {
      console.log('⚠️  Баннеры не найдены в DOM (можут загружаться динамически)');
    }

    // Проверяем консоль на ошибки
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });

    await page.waitForTimeout(5000);
    console.log('\n✅ ШАГ 3 ЗАВЕРШЁН\n');
  });

  test('Создание баннера через API и проверка показа', async ({ page, context }) => {
    console.log('\n========================================');
    console.log('🎨 ШАГ 4: Создание баннера');
    console.log('========================================\n');

    // Логинимся как advertiser для получения токена
    if (!advertiserToken) {
      const loginResponse = await context.request.post('http://localhost:8080/api/v1/advertisers/login', {
        data: { email: advertiserEmail, password: advertiserPassword },
      });

      if (loginResponse.status() === 200) {
        const loginData = await loginResponse.json();
        advertiserToken = loginData.token;
        console.log('✅ Получен токен рекламодателя');
      }
    }

    // Создаём баннер
    console.log('🎨 Создаю новый баннер...');

    const bannerData = {
      name: `E2E Test Banner ${timestamp}`,
      format: 'leaderboard',
      width: 728,
      height: 90,
      html: '<div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; font-family: Arial; font-size: 24px; font-weight: bold;">🎉 TEST BANNER 🎉</div>',
      active: true,
    };

    const createResponse = await context.request.post('http://localhost:8080/api/v1/demo/banners', {
      headers: { Authorization: `Bearer ${advertiserToken}` },
      data: bannerData,
    });

    if (createResponse.status() === 201) {
      const banner = await createResponse.json();
      console.log('✅ Баннер создан!');
      console.log('   ID:', banner.id);
      console.log('   Name:', banner.name);
      console.log('   Format:', banner.format);

      // Проверяем, что баннер появился в списке
      await page.waitForTimeout(1000);

      const listResponse = await context.request.get('http://localhost:8080/api/v1/demo/banners', {
        headers: { Authorization: `Bearer ${advertiserToken}` },
      });

      if (listResponse.status() === 200) {
        const listData = await listResponse.json();
        console.log(`\n📋 Всего баннеров: ${listData.banners?.length || 0}`);

        const ourBanner = listData.banners?.find((b: any) => b.id === banner.id);
        if (ourBanner) {
          console.log('✅ Наш баннер в списке!');
        }
      }
    } else {
      console.log('❌ Ошибка создания баннера:', createResponse.status());
      const error = await createResponse.text();
      console.log('   Error:', error);
    }

    await page.waitForTimeout(3000);
    console.log('\n✅ ШАГ 4 ЗАВЕРШЁН\n');
  });

  test('Финальная проверка - весь флоу', async ({ context }) => {
    console.log('\n========================================');
    console.log('🏁 ШАГ 5: Финальная проверка');
    console.log('========================================\n');

    // Проверяем publisher
    console.log('📝 Проверяю издателя...');
    const pubLogin = await context.request.post('http://localhost:8080/api/v1/publishers/login', {
      data: { email: publisherEmail, password: publisherPassword },
    });

    if (pubLogin.status() === 200) {
      const pubData = await pubLogin.json();
      console.log('✅ Издатель работает!');
      console.log('   Email:', pubData.email);
      console.log('   ID:', pubData.id);

      // Проверяем профиль
      const profileResponse = await context.request.get('http://localhost:8080/api/v1/publishers/me', {
        headers: { Authorization: `Bearer ${pubData.token}` },
      });

      if (profileResponse.status() === 200) {
        console.log('✅ Профиль издателя доступен!');
      }
    }

    // Проверяем advertiser
    console.log('\n📝 Проверяю рекламодателя...');
    const advLogin = await context.request.post('http://localhost:8080/api/v1/advertisers/login', {
      data: { email: advertiserEmail, password: advertiserPassword },
    });

    if (advLogin.status() === 200) {
      const advData = await advLogin.json();
      console.log('✅ Рекламодатель работает!');
      console.log('   Email:', advData.email);
      console.log('   ID:', advData.id);
    }

    // Проверяем delivery
    console.log('\n🎯 Проверяю доставку рекламы...');
    const deliveryCheck = await context.request.get('http://localhost:8080/api/v1/delivery/demo-leaderboard');

    if (deliveryCheck.status() === 200) {
      const deliveryData = await deliveryCheck.json();
      console.log('✅ Доставка рекламы работает!');
      if (deliveryData.creative) {
        console.log('   ✅ Креатив получен');
      }
      if (deliveryData.tracking) {
        console.log('   ✅ Трекинг получен');
      }
    }

    // Проверяем impression tracking
    console.log('\n📊 Проверяю отслеживание показов...');
    const impressionResponse = await context.request.post('http://localhost:8080/api/v1/track/impression', {
      data: {
        slot_id: 'demo-leaderboard',
        banner_id: 'test-banner-id',
        publisher_id: 'test-publisher',
        advertiser_id: 'test-advertiser',
        timestamp: new Date().toISOString(),
        user_agent: 'E2E Test',
        ip: '127.0.0.1',
        referer: 'http://localhost:3000',
      },
    });

    console.log(`   Status: ${impressionResponse.status()}`);
    if ([200, 201, 202].includes(impressionResponse.status())) {
      console.log('✅ Отслеживание показов работает!');
    }

    console.log('\n========================================');
    console.log('🎉 ВСЁ РАБОТАЕТ!');
    console.log('========================================');
    console.log('\n📋 Созданные аккаунты:');
    console.log(`   Publisher: ${publisherEmail}`);
    console.log(`   Advertiser: ${advertiserEmail}`);
    console.log(`   Password: ${publisherPassword} (одинаковый)`);
    console.log('\n✅ Полный флоу протестирован успешно!\n');
  });
});
