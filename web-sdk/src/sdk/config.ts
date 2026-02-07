/**
 * Config - Configuration management with merge logic
 */

export interface SDKConfig {
  // API Configuration
  apiEndpoint?: string;
  apiTimeout?: number;

  // Behavior
  debug?: boolean;
  testMode?: boolean;
  lazyLoad?: boolean;

  // Performance
  cacheEnabled?: boolean;
  cacheTTL?: number;

  // Retry
  retryEnabled?: boolean;
  retryMaxAttempts?: number;
  retryDelay?: number;

  // Rendering
  iframeMode?: boolean;
  fallbackEnabled?: boolean;

  // Events
  onInit?: () => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export interface InternalConfig extends Required<SDKConfig> {
  version: string;
  slotId?: string;
}

const DEFAULT_CONFIG: InternalConfig = {
  version: '0.1.0',

  // API
  apiEndpoint: '/api/v1',
  apiTimeout: 5000,

  // Behavior
  debug: false,
  testMode: false,
  lazyLoad: true,

  // Performance
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes

  // Retry
  retryEnabled: true,
  retryMaxAttempts: 3,
  retryDelay: 1000,

  // Rendering
  iframeMode: false,
  fallbackEnabled: true,

  // Events (no-ops by default)
  onInit: () => {},
  onReady: () => {},
  onError: () => {},
};

/**
 * Merge configs with priority: script attrs > global config > defaults
 */
export function mergeConfig(
  scriptAttrs: Partial<SDKConfig> = {},
  globalConfig: Partial<SDKConfig> = {}
): InternalConfig {
  return {
    ...DEFAULT_CONFIG,
    ...globalConfig,
    ...scriptAttrs,
    // Ensure functions are not overwritten by undefined
    onInit: scriptAttrs.onInit ?? globalConfig.onInit ?? DEFAULT_CONFIG.onInit,
    onReady: scriptAttrs.onReady ?? globalConfig.onReady ?? DEFAULT_CONFIG.onReady,
    onError: scriptAttrs.onError ?? globalConfig.onError ?? DEFAULT_CONFIG.onError,
  };
}

/**
 * Extract config from script attributes
 */
export function getScriptConfig(element: HTMLScriptElement): Partial<SDKConfig> {
  const config: Partial<SDKConfig> = {};

  // String attributes
  const apiEndpoint = element.getAttribute('data-api-endpoint');
  if (apiEndpoint) config.apiEndpoint = apiEndpoint;

  // Boolean attributes
  const debug = element.getAttribute('data-debug');
  if (debug !== null) config.debug = debug === 'true';

  const testMode = element.getAttribute('data-test-mode');
  if (testMode !== null) config.testMode = testMode === 'true';

  const lazyLoad = element.getAttribute('data-lazy-load');
  if (lazyLoad !== null) config.lazyLoad = lazyLoad === 'true';

  const cacheEnabled = element.getAttribute('data-cache-enabled');
  if (cacheEnabled !== null) config.cacheEnabled = cacheEnabled === 'true';

  const retryEnabled = element.getAttribute('data-retry-enabled');
  if (retryEnabled !== null) config.retryEnabled = retryEnabled === 'true';

  const iframeMode = element.getAttribute('data-iframe-mode');
  if (iframeMode !== null) config.iframeMode = iframeMode === 'true';

  const fallbackEnabled = element.getAttribute('data-fallback-enabled');
  if (fallbackEnabled !== null) config.fallbackEnabled = fallbackEnabled === 'true';

  // Number attributes
  const apiTimeout = element.getAttribute('data-api-timeout');
  if (apiTimeout) config.apiTimeout = parseInt(apiTimeout, 10);

  const cacheTTL = element.getAttribute('data-cache-ttl');
  if (cacheTTL) config.cacheTTL = parseInt(cacheTTL, 10);

  const retryMaxAttempts = element.getAttribute('data-retry-max-attempts');
  if (retryMaxAttempts) config.retryMaxAttempts = parseInt(retryMaxAttempts, 10);

  const retryDelay = element.getAttribute('data-retry-delay');
  if (retryDelay) config.retryDelay = parseInt(retryDelay, 10);

  return config;
}

/**
 * Get global config from window object
 */
export function getGlobalConfig(): Partial<SDKConfig> {
  if (typeof window === 'undefined') return {};

  const global = window as unknown as {
    AdServerSDKConfig?: Partial<SDKConfig>;
  };

  return global.AdServerSDKConfig ?? {};
}

/**
 * Validate config
 */
export function validateConfig(config: InternalConfig): boolean {
  // Validate API endpoint
  try {
    new URL(config.apiEndpoint, window.location.href);
  } catch {
    console.error('[AdServerSDK] Invalid apiEndpoint:', config.apiEndpoint);
    return false;
  }

  // Validate timeout
  if (config.apiTimeout < 100 || config.apiTimeout > 60000) {
    console.error('[AdServerSDK] apiTimeout must be between 100 and 60000ms');
    return false;
  }

  // Validate cache TTL
  if (config.cacheTTL < 0 || config.cacheTTL > 3600000) {
    console.error('[AdServerSDK] cacheTTL must be between 0 and 3600000ms (1 hour)');
    return false;
  }

  // Validate retry settings
  if (config.retryMaxAttempts < 0 || config.retryMaxAttempts > 10) {
    console.error('[AdServerSDK] retryMaxAttempts must be between 0 and 10');
    return false;
  }

  if (config.retryDelay < 100 || config.retryDelay > 60000) {
    console.error('[AdServerSDK] retryDelay must be between 100 and 60000ms');
    return false;
  }

  return true;
}

/**
 * Get config from script element with auto-detection
 */
export function initConfig(scriptElement?: HTMLScriptElement): InternalConfig {
  const scriptConfig = scriptElement ? getScriptConfig(scriptElement) : {};
  const globalConfig = getGlobalConfig();
  const merged = mergeConfig(scriptConfig, globalConfig);

  if (!validateConfig(merged)) {
    console.warn('[AdServerSDK] Invalid config detected, using defaults');
    return DEFAULT_CONFIG;
  }

  return merged;
}

// Global config storage
let currentConfig: InternalConfig = DEFAULT_CONFIG;

export function getConfig(): InternalConfig {
  return currentConfig;
}

export function setConfig(config: Partial<SDKConfig>): void {
  currentConfig = mergeConfig(config, getGlobalConfig());
}

export function resetConfig(): void {
  currentConfig = DEFAULT_CONFIG;
}
