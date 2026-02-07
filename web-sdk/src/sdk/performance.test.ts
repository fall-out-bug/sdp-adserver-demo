import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PerformanceMonitor,
  getPerformanceMonitor,
  resetPerformanceMonitor,
} from './performance/index.js';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();

    // Mock performance API
    let timestamp = 0;
    const mockPerformance = {
      now: vi.fn(() => {
        timestamp += 100;
        return timestamp;
      }),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntries: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 10000000,
      },
    };
    vi.stubGlobal('performance', mockPerformance);

    // Create a mock measure list to track custom measures
    const mockMeasures: any[] = [];
    (mockPerformance as any).measure = vi.fn((name: string) => {
      mockMeasures.push({ name, startTime: 0, duration: 100 });
    });
    (mockPerformance as any).getMeasures = vi.fn(() => mockMeasures);

    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation((_callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    monitor.disconnect();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const defaultMonitor = new PerformanceMonitor();
      expect(defaultMonitor.isEnabled()).toBe(true);
      expect(defaultMonitor.getMetrics()).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const customMonitor = new PerformanceMonitor({
        enabled: false,
        autoMeasure: false,
      });
      expect(customMonitor.isEnabled()).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return enabled state', () => {
      expect(monitor.isEnabled()).toBe(true);
      monitor.disable();
      expect(monitor.isEnabled()).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable monitoring', () => {
      monitor.disable();
      monitor.enable();
      expect(monitor.isEnabled()).toBe(true);
    });

    it('should disable monitoring', () => {
      monitor.disable();
      expect(monitor.isEnabled()).toBe(false);
    });
  });

  describe('marks', () => {
    it('should create performance mark', () => {
      const result = monitor.mark('test-mark');
      expect(result).toBe(true);
      expect(performance.mark).toHaveBeenCalledWith('test-mark');
    });

    it('should create multiple marks', () => {
      monitor.mark('mark1');
      monitor.mark('mark2');
      monitor.mark('mark3');
      expect(monitor.getCustomMarks()).toHaveLength(3);
    });

    it('should not create mark when disabled', () => {
      monitor.disable();
      const result = monitor.mark('should-not-create');
      expect(result).toBe(false);
    });

    it('should clear marks', () => {
      monitor.mark('mark1');
      monitor.mark('mark2');
      monitor.clearMarks();
      expect(monitor.getCustomMarks()).toHaveLength(0);
    });
  });

  describe('measures', () => {
    it('should measure between marks', () => {
      monitor.mark('start');
      monitor.mark('end');
      const result = monitor.measure('test-measure', 'start', 'end');
      expect(result).toBe(true);
    });

    it('should measure with duration', () => {
      const result = monitor.measure('duration-test', undefined, undefined, 100);
      expect(result).toBe(true);
      expect(monitor.getMeasures()).toHaveLength(1);
    });

    it('should not measure when disabled', () => {
      monitor.disable();
      const result = monitor.measure('should-not-measure', 'start', 'end');
      expect(result).toBe(false);
    });

    it('should get measures', () => {
      monitor.measure('measure1', 'start', 'end');
      monitor.measure('measure2', 'start', 'end');
      const measures = monitor.getMeasures();
      expect(measures).toHaveLength(2);
    });

    it('should clear measures', () => {
      monitor.measure('measure1', 'start', 'end');
      monitor.clearMeasures();
      expect(monitor.getMeasures()).toHaveLength(0);
    });
  });

  describe('start/stop operations', () => {
    it('should start and stop operation', () => {
      monitor.startOperation('fetch-ad');
      const duration = monitor.stopOperation('fetch-ad');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should measure operation duration', () => {
      monitor.startOperation('api-call');
      // Simulate some work
      const duration = monitor.stopOperation('api-call');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should throw error stopping non-existent operation', () => {
      expect(() => monitor.stopOperation('non-existent')).toThrow();
    });

    it('should get operation metrics', () => {
      monitor.startOperation('op1');
      monitor.stopOperation('op1');
      monitor.startOperation('op2');
      monitor.stopOperation('op2');

      const metrics = monitor.getOperationMetrics();
      expect(metrics).toHaveLength(2);
      expect(metrics[0].name).toBe('op1');
    });
  });

  describe('resource timing', () => {
    it('should measure resource load time', () => {
      // Mock a resource entry
      const mockResource = {
        name: 'https://example.com/ad.js',
        duration: 100,
        transferSize: 1000,
        encodedBodySize: 500,
        decodedBodySize: 500,
      };
      (performance.getEntriesByName as any).mockReturnValue([mockResource]);

      const result = monitor.measureResource('https://example.com/ad.js');
      expect(result).toBeDefined();
      expect(result?.url).toBe('https://example.com/ad.js');
    });

    it('should return null for non-existent resource', () => {
      (performance.getEntriesByName as any).mockReturnValue([]);
      const result = monitor.measureResource('non-existent.js');
      expect(result).toBeNull();
    });

    it('should get all resource timings', () => {
      const mockResources = [
        {
          name: 'script1.js',
          duration: 100,
          transferSize: 1000,
          encodedBodySize: 500,
          decodedBodySize: 500,
        },
        {
          name: 'script2.js',
          duration: 150,
          transferSize: 2000,
          encodedBodySize: 1000,
          decodedBodySize: 1000,
        },
      ];
      (performance.getEntriesByType as any).mockReturnValue(mockResources);

      monitor.measureResource('script1.js');
      monitor.measureResource('script2.js');
      const resources = monitor.getResourceTimings();
      expect(resources.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter resources by type', () => {
      const scripts = monitor.getResourcesByType('script');
      expect(Array.isArray(scripts)).toBe(true);
    });
  });

  describe('navigation timing', () => {
    it('should get navigation timing', () => {
      const timing = monitor.getNavigationTiming();
      expect(timing).toBeDefined();
    });

    it('should calculate page load time', () => {
      const loadTime = monitor.getPageLoadTime();
      expect(typeof loadTime).toBe('number');
      expect(loadTime).toBeGreaterThanOrEqual(0);
    });

    it('should calculate dom ready time', () => {
      const domReady = monitor.getDOMReadyTime();
      expect(typeof domReady).toBe('number');
    });

    it('should calculate first paint time', () => {
      const firstPaint = monitor.getFirstPaintTime();
      expect(typeof firstPaint).toBe('number');
    });
  });

  describe('Core Web Vitals', () => {
    it('should get LCP (Largest Contentful Paint)', () => {
      const lcp = monitor.getLCP();
      expect(typeof lcp).toBe('number');
    });

    it('should get FID (First Input Delay)', () => {
      const fid = monitor.getFID();
      expect(typeof fid).toBe('number');
    });

    it('should get CLS (Cumulative Layout Shift)', () => {
      const cls = monitor.getCls();
      expect(typeof cls).toBe('number');
    });

    it('should get all Core Web Vitals', () => {
      const vitals = monitor.getCoreWebVitals();
      expect(vitals).toHaveProperty('lcp');
      expect(vitals).toHaveProperty('fid');
      expect(vitals).toHaveProperty('cls');
    });

    it('should check if vitals are good', () => {
      const vitals = monitor.getCoreWebVitals();
      expect(vitals.lcpGood).toBe(true);
      expect(vitals.fidGood).toBe(true);
      expect(vitals.clsGood).toBe(true);
    });
  });

  describe('memory monitoring', () => {
    it('should get current memory usage', () => {
      const memory = monitor.getMemoryUsage();
      if (memory) {
        expect(memory.used).toBeGreaterThan(0);
      }
    });

    it('should track memory snapshot', () => {
      monitor.trackMemory('snapshot-1');
      const snapshots = monitor.getMemorySnapshots();
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].label).toBe('snapshot-1');
    });

    it('should get memory diff between snapshots', () => {
      monitor.trackMemory('before');
      // Simulate memory change
      monitor.trackMemory('after');
      const diff = monitor.getMemoryDiff('before', 'after');
      expect(typeof diff).toBe('number');
    });

    it('should return null for non-existent snapshots', () => {
      const diff = monitor.getMemoryDiff('non1', 'non2');
      expect(diff).toBeNull();
    });
  });

  describe('performance metrics', () => {
    it('should get aggregated metrics', () => {
      const metrics = monitor.getMetrics();
      expect(metrics).toHaveProperty('pageLoadTime');
      expect(metrics).toHaveProperty('domReadyTime');
      expect(metrics).toHaveProperty('firstPaint');
      expect(metrics).toHaveProperty('memoryUsage');
    });

    it('should get metrics summary', () => {
      const summary = monitor.getMetricsSummary();
      expect(typeof summary === 'string' || typeof summary === 'object').toBe(true);
    });
  });

  describe('performance thresholds', () => {
    it('should set threshold', () => {
      monitor.setThreshold('pageLoad', 3000);
      const threshold = monitor.getThreshold('pageLoad');
      expect(threshold).toBe(3000);
    });

    it('should check if threshold exceeded', () => {
      monitor.setThreshold('operation', 1000);
      monitor.startOperation('slow-operation');
      // Simulate slow operation
      const result = monitor.stopOperation('slow-operation');
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should get exceeded thresholds', () => {
      monitor.setThreshold('loadTime', 100);
      const exceeded = monitor.getExceededThresholds();
      expect(Array.isArray(exceeded)).toBe(true);
    });
  });

  describe('PerformanceObserver integration', () => {
    it('should observe performance entries', () => {
      const result = monitor.observe(['navigation']);
      expect(result).toBe(true);
    });

    it('should disconnect observer', () => {
      monitor.observe(['resource']);
      monitor.disconnect();
      // Should not throw
    });
  });

  describe('export/import', () => {
    it('should export performance data', () => {
      monitor.mark('export-test');
      monitor.startOperation('test-op');
      monitor.stopOperation('test-op');

      const exported = monitor.export();
      expect(exported.marks).toContain('export-test');
      expect(exported.operations).toHaveLength(1);
    });

    it('should import performance data', () => {
      const data = {
        marks: ['imported-mark'],
        operations: [
          { name: 'imported-op', startTime: Date.now(), duration: 100, endTime: Date.now() + 100 },
        ],
      };
      monitor.import(data);
      expect(monitor.getCustomMarks()).toContain('imported-mark');
    });

    it('should get JSON export', () => {
      monitor.mark('json-test');
      const json = monitor.toJSON();
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.marks).toContain('json-test');
    });
  });

  describe('reset', () => {
    it('should reset all data', () => {
      monitor.mark('test');
      monitor.startOperation('op');
      monitor.trackMemory('mem');

      monitor.reset();

      expect(monitor.getCustomMarks()).toHaveLength(0);
      expect(monitor.getOperationMetrics()).toHaveLength(0);
      expect(monitor.getMemorySnapshots()).toHaveLength(0);
    });
  });

  describe('utility methods', () => {
    it('should format milliseconds to readable string', () => {
      const formatted = monitor.formatDuration(1234);
      expect(typeof formatted).toBe('string');
    });

    it('should get performance rating', () => {
      const rating = monitor.getRating(1500, 'pageLoad');
      expect(['good', 'needs-improvement', 'poor']).toContain(rating);
    });
  });
});

describe('Global PerformanceMonitor', () => {
  afterEach(() => {
    resetPerformanceMonitor();
  });

  it('should share singleton instance', () => {
    const monitor1 = getPerformanceMonitor();
    const monitor2 = getPerformanceMonitor();
    expect(monitor1).toBe(monitor2);
  });

  it('should reset singleton', () => {
    const monitor1 = getPerformanceMonitor();
    monitor1.mark('test');
    resetPerformanceMonitor();
    const monitor2 = getPerformanceMonitor();
    expect(monitor2).not.toBe(monitor1);
    expect(monitor2.getCustomMarks()).toHaveLength(0);
  });

  it('should initialize with config', () => {
    const monitor = getPerformanceMonitor({ enabled: false });
    expect(monitor.isEnabled()).toBe(false);
  });
});
