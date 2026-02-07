/**
 * Performance Export - Export and formatting functionality for PerformanceMonitor
 */

import type { PerformanceConfig, PerformanceEntry, OperationMetric } from './perf-core.js';
import type { MemorySnapshot } from './perf-memory.js';
import type { CoreWebVitals } from './perf-vitals.js';
import type { PerformanceMetrics } from './perf-metrics.js';
import { MetricsAggregator } from './perf-metrics.js';

/**
 * PerformanceExportMixin - Export and formatting functionality
 */
export class PerformanceExportMixin {
  protected _config: Required<PerformanceConfig>;

  constructor(config: Required<PerformanceConfig>) {
    this._config = config;
  }

  /**
   * Get metrics summary as formatted object
   */
  getMetricsSummary(
    metrics: PerformanceMetrics,
    vitals: CoreWebVitals
  ): Record<string, string | number> {
    return {
      // Page timings
      pageLoadTime: MetricsAggregator.formatDuration(metrics.pageLoadTime),
      domReadyTime: MetricsAggregator.formatDuration(metrics.domReadyTime),
      firstPaint: MetricsAggregator.formatDuration(metrics.firstPaint),

      // Core Web Vitals
      lcp: MetricsAggregator.formatDuration(vitals.lcp),
      lcpRating: vitals.lcpGood ? 'good' : 'needs-improvement',
      fid: MetricsAggregator.formatDuration(vitals.fid),
      fidRating: vitals.fidGood ? 'good' : 'needs-improvement',
      cls: vitals.cls.toFixed(3),
      clsRating: vitals.clsGood ? 'good' : 'needs-improvement',

      // Memory
      memoryUsed: MetricsAggregator.formatBytes(metrics.memoryUsage),

      // Resources
      resourceCount: metrics.resourceCount,
    };
  }

  /**
   * Export performance data
   */
  export(
    marks: string[],
    operations: OperationMetric[],
    memorySnapshots: MemorySnapshot[],
    metrics: PerformanceMetrics,
    vitals: CoreWebVitals,
    thresholds: Record<string, number>
  ): {
    marks: string[];
    operations: OperationMetric[];
    memorySnapshots: MemorySnapshot[];
    metrics: PerformanceMetrics;
    vitals: CoreWebVitals;
    thresholds: Record<string, number>;
  } {
    return {
      marks,
      operations,
      memorySnapshots,
      metrics,
      vitals,
      thresholds,
    };
  }

  /**
   * Import performance data
   */
  import(
    data: {
      marks?: string[];
      operations?: OperationMetric[];
      memorySnapshots?: MemorySnapshot[];
    },
    importMarks: (marks: string[]) => void,
    importOperations: (operations: OperationMetric[]) => void
  ): void {
    if (data.marks) {
      importMarks(data.marks);
    }

    if (data.operations) {
      importOperations(data.operations);
    }
  }

  /**
   * Get JSON export
   */
  toJSON(data: ReturnType<typeof this.export>): string {
    return JSON.stringify(data);
  }

  /**
   * Format duration to readable string
   */
  formatDuration(ms: number): string {
    return MetricsAggregator.formatDuration(ms);
  }

  /**
   * Format bytes to readable string
   */
  formatBytes(bytes: number): string {
    return MetricsAggregator.formatBytes(bytes);
  }

  /**
   * Get performance rating
   */
  getRating(value: number, metric: 'pageLoad' | 'lcp' | 'fid'): string {
    return MetricsAggregator.getRating(value, metric);
  }
}
