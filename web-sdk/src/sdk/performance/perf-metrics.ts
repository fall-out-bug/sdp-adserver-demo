/**
 * Performance Metrics - Metrics aggregation and navigation timing
 */

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

/**
 * Metrics aggregator for performance data
 */
export class MetricsAggregator {
  /**
   * Measure resource load time
   */
  static measureResource(url: string): ResourceTimingData | null {
    if (typeof performance === 'undefined') {
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
  static getResourceTimings(): ResourceTimingData[] {
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
  static getResourcesByType(type: string): ResourceTimingData[] {
    const resources = MetricsAggregator.getResourceTimings();
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
  static getNavigationTiming(): NavigationTimingData | null {
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
  static getPageLoadTime(): number {
    const timing = MetricsAggregator.getNavigationTiming();
    return timing?.loadComplete ?? 0;
  }

  /**
   * Get DOM ready time
   */
  static getDOMReadyTime(): number {
    const timing = MetricsAggregator.getNavigationTiming();
    return timing?.domContentLoaded ?? 0;
  }

  /**
   * Get first paint time
   */
  static getFirstPaintTime(): number {
    const timing = MetricsAggregator.getNavigationTiming();
    return timing?.firstPaint ?? timing?.firstContentfulPaint ?? 0;
  }

  /**
   * Format duration to readable string
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Format bytes to readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get performance rating
   */
  static getRating(value: number, metric: 'pageLoad' | 'lcp' | 'fid'): string {
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
}
