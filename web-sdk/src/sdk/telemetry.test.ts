import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  Logger,
  ErrorTracker,
  LogLevel,
  getLogger,
  getErrorTracker,
  resetTelemetry,
} from './telemetry.js';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger = new Logger({ level: LogLevel.DEBUG, enableConsole: true });
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {}) as any;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      logger.debug('test debug');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe(LogLevel.DEBUG);
      expect(entries[0].message).toBe('test debug');
    });

    it('should log info messages', () => {
      logger.info('test info');
      const entries = logger.getEntries();
      expect(entries[0].level).toBe(LogLevel.INFO);
    });

    it('should log warning messages', () => {
      logger.warn('test warn');
      const entries = logger.getEntries();
      expect(entries[0].level).toBe(LogLevel.WARN);
    });

    it('should log error messages', () => {
      const error = new Error('test error');
      logger.error('test error', error);
      const entries = logger.getEntries();
      expect(entries[0].level).toBe(LogLevel.ERROR);
      expect(entries[0].error).toBe(error);
    });

    it('should log error with string input', () => {
      logger.error('string error', 'error string');
      const entries = logger.getEntries();
      expect(entries[0].error).toBeUndefined();
    });

    it('should respect log level', () => {
      const warnLogger = new Logger({ level: LogLevel.WARN });
      warnLogger.debug('should not log');
      warnLogger.info('should not log');
      warnLogger.warn('should log');
      warnLogger.error('should log');
      expect(warnLogger.getEntries()).toHaveLength(2);
    });

    it('should not log when level is SILENT', () => {
      const silentLogger = new Logger({ level: LogLevel.SILENT });
      silentLogger.error('should not log');
      expect(silentLogger.getEntries()).toHaveLength(0);
    });
  });

  describe('setLevel', () => {
    it('should change log level', () => {
      logger.setLevel(LogLevel.ERROR);
      expect(logger.getLevel()).toBe(LogLevel.ERROR);
      logger.info('should not log');
      logger.error('should log');
      expect(logger.getEntries()).toHaveLength(1);
    });
  });

  describe('context', () => {
    it('should store context with log entry', () => {
      const context = { userId: '123', action: 'click' };
      logger.info('user action', context);
      const entries = logger.getEntries();
      expect(entries[0].context).toEqual(context);
    });
  });

  describe('getEntries', () => {
    it('should return copy of entries', () => {
      logger.info('test');
      const entries1 = logger.getEntries();
      const entries2 = logger.getEntries();
      expect(entries1).not.toBe(entries2);
      expect(entries1).toEqual(entries2);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      logger.info('test1');
      logger.info('test2');
      logger.clear();
      expect(logger.getEntries()).toHaveLength(0);
    });
  });

  describe('getEntriesByLevel', () => {
    it('should filter entries by level', () => {
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      expect(logger.getEntriesByLevel(LogLevel.ERROR)).toHaveLength(1);
      expect(logger.getEntriesByLevel(LogLevel.INFO)).toHaveLength(1);
    });
  });

  describe('max entries limit', () => {
    it('should limit entries to maxEntries', () => {
      const limitedLogger = new Logger({ maxEntries: 5, level: LogLevel.INFO, enableConsole: false });
      for (let i = 0; i < 10; i++) {
        limitedLogger.info(`entry ${i}`);
      }
      expect(limitedLogger.getEntries()).toHaveLength(5);
      expect(limitedLogger.getEntries()[0].message).toBe('entry 5');
    });
  });
});

describe('ErrorTracker', () => {
  let tracker: ErrorTracker;

  beforeEach(() => {
    tracker = new ErrorTracker();
  });

  describe('capture', () => {
    it('should capture Error object', () => {
      const error = new Error('test error');
      tracker.capture(error);
      const errors = tracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('test error');
      expect(errors[0].stack).toBeDefined();
    });

    it('should capture string as error', () => {
      tracker.capture('string error');
      const errors = tracker.getErrors();
      expect(errors[0].message).toBe('string error');
    });

    it('should capture with context', () => {
      const error = new Error('test');
      const context = { userId: '123' };
      tracker.capture(error, context);
      const errors = tracker.getErrors();
      expect(errors[0].context).toEqual(context);
    });

    it('should limit errors to maxErrors', () => {
      const limitedTracker = new ErrorTracker();
      (limitedTracker as any)._maxErrors = 5;
      for (let i = 0; i < 10; i++) {
        limitedTracker.capture(new Error(`error ${i}`));
      }
      expect(limitedTracker.getErrors()).toHaveLength(5);
      expect(limitedTracker.getErrors()[0].message).toBe('error 5');
    });
  });

  describe('getErrors', () => {
    it('should return copy of errors', () => {
      tracker.capture(new Error('test'));
      const errors1 = tracker.getErrors();
      const errors2 = tracker.getErrors();
      expect(errors1).not.toBe(errors2);
      expect(errors1).toEqual(errors2);
    });
  });

  describe('clear', () => {
    it('should clear all errors', () => {
      tracker.capture(new Error('test1'));
      tracker.capture(new Error('test2'));
      tracker.clear();
      expect(tracker.getErrors()).toHaveLength(0);
    });
  });

  describe('getCount', () => {
    it('should return error count', () => {
      expect(tracker.getCount()).toBe(0);
      tracker.capture(new Error('test'));
      expect(tracker.getCount()).toBe(1);
    });
  });
});

describe('Global Telemetry', () => {
  afterEach(() => {
    resetTelemetry();
  });

  it('should share singleton logger', () => {
    const logger1 = getLogger();
    const logger2 = getLogger();
    expect(logger1).toBe(logger2);
  });

  it('should share singleton error tracker', () => {
    const tracker1 = getErrorTracker();
    const tracker2 = getErrorTracker();
    expect(tracker1).toBe(tracker2);
  });

  it('should reset singletons', () => {
    const logger1 = getLogger();
    const tracker1 = getErrorTracker();
    resetTelemetry();
    const logger2 = getLogger();
    const tracker2 = getErrorTracker();
    expect(logger2).not.toBe(logger1);
    expect(tracker2).not.toBe(tracker1);
  });
});
