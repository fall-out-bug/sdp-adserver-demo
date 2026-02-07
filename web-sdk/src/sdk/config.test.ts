import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mergeConfig,
  getScriptConfig,
  getGlobalConfig,
  initConfig,
  getConfig,
  setConfig,
  validateConfig,
  resetConfig,
  type SDKConfig,
  type InternalConfig,
} from './config.js';

describe('mergeConfig', () => {
  it('should merge configs with correct priority', () => {
    const scriptAttrs = { apiEndpoint: '/script-endpoint', debug: true };
    const globalConfig = { apiEndpoint: '/global-endpoint', testMode: true };
    const merged = mergeConfig(scriptAttrs, globalConfig);
    expect(merged.apiEndpoint).toBe('/script-endpoint'); // script attrs win
    expect(merged.debug).toBe(true);
    expect(merged.testMode).toBe(true);
  });

  it('should use defaults when not provided', () => {
    const merged = mergeConfig({}, {});
    expect(merged.apiEndpoint).toBe('/api/v1');
    expect(merged.apiTimeout).toBe(5000);
  });

  it('should preserve function callbacks', () => {
    const onInit = vi.fn();
    const scriptAttrs = { onInit };
    const merged = mergeConfig(scriptAttrs, {});
    expect(merged.onInit).toBe(onInit);
  });
});

describe('getScriptConfig', () => {
  it('should extract string attributes', () => {
    const element = document.createElement('script');
    element.setAttribute('data-api-endpoint', 'https://api.example.com');
    const config = getScriptConfig(element);
    expect(config.apiEndpoint).toBe('https://api.example.com');
  });

  it('should extract boolean attributes', () => {
    const element = document.createElement('script');
    element.setAttribute('data-debug', 'true');
    element.setAttribute('data-test-mode', 'false');
    element.setAttribute('data-lazy-load', 'true');
    const config = getScriptConfig(element);
    expect(config.debug).toBe(true);
    expect(config.testMode).toBe(false);
    expect(config.lazyLoad).toBe(true);
  });

  it('should extract number attributes', () => {
    const element = document.createElement('script');
    element.setAttribute('data-api-timeout', '10000');
    element.setAttribute('data-cache-ttl', '600000');
    const config = getScriptConfig(element);
    expect(config.apiTimeout).toBe(10000);
    expect(config.cacheTTL).toBe(600000);
  });

  it('should return empty object if no attributes', () => {
    const element = document.createElement('script');
    const config = getScriptConfig(element);
    expect(Object.keys(config)).toHaveLength(0);
  });
});

describe('getGlobalConfig', () => {
  beforeEach(() => {
    delete (window as any).AdServerSDKConfig;
  });

  afterEach(() => {
    delete (window as any).AdServerSDKConfig;
  });

  it('should get config from window object', () => {
    const globalConfig = { debug: true, apiEndpoint: 'https://api.example.com' };
    (window as any).AdServerSDKConfig = globalConfig;
    const config = getGlobalConfig();
    expect(config).toEqual(globalConfig);
  });

  it('should return empty object if not set', () => {
    const config = getGlobalConfig();
    expect(config).toEqual({});
  });
});

describe('validateConfig', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('should validate correct config', () => {
    const config: InternalConfig = {
      version: '0.1.0',
      apiEndpoint: '/api/v1',
      apiTimeout: 5000,
      debug: false,
      testMode: false,
      lazyLoad: true,
      cacheEnabled: true,
      cacheTTL: 300000,
      retryEnabled: true,
      retryMaxAttempts: 3,
      retryDelay: 1000,
      iframeMode: false,
      fallbackEnabled: true,
      onInit: () => {},
      onReady: () => {},
      onError: () => {},
    };
    expect(validateConfig(config)).toBe(true);
  });

  it('should reject invalid apiTimeout', () => {
    const config = { ...getConfig(), apiTimeout: 50 } as InternalConfig; // Too low
    expect(validateConfig(config)).toBe(false);
  });

  it('should reject invalid cacheTTL', () => {
    const config = { ...getConfig(), cacheTTL: 5000000 } as InternalConfig; // Too high
    expect(validateConfig(config)).toBe(false);
  });

  it('should reject invalid retryMaxAttempts', () => {
    const config = { ...getConfig(), retryMaxAttempts: 15 } as InternalConfig; // Too high
    expect(validateConfig(config)).toBe(false);
  });

  it('should reject invalid retryDelay', () => {
    const config = { ...getConfig(), retryDelay: 50 } as InternalConfig; // Too low
    expect(validateConfig(config)).toBe(false);
  });
});

describe('getConfig and setConfig', () => {
  afterEach(() => {
    resetConfig();
  });

  it('should get default config', () => {
    const config = getConfig();
    expect(config.version).toBeDefined();
    expect(config.apiEndpoint).toBe('/api/v1');
  });

  it('should set config updates', () => {
    setConfig({ debug: true, apiTimeout: 10000 });
    const config = getConfig();
    expect(config.debug).toBe(true);
    expect(config.apiTimeout).toBe(10000);
  });
});

describe('initConfig', () => {
  let mockScriptElement: HTMLScriptElement;

  beforeEach(() => {
    resetConfig();
    mockScriptElement = document.createElement('script');
    mockScriptElement.setAttribute('data-debug', 'true');
    document.body.appendChild(mockScriptElement);
    (window as any).AdServerSDKConfig = { testMode: true };
  });

  afterEach(() => {
    document.body.removeChild(mockScriptElement);
    delete (window as any).AdServerSDKConfig;
    resetConfig();
  });

  it('should initialize config from script and global', () => {
    const config = initConfig(mockScriptElement);
    expect(config.debug).toBe(true); // From script
    expect(config.testMode).toBe(true); // From global
  });

  it('should handle missing script element', () => {
    const config = initConfig();
    expect(config.testMode).toBe(true); // From global
  });
});

describe('resetConfig', () => {
  it('should reset to defaults', () => {
    setConfig({ debug: true });
    expect(getConfig().debug).toBe(true);
    resetConfig();
    expect(getConfig().debug).toBe(false);
  });
});
