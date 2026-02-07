/**
 * AdServer Web SDK - Lite Production Bundle
 * Core functionality only for minimal bundle size
 */

import { AdServerSDK } from './core.js';
import { initConfig } from './config.js';

// Initialize SDK
const sdk = AdServerSDK.getInstance();

// Auto-initialize with script attributes
if (typeof window !== 'undefined') {
  initConfig();
  (window as any).AdServerSDK = AdServerSDK;
  (window as any).adserver = sdk;
}

export { sdk as default };
