import { test, expect } from '@playwright/test';

/**
 * Interactive browser tests - opens visible browser for manual verification
 *
 * Run with: npx playwright test interactive.spec.ts --headed
 */

// Configure all tests in this file to run with visible browser
test.use({ headless: false });

test.describe('Interactive Browser Tests', () => {

  test('Publisher Portal - Registration Flow', async ({ page, context }) => {
    console.log('🌐 Opening Publisher Portal...');

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    console.log('✅ Publisher Portal loaded');
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Wait for manual inspection
    await page.waitForTimeout(5000);

    // Try to find and click register link
    const registerLink = page.locator('a[href*="register"], a:has-text("Register"), a:has-text("Sign Up")').first();

    if (await registerLink.isVisible({ timeout: 3000 })) {
      console.log('📝 Found registration link, navigating...');
      await registerLink.click();
      await page.waitForLoadState('networkidle');

      console.log('✅ On registration page');
      console.log('Current URL:', page.url());

      // Fill registration form if fields exist
      const emailInput = page.locator('input[name="email"], input[type="email"], input[id*="email"]').first();
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      const companyInput = page.locator('input[name*="company"], input[name*="organization"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();

      if (await emailInput.isVisible({ timeout: 3000 })) {
        const timestamp = Date.now();
        await emailInput.fill(`test-publisher-${timestamp}@example.com`);
        console.log('📧 Email filled');

        if (await passwordInput.isVisible({ timeout: 1000 })) {
          await passwordInput.fill('TestPassword123');
          console.log('🔑 Password filled');
        }

        if (await companyInput.isVisible({ timeout: 1000 })) {
          await companyInput.fill('Test Company');
          console.log('🏢 Company filled');
        }

        if (await submitButton.isVisible({ timeout: 1000 })) {
          console.log('⚠️  Form ready. Submit manually to continue...');
          await page.waitForTimeout(10000); // Wait for manual interaction
        }
      }
    } else {
      console.log('ℹ️  No registration link found - showing current page');
      await page.screenshot({ path: 'test-results/publisher-homepage.png' });
      console.log('📸 Screenshot saved to test-results/publisher-homepage.png');
    }

    // Keep page open for inspection
    await page.waitForTimeout(5000);
  });

  test('Advertiser Portal - Registration Flow', async ({ page }) => {
    console.log('🌐 Opening Advertiser Portal...');

    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');

    console.log('✅ Advertiser Portal loaded');
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Wait for manual inspection
    await page.waitForTimeout(5000);

    // Try to find and click register link
    const registerLink = page.locator('a[href*="register"], a:has-text("Register"), a:has-text("Sign Up")').first();

    if (await registerLink.isVisible({ timeout: 3000 })) {
      console.log('📝 Found registration link, navigating...');
      await registerLink.click();
      await page.waitForLoadState('networkidle');

      console.log('✅ On registration page');
      console.log('Current URL:', page.url());

      // Fill registration form if fields exist
      const emailInput = page.locator('input[name="email"], input[type="email"], input[id*="email"]').first();
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      const companyInput = page.locator('input[name*="company"], input[name*="organization"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();

      if (await emailInput.isVisible({ timeout: 3000 })) {
        const timestamp = Date.now();
        await emailInput.fill(`test-advertiser-${timestamp}@example.com`);
        console.log('📧 Email filled');

        if (await passwordInput.isVisible({ timeout: 1000 })) {
          await passwordInput.fill('TestPassword123');
          console.log('🔑 Password filled');
        }

        if (await companyInput.isVisible({ timeout: 1000 })) {
          await companyInput.fill('Test Advertiser Company');
          console.log('🏢 Company filled');
        }

        if (await submitButton.isVisible({ timeout: 1000 })) {
          console.log('⚠️  Form ready. Submit manually to continue...');
          await page.waitForTimeout(10000); // Wait for manual interaction
        }
      }
    } else {
      console.log('ℹ️  No registration link found - showing current page');
      await page.screenshot({ path: 'test-results/advertiser-homepage.png' });
      console.log('📸 Screenshot saved to test-results/advertiser-homepage.png');
    }

    // Keep page open for inspection
    await page.waitForTimeout(5000);
  });

  test('Demo Website - View Ads', async ({ page }) => {
    console.log('🌐 Opening Demo Website...');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('✅ Demo Website loaded');
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Navigate to demo page
    const demoLink = page.locator('a[href="/demo"], a:has-text("Demo"), a:has-text("demo")').first();

    if (await demoLink.isVisible({ timeout: 3000 })) {
      console.log('🔗 Found demo link, navigating...');
      await demoLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ On demo page');
    }

    console.log('Current URL:', page.url());

    // Check for banner containers
    const containers = page.locator('[id*="container"], [id*="banner"], [id*="ad"]');
    const count = await containers.count();
    console.log(`📊 Found ${count} banner containers`);

    // Take screenshot
    await page.screenshot({ fullPage: true, path: 'test-results/demo-website.png' });
    console.log('📸 Full page screenshot saved to test-results/demo-website.png');

    // Wait for manual inspection
    await page.waitForTimeout(5000);
  });

  test('API Test - Direct Request', async ({ request }) => {
    console.log('🔌 Testing API endpoints...');

    // Test registration via API
    const timestamp = Date.now();
    const publisherData = {
      email: `api-test-${timestamp}@example.com`,
      password: 'TestPassword123',
      company_name: 'API Test Company',
    };

    console.log('📝 Registering publisher via API...');
    const regResponse = await request.post('http://localhost:8080/api/v1/publishers/register', {
      data: publisherData,
    });

    console.log(`Registration status: ${regResponse.status()}`);

    if (regResponse.status() === 201) {
      const data = await regResponse.json();
      console.log('✅ Registration successful!');
      console.log('   Publisher ID:', data.id);
      console.log('   Email:', data.email);
      console.log('   Token:', data.token ? '✅ Received' : '❌ Missing');

      // Test login
      console.log('🔐 Testing login...');
      const loginResponse = await request.post('http://localhost:8080/api/v1/publishers/login', {
        data: {
          email: publisherData.email,
          password: publisherData.password,
        },
      });

      console.log(`Login status: ${loginResponse.status()}`);

      if (loginResponse.status() === 200) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('   Token:', loginData.token ? '✅ Received' : '❌ Missing');

        // Test profile endpoint
        console.log('👤 Testing profile endpoint...');
        const profileResponse = await request.get('http://localhost:8080/api/v1/publishers/me', {
          headers: {
            Authorization: `Bearer ${loginData.token}`,
          },
        });

        console.log(`Profile status: ${profileResponse.status()}`);

        if (profileResponse.status() === 200) {
          const profile = await profileResponse.json();
          console.log('✅ Profile retrieved!');
          console.log('   ID:', profile.id);
          console.log('   Email:', profile.email);
        }
      }
    }
  });
});
