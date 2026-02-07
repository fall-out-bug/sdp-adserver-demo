/**
 * AdServer Web SDK
 * Lightweight JavaScript SDK for ad delivery
 */

// Core exports
export { AdServerSDK, getSDK, initSDK } from './core.js';

// Config exports
export {
  type SDKConfig,
  type InternalConfig,
  mergeConfig,
  getScriptConfig,
  getGlobalConfig,
  initConfig,
  getConfig,
  setConfig,
  validateConfig,
} from './config.js';

// Events exports
export { EventEmitter, getEventEmitter, resetEventEmitter } from './events.js';

// Telemetry exports
export {
  Logger,
  ErrorTracker,
  LogLevel,
  getLogger,
  getErrorTracker,
  resetTelemetry,
  type LogEntry,
  type LoggerConfig,
  type ErrorEntry,
} from './telemetry.js';

// Cache exports
export {
  getCachedBanner,
  setCachedBanner,
  removeCachedBanner,
  clearCache,
  getCacheSize,
  type CachedBanner,
} from './cache.js';

// Client exports
export {
  fetchBanner,
  fetchBannerCached,
  getDeliveryURL,
  createDeliveryRequest,
  type DeliveryRequest,
  type DeliveryResponse,
} from './client.js';

// Loader exports
export {
  loadScript,
  preloadScript,
  loadScripts,
  loadScriptsWithPriority,
  getLoadState,
  getLoadStateDetails,
  getLoadMetrics,
  clearLoadStates,
  type LoadOptions,
  type LoadState,
} from './loader.js';

// Render exports
export {
  renderBanner,
  detectContainerSize,
  autoRender,
  type RenderOptions,
  type RenderResult,
} from './render.js';

// Fallback exports
export {
  getFallbackHTML,
  renderFallback,
  createFallbackElement,
  showPSA,
  type FallbackConfig,
} from './fallback.js';

// Injection exports
export {
  injectDirect,
  trackImpression,
  applyStyleIsolation,
  type DirectInjectionOptions,
} from './injection/direct.js';

export {
  injectInIframe,
  setupIframeMessageListener,
  createResponsiveIframe,
  cleanupIframe,
  type IframeInjectionOptions,
} from './injection/iframe.js';

// Version
export const VERSION = '0.1.0';

// Global singleton
const sdk = AdServerSDK.getInstance();

// Auto-expose to window for browser usage
if (typeof window !== 'undefined') {
  (window as any).AdServerSDK = AdServerSDK;
  (window as any).adserver = sdk;
}

export default sdk;
