import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DebugManager,
  getDebugManager,
  resetDebugManager,
  LogLevel,
  type DebugConfig,
  type DebugEvent,
} from './debug/index.js';

describe('DebugManager', () => {
  let debugManager: DebugManager;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugManager = new DebugManager({ enabled: true });
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {}) as any;
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {}) as any;
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}) as any;
    vi.stubGlobal('window', {
      location: { href: 'http://localhost' },
    });
    vi.stubGlobal('performance', {
      now: vi.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 10000000,
      },
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const defaultManager = new DebugManager();
      expect(defaultManager.isEnabled()).toBe(false);
      expect(defaultManager.getLogLevel()).toBe(LogLevel.INFO);
    });

    it('should initialize with custom config', () => {
      const customManager = new DebugManager({
        enabled: true,
        logLevel: LogLevel.DEBUG,
        enableOverlay: true,
      });
      expect(customManager.isEnabled()).toBe(true);
      expect(customManager.getLogLevel()).toBe(LogLevel.DEBUG);
    });
  });

  describe('isEnabled', () => {
    it('should return enabled state', () => {
      expect(debugManager.isEnabled()).toBe(true);
      debugManager.disable();
      expect(debugManager.isEnabled()).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable debug mode', () => {
      debugManager.disable();
      debugManager.enable();
      expect(debugManager.isEnabled()).toBe(true);
    });

    it('should disable debug mode', () => {
      debugManager.disable();
      expect(debugManager.isEnabled()).toBe(false);
    });
  });

  describe('log level', () => {
    it('should set log level', () => {
      debugManager.setLogLevel(LogLevel.ERROR);
      expect(debugManager.getLogLevel()).toBe(LogLevel.ERROR);
    });

    it('should get log level', () => {
      expect(debugManager.getLogLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('logging', () => {
    it('should log debug message', () => {
      debugManager.setLogLevel(LogLevel.DEBUG);
      debugManager.debug('test debug', { foo: 'bar' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info message', () => {
      debugManager.info('test info');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warning message', () => {
      debugManager.warn('test warn');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error message', () => {
      debugManager.error('test error', new Error('test'));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect log level for filtering', () => {
      debugManager.setLogLevel(LogLevel.ERROR);
      debugManager.debug('should not log');
      debugManager.info('should not log');
      debugManager.warn('should not log');
      debugManager.error('should log');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should not log when disabled', () => {
      debugManager.disable();
      debugManager.info('should not log');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('events', () => {
    it('should record debug event', () => {
      debugManager.recordEvent('init', { test: 'data' });
      const events = debugManager.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('init');
      expect(events[0].data).toEqual({ test: 'data' });
    });

    it('should get events by type', () => {
      debugManager.recordEvent('init', { step: 1 });
      debugManager.recordEvent('render', { step: 2 });
      debugManager.recordEvent('init', { step: 3 });

      const initEvents = debugManager.getEventsByType('init');
      expect(initEvents).toHaveLength(2);
    });

    it('should clear events', () => {
      debugManager.recordEvent('test', {});
      debugManager.clearEvents();
      expect(debugManager.getEvents()).toHaveLength(0);
    });

    it('should limit events to maxEvents', () => {
      const limitedManager = new DebugManager({ enabled: true, maxEvents: 5 });
      for (let i = 0; i < 10; i++) {
        limitedManager.recordEvent('test', { id: i });
      }
      expect(limitedManager.getEvents()).toHaveLength(5);
      expect(limitedManager.getEvents()[0].data).toEqual({ id: 5 });
    });
  });

  describe('overlay', () => {
    it('should show overlay when enabled', () => {
      const result = debugManager.showOverlay();
      expect(result).toBe(true);
      expect(debugManager.isOverlayVisible()).toBe(true);
    });

    it('should hide overlay', () => {
      debugManager.showOverlay();
      debugManager.hideOverlay();
      expect(debugManager.isOverlayVisible()).toBe(false);
    });

    it('should toggle overlay', () => {
      debugManager.toggleOverlay();
      expect(debugManager.isOverlayVisible()).toBe(true);
      debugManager.toggleOverlay();
      expect(debugManager.isOverlayVisible()).toBe(false);
    });

    it('should update overlay data', () => {
      debugManager.showOverlay();
      debugManager.updateOverlay({ status: 'active', requests: 5 });
      const overlay = debugManager.getOverlayState();
      expect(overlay?.visible).toBe(true);
      expect(overlay?.data).toEqual({ status: 'active', requests: 5 });
    });

    it('should not show overlay when enableOverlay is false', () => {
      const noOverlayManager = new DebugManager({ enabled: true, enableOverlay: false });
      const result = noOverlayManager.showOverlay();
      expect(result).toBe(false);
    });
  });

  describe('timers', () => {
    it('should start and stop timer', () => {
      debugManager.startTimer('test-timer');
      const elapsed = debugManager.stopTimer('test-timer');
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });

    it('should measure timer', () => {
      debugManager.startTimer('measure-test');
      const measured = debugManager.measureTimer('measure-test');
      expect(measured).toBeGreaterThanOrEqual(0);
    });

    it('should get all timers', () => {
      debugManager.startTimer('timer1');
      debugManager.startTimer('timer2');
      const timers = debugManager.getTimers();
      expect(timers).toHaveLength(2);
      expect(timers[0].name).toBe('timer1');
    });

    it('should clear timer', () => {
      debugManager.startTimer('to-clear');
      debugManager.clearTimer('to-clear');
      expect(debugManager.getTimers()).toHaveLength(0);
    });

    it('should clear all timers', () => {
      debugManager.startTimer('timer1');
      debugManager.startTimer('timer2');
      debugManager.clearAllTimers();
      expect(debugManager.getTimers()).toHaveLength(0);
    });

    it('should throw error when stopping non-existent timer', () => {
      expect(() => debugManager.stopTimer('non-existent')).toThrow();
    });

    it('should throw error when measuring non-existent timer', () => {
      expect(() => debugManager.measureTimer('non-existent')).toThrow();
    });
  });

  describe('counters', () => {
    it('should increment counter', () => {
      debugManager.incrementCounter('clicks');
      expect(debugManager.getCounter('clicks')).toBe(1);
      debugManager.incrementCounter('clicks', 5);
      expect(debugManager.getCounter('clicks')).toBe(6);
    });

    it('should decrement counter', () => {
      debugManager.incrementCounter('errors', 10);
      debugManager.decrementCounter('errors');
      expect(debugManager.getCounter('errors')).toBe(9);
      debugManager.decrementCounter('errors', 3);
      expect(debugManager.getCounter('errors')).toBe(6);
    });

    it('should reset counter', () => {
      debugManager.incrementCounter('test', 5);
      debugManager.resetCounter('test');
      expect(debugManager.getCounter('test')).toBe(0);
    });

    it('should get all counters', () => {
      debugManager.incrementCounter('counter1', 3);
      debugManager.incrementCounter('counter2', 7);
      const counters = debugManager.getCounters();
      expect(counters).toEqual({ counter1: 3, counter2: 7 });
    });

    it('should clear all counters', () => {
      debugManager.incrementCounter('test', 5);
      debugManager.clearCounters();
      expect(debugManager.getCounters()).toEqual({});
    });
  });

  describe('memory tracking', () => {
    it('should track memory usage', () => {
      debugManager.trackMemory('init');
      const usage = debugManager.getMemoryUsage('init');
      expect(usage).toBeGreaterThanOrEqual(0);
    });

    it('should get memory diff', () => {
      debugManager.trackMemory('start');
      // Simulate some memory allocation
      new Array(1000).fill('test');
      debugManager.trackMemory('end');
      const diff = debugManager.getMemoryDiff('start', 'end');
      expect(diff).toBeGreaterThanOrEqual(0);
    });

    it('should get all memory snapshots', () => {
      debugManager.trackMemory('snapshot1');
      debugManager.trackMemory('snapshot2');
      const snapshots = debugManager.getMemorySnapshots();
      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].label).toBe('snapshot1');
    });
  });

  describe('visual debugging', () => {
    it('should highlight element', () => {
      const mockElement = {
        style: {},
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      };
      debugManager.highlightElement(mockElement as any, 'red');
      expect(mockElement.classList.add).toHaveBeenCalled();
    });

    it('should unhighlight element', () => {
      const mockElement = {
        style: {},
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      };
      debugManager.highlightElement(mockElement as any, 'red');
      debugManager.unhighlightElement(mockElement as any);
      expect(mockElement.classList.remove).toHaveBeenCalled();
    });

    it('should create debug border around element', () => {
      const mockElement = {
        style: {},
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      };
      debugManager.debugBorder(mockElement as any, { color: 'blue', width: '2px' });
      expect(mockElement.classList.add).toHaveBeenCalledWith(
        'ads-debug-border',
        'ads-debug-border-blue'
      );
    });
  });

  describe('export/import', () => {
    it('should export debug data', () => {
      debugManager.recordEvent('test', { data: 'value' });
      debugManager.incrementCounter('clicks', 5);
      const exported = debugManager.export();
      expect(exported.events).toHaveLength(1);
      expect(exported.counters).toEqual({ clicks: 5 });
      expect(exported.config.enabled).toBe(true);
    });

    it('should import debug data', () => {
      const data = {
        events: [
          { type: 'imported', timestamp: Date.now(), data: { test: true } },
        ] as DebugEvent[],
        counters: { imported: 10 },
        config: { enabled: true, logLevel: LogLevel.DEBUG } as DebugConfig,
      };
      debugManager.import(data);
      expect(debugManager.getEvents()).toHaveLength(1);
      expect(debugManager.getCounter('imported')).toBe(10);
    });

    it('should get JSON export', () => {
      debugManager.recordEvent('json-test', {});
      const json = debugManager.toJSON();
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.events).toHaveLength(1);
    });
  });

  describe('reset', () => {
    it('should reset all debug data', () => {
      debugManager.recordEvent('test', {});
      debugManager.incrementCounter('test', 5);
      debugManager.startTimer('test');
      debugManager.reset();

      expect(debugManager.getEvents()).toHaveLength(0);
      expect(debugManager.getCounters()).toEqual({});
      expect(debugManager.getTimers()).toHaveLength(0);
    });
  });

  describe('statistics', () => {
    it('should get statistics', () => {
      debugManager.recordEvent('event1', {});
      debugManager.recordEvent('event2', {});
      debugManager.incrementCounter('counter1', 5);
      const stats = debugManager.getStatistics();
      expect(stats.totalEvents).toBe(2);
      expect(stats.totalCounters).toBe(1);
      expect(stats.totalTimers).toBe(0);
    });
  });
});

describe('Global DebugManager', () => {
  afterEach(() => {
    resetDebugManager();
  });

  it('should share singleton instance', () => {
    const manager1 = getDebugManager();
    const manager2 = getDebugManager();
    expect(manager1).toBe(manager2);
  });

  it('should reset singleton', () => {
    const manager1 = getDebugManager();
    manager1.recordEvent('test', {});
    resetDebugManager();
    const manager2 = getDebugManager();
    expect(manager2).not.toBe(manager1);
    expect(manager2.getEvents()).toHaveLength(0);
  });

  it('should initialize with config', () => {
    const manager = getDebugManager({ enabled: true, logLevel: LogLevel.DEBUG });
    expect(manager.isEnabled()).toBe(true);
    expect(manager.getLogLevel()).toBe(LogLevel.DEBUG);
  });
});
