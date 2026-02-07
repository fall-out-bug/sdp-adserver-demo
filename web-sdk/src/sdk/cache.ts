/**
 * Cache - Session storage wrapper for banner caching
 */

import { getConfig } from './config.js';

export interface CachedBanner {
  html: string;
  width: number;
  height: number;
  clickURL: string;
  impression: string;
  campaignID: string;
}

interface CacheEntry {
  banner: CachedBanner;
  timestamp: number;
}

const CACHE_PREFIX = 'adserver_banner_';
const CACHE_KEY_SUFFIX = '_data';

/**
 * Get cached banner from session storage
 */
export function getCachedBanner(slotID: string): CachedBanner | null {
  if (!getConfig().cacheEnabled) return null;

  try {
    const key = `${CACHE_PREFIX}${slotID}${CACHE_KEY_SUFFIX}`;
    const data = sessionStorage.getItem(key);
    if (!data) return null;

    const entry: CacheEntry = JSON.parse(data);
    const now = Date.now();
    const ttl = getConfig().cacheTTL;

    // Check if cache is expired
    if (now - entry.timestamp > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }

    return entry.banner;
  } catch (error) {
    console.error('[AdServerSDK] Cache get error:', error);
    return null;
  }
}

/**
 * Set banner in session storage
 */
export function setCachedBanner(slotID: string, banner: CachedBanner): void {
  if (!getConfig().cacheEnabled) return;

  try {
    const key = `${CACHE_PREFIX}${slotID}${CACHE_KEY_SUFFIX}`;
    const entry: CacheEntry = {
      banner,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('[AdServerSDK] Cache set error:', error);
  }
}

/**
 * Remove banner from cache
 */
export function removeCachedBanner(slotID: string): void {
  try {
    const key = `${CACHE_PREFIX}${slotID}${CACHE_KEY_SUFFIX}`;
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('[AdServerSDK] Cache remove error:', error);
  }
}

/**
 * Clear all cached banners
 */
export function clearCache(): void {
  try {
    const keys = Object.keys(sessionStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('[AdServerSDK] Cache clear error:', error);
  }
}

/**
 * Get cache size (number of entries)
 */
export function getCacheSize(): number {
  try {
    const keys = Object.keys(sessionStorage);
    return keys.filter(key => key.startsWith(CACHE_PREFIX)).length;
  } catch (error) {
    return 0;
  }
}
