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

  const mockStorage = new Map<string, string>();

  beforeEach(() => {
    mockStorage.clear();
    resetConfig();

    // Mock sessionStorage with Map
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn((key: string) => mockStorage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => mockStorage.set(key, value)),
      removeItem: vi.fn((key: string) => mockStorage.delete(key)),
      clear: vi.fn(() => mockStorage.clear()),
      key: vi.fn((index: number) => {
        const keys = Array.from(mockStorage.keys());
        return keys[index] ?? null;
      }),
      get length() { return mockStorage.size; },
      // Add Object.keys support
      [Symbol.iterator]: function* () {
        for (const key of mockStorage.keys()) {
          yield key;
        }
      },
    } as any);

    // Mock Object.keys to work with our sessionStorage
    vi.stubGlobal('Object', {
      assign: Object.assign,
      keys: vi.fn((obj: any) => {
        if (obj === sessionStorage) {
          return Array.from(mockStorage.keys());
        }
        return Object.keys(obj);
      }),
      getOwnPropertyDescriptors: Object.getOwnPropertyDescriptors,
      getPrototypeOf: Object.getPrototypeOf,
    } as any);
  });

  afterEach(() => {
    mockStorage.clear();
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

    it('should not cache when cacheEnabled is false', () => {
      (getConfig() as any).cacheEnabled = false;
      setCachedBanner('slot-1', mockBanner);
      expect(getCachedBanner('slot-1')).toBeNull();
    });

    it('should respect cache TTL', () => {
      (getConfig() as any).cacheTTL = 100; // 100ms TTL
      setCachedBanner('slot-1', mockBanner);

      // Should be available immediately
      expect(getCachedBanner('slot-1')).not.toBeNull();

      // Wait for TTL to expire
      return new Promise<void>((done) => {
        setTimeout(() => {
          const retrieved = getCachedBanner('slot-1');
          expect(retrieved).toBeNull();
          done();
        }, 150);
      });
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
    it('should clear all cached banners', () => {
      setCachedBanner('slot-1', mockBanner);
      setCachedBanner('slot-2', mockBanner);

      expect(getCachedBanner('slot-1')).not.toBeNull();
      expect(getCachedBanner('slot-2')).not.toBeNull();

      clearCache();

      expect(getCachedBanner('slot-1')).toBeNull();
      expect(getCachedBanner('slot-2')).toBeNull();
    });

    it('should not clear non-adserver session storage items', () => {
      sessionStorage.setItem('other_key', 'value');
      setCachedBanner('slot-1', mockBanner);

      clearCache();

      expect(sessionStorage.getItem('other_key')).toBe('value');
      expect(getCachedBanner('slot-1')).toBeNull();
    });
  });

  describe('getCacheSize', () => {
    it('should return 0 for empty cache', () => {
      expect(getCacheSize()).toBe(0);
    });

    it('should handle sessionStorage errors gracefully', () => {
      const originalGetItem = sessionStorage.getItem;
      (sessionStorage as any).getItem = () => { throw new Error('Storage error'); };

      expect(getCacheSize()).toBe(0);

      sessionStorage.getItem = originalGetItem;
    });
  });
});
