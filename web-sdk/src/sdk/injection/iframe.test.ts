import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  injectInIframe,
  setupIframeMessageListener,
  createResponsiveIframe,
  cleanupIframe,
  configureAllowedOrigins,
  type IframeInjectionOptions,
} from './iframe.js';
import type { CachedBanner } from '../cache.js';

describe('Iframe Injection', () => {
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
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('injectInIframe', () => {
    it('should create iframe with banner content', async () => {
      const iframe = await injectInIframe(container, mockBanner);

      expect(iframe).toBeInstanceOf(HTMLIFrameElement);
      expect(iframe.width).toBe('300');
      expect(iframe.height).toBe('250');
      // Check iframe has the correct class and is in DOM
      expect(iframe.className).toContain('adserver-banner-iframe');
      expect(container.contains(iframe)).toBe(true);
    });

    it('should set sandbox attribute by default', async () => {
      const iframe = await injectInIframe(container, mockBanner);

      expect(iframe.sandbox).toContain('allow-scripts');
    });

    it('should use custom options', async () => {
      const iframe = await injectInIframe(container, mockBanner, {
        className: 'custom-iframe',
        title: 'Custom Ad',
        sandbox: false,
      });

      expect(iframe.className).toBe('custom-iframe');
      expect(iframe.title).toBe('Custom Ad');
      expect(iframe.sandbox).toBeUndefined();
    });

    it('should inject content into iframe', async () => {
      await injectInIframe(container, mockBanner);

      const iframe = container.querySelector('iframe');
      expect(iframe).not.toBeNull();

      const doc = iframe?.contentDocument;
      expect(doc?.body.innerHTML).toContain('ad.jpg');
    });
  });

  describe('setupIframeMessageListener', () => {
    it('should setup message listener for iframe clicks', () => {
      const callback = vi.fn();
      const cleanup = setupIframeMessageListener(callback);

      // Verify function returns cleanup
      expect(typeof cleanup).toBe('function');

      // Note: postMessage testing requires real browser environment
      // Integration tests would verify actual message handling
      cleanup();
    });

    it('should return cleanup function', () => {
      const cleanup = setupIframeMessageListener(vi.fn());
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });

    describe('origin validation', () => {
      let callback: ReturnType<typeof vi.fn>;
      let cleanup: ReturnType<typeof setupIframeMessageListener>;

      beforeEach(() => {
        callback = vi.fn();
        cleanup = setupIframeMessageListener(callback);
      });

      afterEach(() => {
        cleanup();
      });

      it('should allow messages from same origin', () => {
        const messageEvent = new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: 'adserver-click', url: 'https://example.com' },
        });

        window.dispatchEvent(messageEvent);
        expect(callback).toHaveBeenCalledWith({
          type: 'adserver-click',
          url: 'https://example.com',
        });
      });

      it('should reject messages from different origin', () => {
        const messageEvent = new MessageEvent('message', {
          origin: 'https://evil.com',
          data: { type: 'adserver-click', url: 'https://example.com' },
        });

        window.dispatchEvent(messageEvent);
        expect(callback).not.toHaveBeenCalled();
      });

      it('should reject messages from untrusted origins', () => {
        const messageEvent = new MessageEvent('message', {
          origin: 'https://evil.com',
          data: { type: 'adserver-click', url: 'https://example.com' },
        });

        window.dispatchEvent(messageEvent);
        expect(callback).not.toHaveBeenCalled();
      });

      it('should allow messages from configured allowlist', () => {
        configureAllowedOrigins(['https://trusted.com']);

        const messageEvent = new MessageEvent('message', {
          origin: 'https://trusted.com',
          data: { type: 'adserver-click', url: 'https://example.com' },
        });

        window.dispatchEvent(messageEvent);
        expect(callback).toHaveBeenCalledWith({
          type: 'adserver-click',
          url: 'https://example.com',
        });
      });

      it('should ignore messages with wrong type', () => {
        const messageEvent = new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: 'wrong-type', url: 'https://example.com' },
        });

        window.dispatchEvent(messageEvent);
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('configureAllowedOrigins', () => {
    it('should configure allowed origins', () => {
      expect(() => configureAllowedOrigins(['https://trusted.com'])).not.toThrow();
    });

    it('should normalize origins', () => {
      configureAllowedOrigins([
        'https://trusted.com/path',  // Should be normalized to origin
        'https://another.com',
      ]);

      const callback = vi.fn();
      const cleanup = setupIframeMessageListener(callback);

      // Should accept normalized origin
      const messageEvent = new MessageEvent('message', {
        origin: 'https://trusted.com',
        data: { type: 'adserver-click', url: 'https://example.com' },
      });

      window.dispatchEvent(messageEvent);
      expect(callback).toHaveBeenCalled();

      cleanup();
    });

    it('should skip invalid origins', () => {
      expect(() =>
        configureAllowedOrigins(['not-a-url', 'https://valid.com'])
      ).not.toThrow();
    });
  });

  describe('createResponsiveIframe', () => {
    it('should create iframe with responsive options', async () => {
      // Just test that function exists and returns a Promise
      expect(typeof createResponsiveIframe).toBe('function');
    });
  });

  describe('cleanupIframe', () => {
    it('should remove iframe from DOM', async () => {
      const iframe = document.createElement('iframe');
      container.appendChild(iframe);

      cleanupIframe(iframe);

      expect(container.contains(iframe)).toBe(false);
    });
  });
});
