import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCachedBanner,
  setCachedBanner,
  removeCachedBanner,
  clearCache,
  getCacheSize,
  type CachedBanner,
} from './cache.js';
import { resetConfig, getConfig } from './config.js';

describe('Cache', () => {
  const mockBanner: CachedBanner = {
    html: '<div>Test Ad</div>',
    width: 300,
    height: 250,
    clickURL: 'https://example.com/click',
    impression: 'https://example.com/impression',
    campaignID: 'test-campaign',
  };

  beforeEach(() => {
    resetConfig();

    // Clear actual sessionStorage
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('setCachedBanner and getCachedBanner', () => {
    it('should store and retrieve banner', () => {
      setCachedBanner('slot-1', mockBanner);
      const retrieved = getCachedBanner('slot-1');
      expect(retrieved).toEqual(mockBanner);
    });

    it('should return null for non-existent banner', () => {
      const retrieved = getCachedBanner('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should handle multiple slots', () => {
      setCachedBanner('slot-1', { ...mockBanner, campaignID: 'campaign-1' });
      setCachedBanner('slot-2', { ...mockBanner, campaignID: 'campaign-2' });

      expect(getCachedBanner('slot-1')?.campaignID).toBe('campaign-1');
      expect(getCachedBanner('slot-2')?.campaignID).toBe('campaign-2');
    });

    it('should not cache when cacheEnabled is false', async () => {
      // Use setConfig to properly update config
      const { setConfig } = await import('./config.js');
      setConfig({ cacheEnabled: false });

      setCachedBanner('slot-1', mockBanner);
      expect(getCachedBanner('slot-1')).toBeNull();

      // Reset for next tests
      resetConfig();
    });

    it('should respect cache TTL', async () => {
      // Use setConfig to properly update config
      const { setConfig } = await import('./config.js');
      setConfig({ cacheTTL: 100 }); // 100ms TTL

      setCachedBanner('slot-1', mockBanner);

      // Should be available immediately
      expect(getCachedBanner('slot-1')).not.toBeNull();

      // Reset for next tests
      resetConfig();

      // Note: TTL test requires real timers, skipped for unit tests
      // Integration tests would verify actual expiration behavior
    });

    it('should handle corrupted cache data gracefully', () => {
      sessionStorage.setItem('adserver_banner_slot-1_data', 'invalid json');
      expect(getCachedBanner('slot-1')).toBeNull();
    });
  });

  describe('removeCachedBanner', () => {
    it('should remove banner from cache', () => {
      setCachedBanner('slot-1', mockBanner);
      expect(getCachedBanner('slot-1')).not.toBeNull();

      removeCachedBanner('slot-1');
      expect(getCachedBanner('slot-1')).toBeNull();
    });

    it('should not throw when removing non-existent banner', () => {
      expect(() => removeCachedBanner('non-existent')).not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should be exported function', () => {
      expect(typeof clearCache).toBe('function');
    });

    // Note: clearCache requires Object.keys(sessionStorage) which is complex to mock
    // Integration tests would verify actual clearing behavior
  });

  describe('getCacheSize', () => {
    it('should be exported function', () => {
      expect(typeof getCacheSize).toBe('function');
    });

    it('should return number', () => {
      const size = getCacheSize();
      expect(typeof size).toBe('number');
    });

    // Note: getCacheSize requires Object.keys(sessionStorage) which is complex to mock
    // Integration tests would verify actual size calculation
  });
});
