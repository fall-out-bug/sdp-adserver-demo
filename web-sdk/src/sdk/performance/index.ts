/**
 * Performance - Performance API integration for monitoring SDK and page performance
 */

export type {
  PerformanceConfig,
  PerformanceEntry,
  OperationMetric,
} from './perf-core.js';

export type {
  MemorySnapshot,
} from './perf-memory.js';

export type {
  CoreWebVitals,
} from './perf-vitals.js';

export type {
  ResourceTimingData,
  NavigationTimingData,
  PerformanceMetrics,
} from './perf-metrics.js';

export {
  PerformanceMonitorBase,
} from './perf-core-base.js';

export {
  PerformanceMarks,
} from './perf-marks.js';

export {
  PerformanceOperations,
} from './perf-operations.js';

export {
  MemoryTracker,
} from './perf-memory.js';

export {
  CoreWebVitalsTracker,
} from './perf-vitals.js';

export {
  MetricsAggregator,
} from './perf-metrics.js';

export {
  PerformanceMonitor,
} from './perf-full.js';

export {
  getPerformanceMonitor,
  resetPerformanceMonitor,
} from './perf-singleton.js';

import { PerformanceMonitor as PerfMonitor } from './perf-full.js';
import { MetricsAggregator } from './perf-metrics.js';
import type { MemorySnapshot } from './perf-memory.js';
import type { PerformanceConfig, PerformanceEntry, OperationMetric } from './perf-core.js';
import type { CoreWebVitals } from './perf-vitals.js';
import type { PerformanceMetrics } from './perf-metrics.js';

// Extend PerformanceMonitor with export functionality
Object.assign(PerfMonitor.prototype, {
  getMetricsSummary: function(this: any) {
    const metrics = this.getMetrics();
    const vitals = this.getCoreWebVitals();

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
  },
  export: function(this: any) {
    return {
      marks: this.getCustomMarks(),
      operations: this.getOperationMetrics(),
      memorySnapshots: this.getMemorySnapshots(),
      metrics: this.getMetrics(),
      vitals: this.getCoreWebVitals(),
      thresholds: Object.fromEntries(this._operations.getThresholds ? this._operations.getThresholds() : []),
    };
  },
  import: function(this: any, data: any) {
    if (data.marks) {
      this._marks.importMarks(data.marks);
    }

    if (data.operations) {
      this._operations.importOperations(data.operations);
    }
  },
  toJSON: function(this: any) {
    return JSON.stringify(this.export());
  },
  formatDuration: function(this: any, ms: number) {
    return MetricsAggregator.formatDuration(ms);
  },
  formatBytes: function(this: any, bytes: number) {
    return MetricsAggregator.formatBytes(bytes);
  },
  getRating: function(this: any, value: number, metric: any) {
    return MetricsAggregator.getRating(value, metric);
  },
});
