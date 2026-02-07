/**
 * Core - Main SDK class with singleton pattern
 */

import { EventEmitter, getEventEmitter, resetEventEmitter } from './events.js';
import {
  Logger,
  ErrorTracker,
  getLogger,
  getErrorTracker,
  resetTelemetry,
  LogLevel,
} from './telemetry.js';
import {
  initConfig,
  getConfig,
  setConfig,
  InternalConfig,
  SDKConfig,
  resetConfig,
} from './config.js';

export interface SDKInitOptions extends SDKConfig {
  slotId?: string;
}

/**
 * AdServerSDK main class
 * Singleton pattern ensures only one instance
 */
export class AdServerSDK {
  private static _instance: AdServerSDK | null = null;
  private _initialized: boolean = false;
  private _ready: boolean = false;
  private _destroyed: boolean = false;
  private _emitter: EventEmitter;
  private _logger: Logger;
  private _errorTracker: ErrorTracker;

  private constructor() {
    this._emitter = getEventEmitter();
    this._logger = getLogger();
    this._errorTracker = getErrorTracker();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AdServerSDK {
    if (!AdServerSDK._instance) {
      AdServerSDK._instance = new AdServerSDK();
    }
    return AdServerSDK._instance;
  }

  /**
   * Initialize SDK with configuration
   */
  init(options: SDKInitOptions = {}): this {
    if (this._initialized) {
      this._logger.warn('SDK already initialized, updating config');
      setConfig(options);
      return this;
    }

    if (this._destroyed) {
      throw new Error('SDK has been destroyed, cannot reinitialize');
    }

    try {
      // Initialize config
      const config = initConfig();
      if (options.slotId) {
        (config as InternalConfig).slotId = options.slotId;
      }
      setConfig(options);

      // Setup logger with debug level if needed
      if (getConfig().debug) {
        this._logger.setLevel(LogLevel.DEBUG);
      }

      this._initialized = true;
      this._ready = true;

      this._logger.info('SDK initialized', { version: getConfig().version });
      this._emitter.emit('init', getConfig());
      this._emitter.emit('ready', getConfig());

      // Call onInit callback
      try {
        getConfig().onInit();
      } catch (error) {
        this._logger.error('onInit callback error', error);
        // Re-throw to be caught by outer try-catch
        throw error;
      }

      // Call onReady callback
      try {
        getConfig().onReady();
      } catch (error) {
        this._logger.error('onReady callback error', error);
        // Re-throw to be caught by outer try-catch
        throw error;
      }

      return this;
    } catch (error) {
      this._errorTracker.capture(error, { context: 'init' });
      this._emitter.emit('error', error);

      // Call onError callback
      try {
        getConfig().onError(error as Error);
      } catch (callbackError) {
        console.error('Error in onError callback:', callbackError);
      }

      throw error;
    }
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    return this._ready;
  }

  /**
   * Check if SDK is destroyed
   */
  isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * Get current config
   */
  getConfig(): InternalConfig {
    return getConfig();
  }

  /**
   * Update config dynamically
   */
  updateConfig(options: Partial<SDKConfig>): void {
    if (!this._initialized) {
      throw new Error('SDK not initialized, call init() first');
    }
    setConfig(options);
    this._logger.debug('Config updated', { options });
  }

  /**
   * Event listener methods
   */
  on(event: string, listener: (...args: unknown[]) => void): this {
    this._emitter.on(event, listener);
    return this;
  }

  once(event: string, listener: (...args: unknown[]) => void): this {
    this._emitter.once(event, listener);
    return this;
  }

  off(event: string, listener?: (...args: unknown[]) => void): this {
    this._emitter.off(event, listener);
    return this;
  }

  /**
   * Get logger instance
   */
  get logger(): Logger {
    return this._logger;
  }

  /**
   * Get error tracker instance
   */
  get errorTracker(): ErrorTracker {
    return this._errorTracker;
  }

  /**
   * Destroy SDK and cleanup resources
   */
  destroy(): void {
    if (this._destroyed) return;

    this._logger.info('Destroying SDK');
    this._emitter.emit('destroy');

    this._emitter.removeAllListeners();
    this._initialized = false;
    this._ready = false;
    this._destroyed = true;

    AdServerSDK._instance = null;
  }

  /**
   * Reset SDK (for testing)
   */
  static reset(): void {
    if (AdServerSDK._instance) {
      AdServerSDK._instance.destroy();
    }
    resetEventEmitter();
    resetTelemetry();
    resetConfig();
    AdServerSDK._instance = null;
  }

  /**
   * Debug utilities
   */
  get debug() {
    return {
      info: () => ({
        version: getConfig().version,
        initialized: this._initialized,
        ready: this._ready,
        destroyed: this._destroyed,
        config: getConfig(),
      }),
      logs: () => this._logger.getEntries(),
      errors: () => this._errorTracker.getErrors(),
      clear: () => {
        this._logger.clear();
        this._errorTracker.clear();
      },
    };
  }
}

/**
 * Convenience function to get SDK instance
 */
export function getSDK(): AdServerSDK {
  return AdServerSDK.getInstance();
}

/**
 * Convenience function to initialize SDK
 */
export function initSDK(options?: SDKInitOptions): AdServerSDK {
  return AdServerSDK.getInstance().init(options);
}
