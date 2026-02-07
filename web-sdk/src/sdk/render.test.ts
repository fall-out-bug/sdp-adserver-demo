import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  renderBanner,
  detectContainerSize,
  autoRender,
  type RenderOptions,
} from './render.js';
import { getCachedBanner, setCachedBanner, clearCache } from './cache.js';
import { fetchBannerCached, createDeliveryRequest } from './client.js';
import type { CachedBanner } from './cache.js';

// Mock dependencies
vi.mock('./cache.js');
vi.mock('./client.js');

describe('Render', () => {
  let container: HTMLElement;
  const mockBanner: CachedBanner = {
    html: '<a href="https://example.com"><img src="ad.jpg" alt="Ad"></a>',
    width: 300,
    height: 250,
    clickURL: 'https://api.test.com/click',
    impression: 'https://api.test.com/impression',
    campaignID: 'test-campaign',
  };

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-slot';
    document.body.appendChild(container);

    vi.clearAllMocks();
    vi.mocked(getCachedBanner).mockReturnValue(null);
    vi.mocked(setCachedBanner);
    vi.mocked(fetchBannerCached).mockResolvedValue(mockBanner);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('detectContainerSize', () => {
    it('should detect size from bounding client rect', () => {
      container.style.width = '300px';
      container.style.height = '250px';

      const size = detectContainerSize(container);

      expect(size.width).toBe(300);
      expect(size.height).toBe(250);
    });

    it('should return default size when element has no size', () => {
      const size = detectContainerSize(container);

      expect(size.width).toBe(300);
      expect(size.height).toBe(250);
    });
  });

  describe('renderBanner', () => {
    it('should render banner successfully', async () => {
      const result = await renderBanner('slot-1', container);

      expect(result.success).toBe(true);
      expect(result.method).toBe('direct');
      expect(result.banner).toEqual(mockBanner);
    });

    it('should use cached banner if available', async () => {
      vi.mocked(getCachedBanner).mockReturnValue(mockBanner);

      const result = await renderBanner('slot-1', container);

      expect(result.success).toBe(true);
      expect(result.method).toBe('cache');
      expect(vi.mocked(fetchBannerCached)).not.toHaveBeenCalled();
    });

    it('should render fallback on error', async () => {
      vi.mocked(fetchBannerCached).mockRejectedValue(new Error('Network error'));

      const result = await renderBanner('slot-1', container, {
        fallbackEnabled: true,
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe('fallback');
      expect(container.innerHTML).toContain('adserver-fallback');
    });

    it('should return error result when fallback disabled', async () => {
      vi.mocked(fetchBannerCached).mockRejectedValue(new Error('Network error'));

      const result = await renderBanner('slot-1', container, {
        fallbackEnabled: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use iframe mode when requested', async () => {
      const result = await renderBanner('slot-1', container, {
        useIframe: true,
      });

      expect(result.success).toBe(true);
      expect(result.method).toBe('iframe');
      expect(container.querySelector('iframe')).not.toBeNull();
    });
  });

  describe('autoRender', () => {
    it('should export autoRender function', () => {
      expect(typeof autoRender).toBe('function');
    });
  });
});
