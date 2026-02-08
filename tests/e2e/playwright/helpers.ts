import { test as base } from '@playwright/test';

// Фикстуры для аутентификации
export const test = base.extend<{
  authenticatedPage: Page;
  adminPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // TODO: Добавить аутентификацию если понадобится
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    // TODO: Добавить admin аутентификацию если понадобится
    await use(page);
  },
});

// Helper функции для API тестирования
export class APIHelper {
  constructor(private baseURL: string) {}

  async getSlots() {
    const response = await fetch(`${this.baseURL}/api/v1/demo/slots`);
    if (!response.ok) {
      throw new Error(`Failed to fetch slots: ${response.status}`);
    }
    return response.json();
  }

  async getBanner(slotId: string) {
    const response = await fetch(`${this.baseURL}/api/v1/demo/slots/${slotId}/banner`);
    if (!response.ok) {
      throw new Error(`Failed to fetch banner: ${response.status}`);
    }
    return response.json();
  }

  async createBanner(token: string, data: any) {
    const response = await fetch(`${this.baseURL}/api/v1/demo/banners`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response;
  }
}

// Helper функции для UI тестирования
export class UIHelper {
  constructor(private page: Page) {}

  async navigateTo(route: string) {
    await this.page.goto(route);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForBannerLoad(containerId: string, timeout = 5000) {
    const container = this.page.locator(`#${containerId}`);

    // Ждем либо загрузки контента, либо сообщения об ошибке
    await this.page.waitForFunction(
      (id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        // Проверяем что контент загружен (не "Loading...")
        return !el.textContent.includes('Loading...');
      },
      { containerId },
      { timeout }
    );

    return container;
  }

  async getBannerContent(containerId: string) {
    const container = this.page.locator(`#${containerId}`);
    const html = await container.innerHTML();
    return html;
  }

  async screenshotContainer(containerId: string, name: string) {
    const container = this.page.locator(`#${containerId}`);
    await container.screenshot({ path: `test-results/${name}.png` });
  }
}

// Test data
export const testSlots = [
  { id: 'demo-leaderboard', name: 'Leaderboard', width: 728, height: 90 },
  { id: 'demo-medium-rect', name: 'Medium Rectangle', width: 300, height: 250 },
  { id: 'demo-skyscraper', name: 'Skyscraper', width: 160, height: 600 },
  { id: 'demo-half-page', name: 'Half Page', width: 300, height: 600 },
];

export const testFormats = [
  'leaderboard',
  'medium-rectangle',
  'skyscraper',
  'half-page',
  'native-in-feed',
  'native-sponsored',
];
