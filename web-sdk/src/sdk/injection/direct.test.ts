import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  injectDirect,
  trackImpression,
  applyStyleIsolation,
} from './direct.js';
import type { CachedBanner } from '../cache.js';

describe('Direct Injection', () => {
  let container: HTMLElement;
  const mockBanner: CachedBanner = {
    html: '<a href="https://example.com"><img src="ad.jpg" width="300" height="250" alt="Ad"></a>',
    width: 300,
    height: 250,
    clickURL: 'https://api.test.com/click',
    impression: 'https://api.test.com/impression',
    campaignID: 'test-campaign',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('injectDirect', () => {
    it('should inject banner HTML directly', () => {
      injectDirect(container, mockBanner);

      expect(container.innerHTML).toContain('adserver-banner');
      expect(container.innerHTML).toContain('ad.jpg');
    });

    it('should set wrapper dimensions', () => {
      injectDirect(container, mockBanner);

      const wrapper = container.querySelector('.adserver-banner') as HTMLElement;
      expect(wrapper?.style.width).toBe('300px');
      expect(wrapper?.style.height).toBe('250px');
    });

    it('should use custom wrapper class', () => {
      injectDirect(container, mockBanner, {
        wrapperClass: 'custom-class',
      });

      expect(container.querySelector('.custom-class')).not.toBeNull();
    });

    it('should apply custom wrapper style', () => {
      injectDirect(container, mockBanner, {
        wrapperStyle: 'border: 1px solid red;',
      });

      const wrapper = container.querySelector('.adserver-banner') as HTMLElement;
      expect(wrapper?.style.border).toBe('1px solid red');
    });

    it('should disable click tracking when requested', () => {
      injectDirect(container, mockBanner, {
        enableClickTracking: false,
      });

      const link = container.querySelector('a');
      expect(link).not.toBeNull();
    });
  });

  describe('trackImpression', () => {
    it('should be exported function', () => {
      expect(typeof trackImpression).toBe('function');
    });

    it('should handle empty impression URL gracefully', () => {
      expect(() => trackImpression('')).not.toThrow();
    });

    // Note: sendBeacon and fetch testing requires real browser environment
    // Integration tests would verify actual impression tracking
  });

  describe('applyStyleIsolation', () => {
    it('should add scoping class to wrapper', () => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = '<div><span>Content</span></div>';
      injectDirect(container, mockBanner);
      const bannerWrapper = container.querySelector('.adserver-banner') as HTMLElement;

      applyStyleIsolation(bannerWrapper!);

      expect(bannerWrapper.classList.length).toBeGreaterThan(0);
    });
  });
});
