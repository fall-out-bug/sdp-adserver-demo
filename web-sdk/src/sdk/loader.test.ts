import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadScript,
  preloadScript,
  loadScripts,
  getLoadState,
  getLoadStateDetails,
  getLoadMetrics,
  clearLoadStates,
  type LoadOptions,
} from './loader.js';

describe('Loader', () => {
  let createElementMock: ReturnType<typeof vi.fn>;
  let appendChildMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clearLoadStates();

    // Track script elements
    const scripts = new Map<string, any>();

    createElementMock = vi.fn((tag: string) => {
      if (tag === 'script') {
        const script = {
          src: '',
          async: false,
          onload: null,
          onerror: null,
          addEventListener: vi.fn(),
        };
        return script;
      }
      if (tag === 'link') {
        return {
          rel: '',
          as: '',
          href: '',
        };
      }
      return {};
    });

    appendChildMock = vi.fn((node: any) => {
      // Simulate successful load after delay
      setTimeout(() => {
        if (node.onload) node.onload();
      }, 10);
      return node;
    });

    vi.stubGlobal('document', {
      createElement: createElementMock,
      head: { appendChild: appendChildMock },
    } as any);

    vi.stubGlobal('performance', {
      now: vi.fn(() => Date.now()),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('loadScript', () => {
    it('should create and append script element', async () => {
      const url = 'https://cdn.example.com/sdk.js';
      const promise = loadScript(url);

      expect(createElementMock).toHaveBeenCalledWith('script');

      await promise;

      expect(getLoadState(url)).toBe('loaded');
    });

    it('should set script attributes', async () => {
      const url = 'https://cdn.example.com/sdk.js';
      await loadScript(url);

      const script = createElementMock.mock.results[0].value;
      expect(script.src).toBe(url);
      expect(script.async).toBe(true);
    });

    it('should handle load error', async () => {
      // Override appendChild to simulate error
      const originalAppendChild = appendChildMock;
      appendChildMock = vi.fn((node: any) => {
        setTimeout(() => {
          if (node.onerror) node.onerror(new Error('Load failed'));
        }, 10);
        return node;
      });

      const url = 'https://cdn.example.com/sdk.js';

      // Need to set up error before calling loadScript
      vi.stubGlobal('document', {
        createElement: createElementMock,
        head: { appendChild: appendChildMock },
      } as any);

      await expect(loadScript(url)).rejects.toThrow();
      expect(getLoadState(url)).toBe('error');
    });

    it('should resolve immediately if already loaded', async () => {
      const url = 'https://cdn.example.com/sdk.js';

      // First load
      await loadScript(url);

      // Second load should be instant
      const startTime = Date.now();
      await loadScript(url);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(50);
      expect(getLoadState(url)).toBe('loaded');
    });

    it('should handle concurrent loads with single request', async () => {
      const url = 'https://cdn.example.com/sdk.js';

      const [p1, p2] = [loadScript(url), loadScript(url)];

      await Promise.all([p1, p2]);

      // Should only create one script element
      expect(createElementMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('preloadScript', () => {
    it('should create preload link element', () => {
      const url = 'https://cdn.example.com/sdk.js';
      preloadScript(url);

      expect(createElementMock).toHaveBeenCalledWith('link');
      expect(appendChildMock).toHaveBeenCalled();
    });
  });

  describe('loadScripts', () => {
    it('should load multiple scripts in parallel', async () => {
      const urls = [
        'https://cdn.example.com/sdk1.js',
        'https://cdn.example.com/sdk2.js',
      ];

      await loadScripts(urls);

      expect(getLoadState(urls[0])).toBe('loaded');
      expect(getLoadState(urls[1])).toBe('loaded');
    });
  });

  describe('getLoadState', () => {
    it('should return idle for non-existent script', () => {
      expect(getLoadState('non-existent')).toBe('idle');
    });

    it('should return loading state while loading', () => {
      const url = 'https://cdn.example.com/sdk.js';
      const promise = loadScript(url);

      expect(getLoadState(url)).toBe('loading');

      return promise.then(() => {
        expect(getLoadState(url)).toBe('loaded');
      });
    });
  });

  describe('getLoadStateDetails', () => {
    it('should return detailed state information', async () => {
      const url = 'https://cdn.example.com/sdk.js';
      await loadScript(url);

      const details = getLoadStateDetails(url);

      expect(details).toBeDefined();
      expect(details?.state).toBe('loaded');
      expect(details?.error).toBeNull();
      expect(details?.endTime).toBeGreaterThan(0);
    });
  });

  describe('getLoadMetrics', () => {
    it('should return load duration and state', async () => {
      const url = 'https://cdn.example.com/sdk.js';
      await loadScript(url);

      const metrics = getLoadMetrics(url);

      expect(metrics).toBeDefined();
      expect(metrics?.duration).toBeGreaterThan(0);
      expect(metrics?.state).toBe('loaded');
    });

    it('should return null for loading script', () => {
      const url = 'https://cdn.example.com/sdk.js';
      loadScript(url); // Don't await

      expect(getLoadMetrics(url)).toBeNull();
    });
  });

  describe('clearLoadStates', () => {
    it('should clear all load states', async () => {
      const url1 = 'https://cdn.example.com/sdk1.js';
      const url2 = 'https://cdn.example.com/sdk2.js';

      await loadScript(url1);
      await loadScript(url2);

      clearLoadStates();

      expect(getLoadState(url1)).toBe('idle');
      expect(getLoadState(url2)).toBe('idle');
    });
  });
});
