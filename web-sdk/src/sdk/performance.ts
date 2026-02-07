/**
 * Performance - Performance API integration for monitoring SDK and page performance
 */

export interface PerformanceConfig {
  enabled?: boolean;
  autoMeasure?: boolean;
  maxMarks?: number;
  maxMeasures?: number;
  maxOperations?: number;
  maxMemorySnapshots?: number;
}

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

export interface OperationMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface MemorySnapshot {
  label: string;
  timestamp: number;
  used: number;
  total: number;
  limit: number;
}

export interface ResourceTimingData {
  name: string;
  url: string;
  duration: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

export interface NavigationTimingData {
  domContentLoaded: number;
  loadComplete: number;
  domInteractive: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  domReadyTime: number;
  firstPaint: number;
  memoryUsage: number;
  resourceCount: number;
}

export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  lcpGood: boolean;
  fidGood: boolean;
  clsGood: boolean;
}

/**
 * PerformanceMonitor class for monitoring SDK and page performance
 */
export class PerformanceMonitor {
  private _config: Required<PerformanceConfig>;
  private _customMarks: string[] = [];
  private _customMeasures: PerformanceEntry[] = [];
  private _operations: Map<string, OperationMetric> = new Map();
  private _memorySnapshots: MemorySnapshot[] = [];
  private _thresholds: Map<string, number> = new Map();
  private _observer: PerformanceObserver | null = null;
  private _vitals: CoreWebVitals = {
    lcp: 0,
    fid: 0,
    cls: 0,
    lcpGood: true,
    fidGood: true,
    clsGood: true,
  };

  constructor(config: PerformanceConfig = {}) {
    this._config = {
      enabled: config.enabled ?? true,
      autoMeasure: config.autoMeasure ?? true,
      maxMarks: config.maxMarks ?? 100,
      maxMeasures: config.maxMeasures ?? 100,
      maxOperations: config.maxOperations ?? 50,
      maxMemorySnapshots: config.maxMemorySnapshots ?? 50,
    };

    if (this._config.autoMeasure && this._config.enabled) {
      this._initCoreWebVitals();
    }
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this._config.enabled;
  }

  /**
   * Enable monitoring
   */
  enable(): void {
    this._config.enabled = true;
  }

  /**
   * Disable monitoring
   */
  disable(): void {
    this._config.enabled = false;
  }

  /**
   * Create performance mark
   */
  mark(name: string): boolean {
    if (!this._config.enabled) return false;

    try {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark(name);
        this._customMarks.push(name);

        // Limit marks
        if (this._customMarks.length > this._config.maxMarks) {
          const removed = this._customMarks.shift();
          if (removed && performance.clearMarks) {
            performance.clearMarks(removed);
          }
        }

        return true;
      }
    } catch (e) {
      // Mark already exists, ignore
    }

    return false;
  }

  /**
   * Get custom marks
   */
  getCustomMarks(): string[] {
    return [...this._customMarks];
  }

  /**
   * Clear all marks
   */
  clearMarks(): void {
    this._customMarks = [];
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      try {
        performance.clearMarks();
      } catch (e) {
        // Ignore errors when clearing marks
      }
    }
  }

  /**
   * Measure between marks or with custom duration
   */
  measure(
    name: string,
    startMark?: string,
    endMark?: string,
    duration?: number
  ): boolean {
    if (!this._config.enabled) return false;

    try {
      if (typeof performance !== 'undefined' && performance.measure) {
        if (duration !== undefined) {
          // Create custom measure entry
          const measureName = `custom-${name}`;
          performance.mark(`${measureName}-start`);
          performance.mark(`${measureName}-end`);
          performance.measure(name, `${measureName}-start`, `${measureName}-end`);

          // Track custom measure
          this._customMeasures.push({
            name,
            startTime: 0,
            duration,
            entryType: 'measure',
          });
        } else if (startMark && endMark) {
          performance.measure(name, startMark, endMark);

          // Track custom measure
          this._customMeasures.push({
            name,
            startTime: 0,
            duration: 0,
            entryType: 'measure',
          });
        } else {
          return false;
        }

        // Limit measures
        if (this._customMeasures.length > this._config.maxMeasures) {
          this._customMeasures.shift();
        }

        return true;
      }
    } catch (e) {
      // Ignore errors
    }

    return false;
  }

  /**
   * Get measures
   */
  getMeasures(): PerformanceEntry[] {
    // Return custom measures plus any from Performance API
    let apiMeasures: PerformanceEntry[] = [];
    if (typeof performance !== 'undefined') {
      try {
        const entries = performance.getEntriesByType?.('measure') ?? [];
        apiMeasures = entries.map((e: any) => ({
          name: e.name,
          startTime: e.startTime,
          duration: e.duration,
          entryType: e.entryType,
        }));
      } catch {
        // Ignore errors
      }
    }
    return [...this._customMeasures, ...apiMeasures];
  }

  /**
   * Clear measures
   */
  clearMeasures(): void {
    this._customMeasures = [];
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      try {
        performance.clearMeasures();
      } catch (e) {
        // Ignore errors
      }
    }
  }

  /**
   * Start measuring an operation
   */
  startOperation(name: string): void {
    if (!this._config.enabled) return;

    const startTime = this._now();

    this._operations.set(name, {
      name,
      startTime,
      endTime: 0,
      duration: 0,
    } as OperationMetric);

    // Limit operations
    if (this._operations.size > this._config.maxOperations) {
      const firstKey = this._operations.keys().next().value;
      if (firstKey) {
        this._operations.delete(firstKey);
      }
    }
  }

  /**
   * Stop measuring an operation
   */
  stopOperation(name: string): number {
    const operation = this._operations.get(name);
    if (!operation) {
      throw new Error(`Operation "${name}" not found. Call startOperation first.`);
    }

    const endTime = this._now();
    const duration = endTime - operation.startTime;

    operation.endTime = endTime;
    operation.duration = duration;

    return duration;
  }

  /**
   * Get operation metrics
   */
  getOperationMetrics(): OperationMetric[] {
    return Array.from(this._operations.values()).filter(
      (op) => op.duration > 0
    );
  }

  /**
   * Measure resource load time
   */
  measureResource(url: string): ResourceTimingData | null {
    if (!this._config.enabled || typeof performance === 'undefined') {
      return null;
    }

    try {
      const resources = performance.getEntriesByName?.(url, 'resource') ?? [];
      if (resources.length > 0) {
        const r = resources[0] as any;
        return {
          name: r.name,
          url: r.name,
          duration: r.duration,
          transferSize: r.transferSize ?? 0,
          encodedBodySize: r.encodedBodySize ?? 0,
          decodedBodySize: r.decodedBodySize ?? 0,
        };
      }
    } catch (e) {
      // Ignore errors
    }

    return null;
  }

  /**
   * Get all resource timings
   */
  getResourceTimings(): ResourceTimingData[] {
    if (typeof performance === 'undefined') return [];

    try {
      const resources = performance.getEntriesByType?.('resource') ?? [];
      return resources.map((r: any) => ({
        name: r.name,
        url: r.name,
        duration: r.duration,
        transferSize: r.transferSize ?? 0,
        encodedBodySize: r.encodedBodySize ?? 0,
        decodedBodySize: r.decodedBodySize ?? 0,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Get resources by type (script, stylesheet, etc.)
   */
  getResourcesByType(type: string): ResourceTimingData[] {
    const resources = this.getResourceTimings();
    return resources.filter((r) => {
      const url = r.url.toLowerCase();
      switch (type) {
        case 'script':
          return url.endsWith('.js');
        case 'stylesheet':
          return url.endsWith('.css');
        case 'image':
          return url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) !== null;
        case 'font':
          return url.match(/\.(woff|woff2|ttf|otf)$/i) !== null;
        default:
          return false;
      }
    });
  }

  /**
   * Get navigation timing data
   */
  getNavigationTiming(): NavigationTimingData | null {
    if (typeof performance === 'undefined') return null;

    try {
      const timing = performance.getEntriesByType?.('navigation')?.[0] as any;
      if (!timing) return null;

      const paintEntries = performance.getEntriesByType?.('paint') ?? [];

      let firstPaint = 0;
      let firstContentfulPaint = 0;

      for (const entry of paintEntries) {
        if (entry.name === 'first-paint') {
          firstPaint = entry.startTime;
        }
        if (entry.name === 'first-contentful-paint') {
          firstContentfulPaint = entry.startTime;
        }
      }

      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.fetchStart,
        loadComplete: timing.loadEventEnd - timing.fetchStart,
        domInteractive: timing.domInteractive - timing.fetchStart,
        firstPaint,
        firstContentfulPaint,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get page load time
   */
  getPageLoadTime(): number {
    const timing = this.getNavigationTiming();
    return timing?.loadComplete ?? 0;
  }

  /**
   * Get DOM ready time
   */
  getDOMReadyTime(): number {
    const timing = this.getNavigationTiming();
    return timing?.domContentLoaded ?? 0;
  }

  /**
   * Get first paint time
   */
  getFirstPaintTime(): number {
    const timing = this.getNavigationTiming();
    return timing?.firstPaint ?? timing?.firstContentfulPaint ?? 0;
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private _initCoreWebVitals(): void {
    if (typeof window === 'undefined') return;

    try {
      this._observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              this._vitals.lcp = entry.startTime;
              this._vitals.lcpGood = entry.startTime <= 2500;
              break;
            case 'first-input':
              this._vitals.fid = (entry as any).processingStart - entry.startTime;
              this._vitals.fidGood = this._vitals.fid <= 100;
              break;
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                this._vitals.cls += (entry as any).value;
                this._vitals.clsGood = this._vitals.cls <= 0.1;
              }
              break;
          }
        }
      });

      this._observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // PerformanceObserver not supported or error
    }
  }

  /**
   * Get LCP (Largest Contentful Paint)
   */
  getLCP(): number {
    return this._vitals.lcp;
  }

  /**
   * Get FID (First Input Delay)
   */
  getFID(): number {
    return this._vitals.fid;
  }

  /**
   * Get CLS (Cumulative Layout Shift)
   */
  getCls(): number {
    return this._vitals.cls;
  }

  /**
   * Get all Core Web Vitals
   */
  getCoreWebVitals(): CoreWebVitals {
    return { ...this._vitals };
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  }

  /**
   * Track memory snapshot
   */
  trackMemory(label: string): void {
    if (!this._config.enabled) return;

    const memory = this.getMemoryUsage();
    if (!memory) return;

    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      ...memory,
    };

    this._memorySnapshots.push(snapshot);

    // Limit snapshots
    if (this._memorySnapshots.length > this._config.maxMemorySnapshots) {
      this._memorySnapshots.shift();
    }
  }

  /**
   * Get memory snapshots
   */
  getMemorySnapshots(): MemorySnapshot[] {
    return [...this._memorySnapshots];
  }

  /**
   * Get memory difference between snapshots
   */
  getMemoryDiff(label1: string, label2: string): number | null {
    const snapshot1 = this._memorySnapshots.find((s) => s.label === label1);
    const snapshot2 = this._memorySnapshots.find((s) => s.label === label2);

    if (!snapshot1 || !snapshot2) return null;

    return snapshot2.used - snapshot1.used;
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
   * Get metrics summary as formatted object
   */
  getMetricsSummary(): Record<string, string | number> {
    const metrics = this.getMetrics();
    const vitals = this.getCoreWebVitals();

    return {
      // Page timings
      pageLoadTime: this.formatDuration(metrics.pageLoadTime),
      domReadyTime: this.formatDuration(metrics.domReadyTime),
      firstPaint: this.formatDuration(metrics.firstPaint),

      // Core Web Vitals
      lcp: this.formatDuration(vitals.lcp),
      lcpRating: vitals.lcpGood ? 'good' : 'needs-improvement',
      fid: this.formatDuration(vitals.fid),
      fidRating: vitals.fidGood ? 'good' : 'needs-improvement',
      cls: vitals.cls.toFixed(3),
      clsRating: vitals.clsGood ? 'good' : 'needs-improvement',

      // Memory
      memoryUsed: this.formatBytes(metrics.memoryUsage),

      // Resources
      resourceCount: metrics.resourceCount,
    };
  }

  /**
   * Set performance threshold
   */
  setThreshold(name: string, value: number): void {
    this._thresholds.set(name, value);
  }

  /**
   * Get threshold
   */
  getThreshold(name: string): number | undefined {
    return this._thresholds.get(name);
  }

  /**
   * Get exceeded thresholds
   */
  getExceededThresholds(): Array<{ name: string; value: number; threshold: number }> {
    const exceeded: Array<{ name: string; value: number; threshold: number }> = [];

    // Check operations
    for (const [name, threshold] of this._thresholds) {
      const operation = Array.from(this._operations.values()).find((op) => op.name === name);
      if (operation && operation.duration > threshold) {
        exceeded.push({
          name,
          value: operation.duration,
          threshold,
        });
      }

      // Check page load time
      if (name === 'pageLoad' && this.getPageLoadTime() > threshold) {
        exceeded.push({
          name,
          value: this.getPageLoadTime(),
          threshold,
        });
      }
    }

    return exceeded;
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
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  /**
   * Export performance data
   */
  export(): {
    marks: string[];
    operations: OperationMetric[];
    memorySnapshots: MemorySnapshot[];
    metrics: PerformanceMetrics;
    vitals: CoreWebVitals;
    thresholds: Record<string, number>;
  } {
    return {
      marks: [...this._customMarks],
      operations: this.getOperationMetrics(),
      memorySnapshots: [...this._memorySnapshots],
      metrics: this.getMetrics(),
      vitals: this.getCoreWebVitals(),
      thresholds: Object.fromEntries(this._thresholds),
    };
  }

  /**
   * Import performance data
   */
  import(data: {
    marks?: string[];
    operations?: OperationMetric[];
    memorySnapshots?: MemorySnapshot[];
  }): void {
    if (data.marks) {
      this._customMarks = [...data.marks];
    }

    if (data.operations) {
      this._operations = new Map(
        data.operations.map((op) => [op.name, op])
      );
    }

    if (data.memorySnapshots) {
      this._memorySnapshots = [...data.memorySnapshots];
    }
  }

  /**
   * Get JSON export
   */
  toJSON(): string {
    return JSON.stringify(this.export());
  }

  /**
   * Format duration to readable string
   */
  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Format bytes to readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get performance rating
   */
  getRating(value: number, metric: 'pageLoad' | 'lcp' | 'fid'): string {
    switch (metric) {
      case 'pageLoad':
      case 'lcp':
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
      case 'fid':
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
      default:
        return 'unknown';
    }
  }

  /**
   * Reset all performance data
   */
  reset(): void {
    this.clearMarks();
    this.clearMeasures();
    this._customMeasures = [];
    this._operations.clear();
    this._memorySnapshots = [];
    this._thresholds.clear();
    this._vitals = {
      lcp: 0,
      fid: 0,
      cls: 0,
      lcpGood: true,
      fidGood: true,
      clsGood: true,
    };
    this.disconnect();
  }

  /**
   * Get current timestamp from performance API
   */
  private _now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }
}

// Singleton instance
let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * Get global performance monitor instance
 */
export function getPerformanceMonitor(config?: PerformanceConfig): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor(config);
  }
  return globalPerformanceMonitor;
}

/**
 * Reset global performance monitor
 */
export function resetPerformanceMonitor(): void {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.reset();
  }
  globalPerformanceMonitor = null;
}
