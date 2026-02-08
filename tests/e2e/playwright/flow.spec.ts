import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:8080/api/v1';

test.describe('Ad Server Full Flow Tests', () => {
  let publisherToken: string;
  let advertiserToken: string;
  let publisherId: string;
  let advertiserId: string;
  let demoAdminToken: string;

  // Helper to generate random user data
  const generateUserData = (prefix: string) => ({
    email: `${prefix}-${Date.now()}@example.com`,
    password: 'TestPassword123',
    company_name: `${prefix} Company`,
  });

  test.describe('Publisher Registration & Authentication Flow', () => {
    test('should register a new publisher', async ({ request }) => {
      const userData = generateUserData('publisher');

      const response = await request.post(`${API_BASE}/publishers/register`, {
        data: userData,
      });

      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email', userData.email);
      expect(data).toHaveProperty('token');

      publisherId = data.id;
      publisherToken = data.token;
    });

    test('should not register duplicate publisher', async ({ request }) => {
      const userData = generateUserData('publisher-dup');

      // First registration
      await request.post(`${API_BASE}/publishers/register`, {
        data: userData,
      });

      // Duplicate registration
      const response = await request.post(`${API_BASE}/publishers/register`, {
        data: userData,
      });

      expect(response.status()).toBe(409);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    test('should login publisher with valid credentials', async ({ request }) => {
      // First register
      const userData = generateUserData('publisher-login');
      await request.post(`${API_BASE}/publishers/register`, {
        data: userData,
      });

      // Then login
      const response = await request.post(`${API_BASE}/publishers/login`, {
        data: {
          email: userData.email,
          password: userData.password,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email', userData.email);

      publisherToken = data.token;
      publisherId = data.id;
    });

    test('should not login publisher with invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_BASE}/publishers/login`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'WrongPassword123',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should get publisher profile with valid token', async ({ request }) => {
      // Setup: register and login
      const userData = generateUserData('publisher-profile');
      const registerResponse = await request.post(`${API_BASE}/publishers/register`, {
        data: userData,
      });
      const registerData = await registerResponse.json();

      const loginResponse = await request.post(`${API_BASE}/publishers/login`, {
        data: {
          email: userData.email,
          password: userData.password,
        },
      });
      const loginData = await loginResponse.json();

      // Get profile
      const response = await request.get(`${API_BASE}/publishers/me`, {
        headers: {
          Authorization: `Bearer ${loginData.token}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id', registerData.id);
      expect(data).toHaveProperty('email', userData.email);
    });
  });

  test.describe('Advertiser Registration & Authentication Flow', () => {
    test('should register a new advertiser', async ({ request }) => {
      const userData = generateUserData('advertiser');

      const response = await request.post(`${API_BASE}/advertisers/register`, {
        data: userData,
      });

      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email', userData.email);
      expect(data).toHaveProperty('token');

      advertiserId = data.id;
      advertiserToken = data.token;
    });

    test('should login advertiser with valid credentials', async ({ request }) => {
      const userData = generateUserData('advertiser-login');

      // First register
      await request.post(`${API_BASE}/advertisers/register`, {
        data: userData,
      });

      // Then login
      const response = await request.post(`${API_BASE}/advertisers/login`, {
        data: {
          email: userData.email,
          password: userData.password,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email', userData.email);

      advertiserToken = data.token;
      advertiserId = data.id;
    });

    test('should get advertiser profile with valid token', async ({ request }) => {
      const userData = generateUserData('advertiser-profile');

      // Setup: register and login
      await request.post(`${API_BASE}/advertisers/register`, {
        data: userData,
      });

      const loginResponse = await request.post(`${API_BASE}/advertisers/login`, {
        data: {
          email: userData.email,
          password: userData.password,
        },
      });
      const loginData = await loginResponse.json();

      // Get profile
      const response = await request.get(`${API_BASE}/advertisers/me`, {
        headers: {
          Authorization: `Bearer ${loginData.token}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('email', userData.email);
    });
  });

  test.describe('Demo Banner Management Flow', () => {
    let authToken: string;

    test.beforeAll(async ({ request }) => {
      // Get auth token from publisher login
      const userData = generateUserData('demo-admin');
      await request.post(`${API_BASE}/publishers/register`, {
        data: userData,
      });

      const loginResponse = await request.post(`${API_BASE}/publishers/login`, {
        data: {
          email: userData.email,
          password: userData.password,
        },
      });
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      demoAdminToken = authToken;
    });

    test('should create a new demo banner', async ({ request }) => {
      const bannerData = {
        name: 'Test Banner ' + Date.now(),
        format: 'leaderboard',
        width: 728,
        height: 90,
        html: '<div>Test Banner Content</div>',
        active: true,
      };

      const response = await request.post(`${API_BASE}/demo/banners`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: bannerData,
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name', bannerData.name);
      expect(data).toHaveProperty('format', bannerData.format);
    });

    test('should list all demo banners', async ({ request }) => {
      const response = await request.get(`${API_BASE}/demo/banners`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('banners');
      expect(Array.isArray(data.banners)).toBe(true);
      expect(data.banners.length).toBeGreaterThan(0);
    });

    test('should not create banner without auth', async ({ request }) => {
      const bannerData = {
        name: 'Unauthorized Banner',
        format: 'medium-rectangle',
        width: 300,
        height: 250,
        html: '<div>Unauthorized</div>',
        active: true,
      };

      const response = await request.post(`${API_BASE}/demo/banners`, {
        data: bannerData,
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Ad Delivery & Tracking Flow', () => {
    test('should deliver ad for a slot', async ({ request }) => {
      const response = await request.get(`${API_BASE}/delivery/demo-leaderboard`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('creative');
      expect(data).toHaveProperty('tracking');

      if (data.creative) {
        expect(data.creative).toHaveProperty('html');
        expect(data.creative).toHaveProperty('width', 728);
        expect(data.creative).toHaveProperty('height', 90);
      }
    });

    test('should handle non-existent slot', async ({ request }) => {
      const response = await request.get(`${API_BASE}/delivery/non-existent-slot`);

      // Should return fallback or 404
      const status = response.status();
      expect(status === 200 || status === 404).toBe(true);
    });

    test('should track impression', async ({ request }) => {
      const impressionData = {
        slot_id: 'demo-leaderboard',
        banner_id: 'test-banner-id',
        publisher_id: 'test-publisher-id',
        advertiser_id: 'test-advertiser-id',
        timestamp: new Date().toISOString(),
        user_agent: 'Playwright Test',
        ip: '127.0.0.1',
        referer: 'http://localhost:3000',
      };

      const response = await request.post(`${API_BASE}/track/impression`, {
        data: impressionData,
      });

      // Accept multiple success codes
      const status = response.status();
      expect(status === 200 || status === 201 || status === 202).toBe(true);
    });

    test('should track click', async ({ request }) => {
      // First, we'd need to create a valid impression
      // For this test, we'll use a placeholder impression_id
      const impressionId = 'test-impression-' + Date.now();

      const response = await request.get(`${API_BASE}/track/click/${impressionId}`);

      // Should handle missing impression gracefully
      const status = response.status();
      expect(status === 200 || status === 302 || status === 404).toBe(true);
    });
  });

  test.describe('Full End-to-End Flow', () => {
    test('complete flow: register -> create banner -> deliver ad -> track', async ({ request }) => {
      // Step 1: Register publisher
      const publisherData = generateUserData('e2e-publisher');
      const pubRegResponse = await request.post(`${API_BASE}/publishers/register`, {
        data: publisherData,
      });
      expect(pubRegResponse.status()).toBe(201);
      const publisher = await pubRegResponse.json();

      // Step 2: Login publisher
      const pubLoginResponse = await request.post(`${API_BASE}/publishers/login`, {
        data: {
          email: publisherData.email,
          password: publisherData.password,
        },
      });
      expect(pubLoginResponse.status()).toBe(200);
      const pubLogin = await pubLoginResponse.json();

      // Step 3: Register advertiser
      const advertiserData = generateUserData('e2e-advertiser');
      const advRegResponse = await request.post(`${API_BASE}/advertisers/register`, {
        data: advertiserData,
      });
      expect(advRegResponse.status()).toBe(201);
      const advertiser = await advRegResponse.json();

      // Step 4: Login advertiser
      const advLoginResponse = await request.post(`${API_BASE}/advertisers/login`, {
        data: {
          email: advertiserData.email,
          password: advertiserData.password,
        },
      });
      expect(advLoginResponse.status()).toBe(200);
      const advLogin = await advLoginResponse.json();

      // Step 5: Create demo banner (as advertiser)
      const bannerData = {
        name: 'E2E Test Banner',
        format: 'medium-rectangle',
        width: 300,
        height: 250,
        html: '<div style="background:#f0f0f0;padding:20px;text-align:center;">E2E Test Ad</div>',
        active: true,
      };
      const bannerResponse = await request.post(`${API_BASE}/demo/banners`, {
        headers: {
          Authorization: `Bearer ${advLogin.token}`,
        },
        data: bannerData,
      });
      expect(bannerResponse.status()).toBe(201);
      const banner = await bannerResponse.json();

      // Step 6: Deliver ad
      const deliveryResponse = await request.get(`${API_BASE}/delivery/demo-medium-rect`);
      expect(deliveryResponse.status()).toBe(200);
      const delivery = await deliveryResponse.json();

      // Step 7: Track impression
      const impressionResponse = await request.post(`${API_BASE}/track/impression`, {
        data: {
          slot_id: 'demo-medium-rect',
          banner_id: banner.id,
          publisher_id: publisher.id,
          advertiser_id: advertiser.id,
          timestamp: new Date().toISOString(),
          user_agent: 'E2E Test',
          ip: '127.0.0.1',
          referer: 'http://localhost:3000',
        },
      });

      const status = impressionResponse.status();
      expect(status === 200 || status === 201 || status === 202).toBe(true);

      // Verify all steps completed successfully
      expect(publisher.id).toBeDefined();
      expect(advertiser.id).toBeDefined();
      expect(banner.id).toBeDefined();
      expect(delivery.creative).toBeDefined();
    });
  });

  test.describe('UI Flow Tests', () => {
    test('publisher portal homepage loads', async ({ page }) => {
      await page.goto('http://localhost:3001');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title).toContain('Publisher');
    });

    test('advertiser portal homepage loads', async ({ page }) => {
      await page.goto('http://localhost:3002');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title).toContain('Advertiser');
    });
  });
});
