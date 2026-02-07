/**
 * Performance Full - Full PerformanceMonitor implementation with metrics and vitals
 */

import { PerformanceMonitor as PerfCore } from './perf-core.js';
import { MemoryTracker } from './perf-memory.js';
import { CoreWebVitalsTracker, type CoreWebVitals } from './perf-vitals.js';
import { MetricsAggregator, type PerformanceMetrics, type NavigationTimingData, type ResourceTimingData } from './perf-metrics.js';
import type { MemorySnapshot } from './perf-memory.js';
import type { PerformanceConfig, PerformanceEntry, OperationMetric } from './perf-core.js';

/**
 * Extended PerformanceMonitor class with all functionality
 */
export class PerformanceMonitor extends PerfCore {
  private _memoryTracker: MemoryTracker;
  private _vitalsTracker: CoreWebVitalsTracker;
  private _observer: PerformanceObserver | null = null;

  constructor(config: PerformanceConfig = {}) {
    super(config);
    this._memoryTracker = new MemoryTracker(this);
    this._vitalsTracker = new CoreWebVitalsTracker(
      this._config.autoMeasure && this._config.enabled
    );
  }

  /**
   * Measure resource load time
   */
  measureResource(url: string): ResourceTimingData | null {
    if (!this._config.enabled) {
      return null;
    }
    return MetricsAggregator.measureResource(url);
  }

  /**
   * Get all resource timings
   */
  getResourceTimings(): ResourceTimingData[] {
    return MetricsAggregator.getResourceTimings();
  }

  /**
   * Get resources by type (script, stylesheet, etc.)
   */
  getResourcesByType(type: string): ResourceTimingData[] {
    return MetricsAggregator.getResourcesByType(type);
  }

  /**
   * Get navigation timing data
   */
  getNavigationTiming(): NavigationTimingData | null {
    return MetricsAggregator.getNavigationTiming();
  }

  /**
   * Get page load time
   */
  getPageLoadTime(): number {
    return MetricsAggregator.getPageLoadTime();
  }

  /**
   * Get DOM ready time
   */
  getDOMReadyTime(): number {
    return MetricsAggregator.getDOMReadyTime();
  }

  /**
   * Get first paint time
   */
  getFirstPaintTime(): number {
    return MetricsAggregator.getFirstPaintTime();
  }

  /**
   * Get LCP (Largest Contentful Paint)
   */
  getLCP(): number {
    return this._vitalsTracker.getLCP();
  }

  /**
   * Get FID (First Input Delay)
   */
  getFID(): number {
    return this._vitalsTracker.getFID();
  }

  /**
   * Get CLS (Cumulative Layout Shift)
   */
  getCls(): number {
    return this._vitalsTracker.getCls();
  }

  /**
   * Get all Core Web Vitals
   */
  getCoreWebVitals(): CoreWebVitals {
    return this._vitalsTracker.getCoreWebVitals();
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    return this._memoryTracker.getMemoryUsage();
  }

  /**
   * Track memory snapshot
   */
  trackMemory(label: string): void {
    this._memoryTracker.trackMemory(label);
  }

  /**
   * Get memory snapshots
   */
  getMemorySnapshots(): MemorySnapshot[] {
    return this._memoryTracker.getMemorySnapshots();
  }

  /**
   * Get memory difference between snapshots
   */
  getMemoryDiff(label1: string, label2: string): number | null {
    return this._memoryTracker.getMemoryDiff(label1, label2);
  }

  /**
   * Get aggregated performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: this.getPageLoadTime(),
      domReadyTime: this.getDOMReadyTime(),
      firstPaint: this.getFirstPaintTime(),
      memoryUsage: this.getMemoryUsage()?.used ?? 0,
      resourceCount: this.getResourceTimings().length,
    };
  }

  /**
   * Observe performance entries
   */
  observe(entryTypes: string[]): boolean {
    if (typeof window === 'undefined') return false;

    try {
      if (this._observer) {
        this._observer.disconnect();
      }

      this._observer = new PerformanceObserver(() => {});
      this._observer.observe({ entryTypes });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Disconnect performance observer
   */
  disconnect(): void {
    this._vitalsTracker.disconnect();
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  /**
   * Reset all performance data
   */
  override reset(): void {
    this.clearMarks();
    this.clearMeasures();
    this._operations.reset();
    this._memoryTracker.clearMemorySnapshots();
    this._vitalsTracker.reset();
    this.disconnect();
  }
}
