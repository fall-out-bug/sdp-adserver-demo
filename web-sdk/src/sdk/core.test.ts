import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AdServerSDK,
  getSDK,
  initSDK,
} from './core.js';
import { resetEventEmitter } from './events.js';
import { resetTelemetry, LogLevel } from './telemetry.js';
import { resetConfig } from './config.js';

describe('AdServerSDK', () => {
  let sdk: AdServerSDK;

  beforeEach(() => {
    AdServerSDK.reset();
    sdk = AdServerSDK.getInstance();
  });

  afterEach(() => {
    AdServerSDK.reset();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = AdServerSDK.getInstance();
      const instance2 = AdServerSDK.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('init', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      AdServerSDK.reset();
      resetEventEmitter();
      resetTelemetry();
      resetConfig();
      sdk = AdServerSDK.getInstance();
    });

    it('should initialize SDK', () => {
      expect(sdk.isInitialized()).toBe(false);
      sdk.init();
      expect(sdk.isInitialized()).toBe(true);
      expect(sdk.isReady()).toBe(true);
    });

    it('should emit init and ready events', () => {
      const initSpy = vi.fn();
      const readySpy = vi.fn();
      sdk.on('init', initSpy).on('ready', readySpy);
      sdk.init();
      expect(initSpy).toHaveBeenCalledTimes(1);
      expect(readySpy).toHaveBeenCalledTimes(1);
    });

    it('should call onInit and onReady callbacks', () => {
      const onInitSpy = vi.fn();
      const onReadySpy = vi.fn();
      sdk.init({ onInit: onInitSpy, onReady: onReadySpy });
      expect(onInitSpy).toHaveBeenCalledTimes(1);
      expect(onReadySpy).toHaveBeenCalledTimes(1);
    });

    it('should allow updating config on re-init', () => {
      sdk.init({ debug: false });
      expect(sdk.getConfig().debug).toBe(false);
      sdk.init({ debug: true });
      expect(sdk.getConfig().debug).toBe(true);
    });

    it('should throw error if destroyed', () => {
      sdk.init();
      sdk.destroy();
      expect(() => sdk.init()).toThrow('SDK has been destroyed');
    });

    it('should emit error and call onError on init error', () => {
      const errorCallback = vi.fn();
      const errorSpy = vi.fn();
      sdk.on('error', errorSpy);
      expect(() => sdk.init({
        onInit: () => {
          throw new Error('Init error');
        },
        onError: errorCallback,
      })).toThrow('Init error');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getConfig', () => {
    it('should return config after init', () => {
      sdk.init({ apiTimeout: 10000 });
      expect(sdk.getConfig().apiTimeout).toBe(10000);
    });

    it('should return default config before init', () => {
      const config = sdk.getConfig();
      expect(config.version).toBeDefined();
    });
  });

  describe('updateConfig', () => {
    it('should throw error if not initialized', () => {
      expect(() => sdk.updateConfig({ debug: true })).toThrow(
        'SDK not initialized'
      );
    });

    it('should update config after init', () => {
      sdk.init();
      sdk.updateConfig({ debug: true });
      expect(sdk.getConfig().debug).toBe(true);
    });
  });

  describe('events', () => {
    beforeEach(() => {
      sdk.init();
    });

    it('should register event listener with on', () => {
      const listener = vi.fn();
      // Event is emitted through internal emitter
      expect(() => sdk.on('test', listener)).not.toThrow();
    });

    it('should remove event listener with off', () => {
      const listener = vi.fn();
      sdk.on('test', listener).off('test', listener);
      // Should not throw
      expect(() => sdk.off('test', listener)).not.toThrow();
    });

    it('should register once listener with once', () => {
      const listener = vi.fn();
      sdk.once('test', listener);
      // Should not throw
      expect(() => sdk.once('test', listener)).not.toThrow();
    });
  });

  describe('logger', () => {
    it('should return logger instance', () => {
      expect(sdk.logger).toBeDefined();
    });

    it('should set debug level when debug is true', () => {
      sdk.init({ debug: true });
      expect(sdk.logger.getLevel()).toBe(LogLevel.DEBUG);
    });
  });

  describe('errorTracker', () => {
    it('should return error tracker instance', () => {
      expect(sdk.errorTracker).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should emit destroy event', () => {
      const destroySpy = vi.fn();
      sdk.init().on('destroy', destroySpy);
      sdk.destroy();
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should reset state', () => {
      sdk.init();
      sdk.destroy();
      expect(sdk.isInitialized()).toBe(false);
      expect(sdk.isReady()).toBe(false);
      expect(sdk.isDestroyed()).toBe(true);
    });

    it('should be idempotent', () => {
      sdk.init();
      sdk.destroy();
      expect(() => sdk.destroy()).not.toThrow();
    });

    it('should clear singleton', () => {
      sdk.init();
      sdk.destroy();
      const newSdk = AdServerSDK.getInstance();
      expect(newSdk).not.toBe(sdk);
      expect(newSdk.isInitialized()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset SDK and all singletons', () => {
      sdk.init();
      AdServerSDK.reset();
      expect(AdServerSDK.getInstance()).not.toBe(sdk);
      expect(AdServerSDK.getInstance().isInitialized()).toBe(false);
    });
  });

  describe('debug utilities', () => {
    beforeEach(() => {
      sdk.init();
    });

    it('should return SDK info', () => {
      const info = sdk.debug.info();
      expect(info.version).toBeDefined();
      expect(info.initialized).toBe(true);
      expect(info.ready).toBe(true);
      expect(info.destroyed).toBe(false);
      expect(info.config).toBeDefined();
    });

    it('should return logs', () => {
      sdk.logger.setLevel(LogLevel.DEBUG);
      sdk.logger.info('test log');
      const logs = sdk.debug.logs();
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should return errors', () => {
      sdk.errorTracker.capture(new Error('test error'));
      const errors = sdk.debug.errors();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should clear logs and errors', () => {
      sdk.logger.setLevel(LogLevel.DEBUG);
      sdk.logger.info('test log');
      sdk.errorTracker.capture(new Error('test error'));
      sdk.debug.clear();
      expect(sdk.debug.logs()).toHaveLength(0);
      expect(sdk.debug.errors()).toHaveLength(0);
    });
  });
});

describe('Convenience functions', () => {
  afterEach(() => {
    AdServerSDK.reset();
  });

  describe('getSDK', () => {
    it('should return SDK instance', () => {
      const sdk = getSDK();
      expect(sdk).toBeInstanceOf(AdServerSDK);
    });

    it('should return same instance on multiple calls', () => {
      const sdk1 = getSDK();
      const sdk2 = getSDK();
      expect(sdk1).toBe(sdk2);
    });
  });

  describe('initSDK', () => {
    it('should initialize and return SDK', () => {
      const sdk = initSDK({ debug: true });
      expect(sdk.isInitialized()).toBe(true);
      expect(sdk.getConfig().debug).toBe(true);
    });
  });
});
