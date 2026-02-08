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
  (window as unknown as { AdServerSDK: typeof AdServerSDK; adserver: typeof sdk }).AdServerSDK = AdServerSDK;
  (window as unknown as { adserver: typeof sdk }).adserver = sdk;
}

export { sdk as default };
