/**
 * Performance Vitals - Core Web Vitals tracking
 */

export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  lcpGood: boolean;
  fidGood: boolean;
  clsGood: boolean;
}

/**
 * Core Web Vitals tracker
 */
export class CoreWebVitalsTracker {
  private _vitals: CoreWebVitals = {
    lcp: 0,
    fid: 0,
    cls: 0,
    lcpGood: true,
    fidGood: true,
    clsGood: true,
  };
  private _observer: PerformanceObserver | null = null;

  constructor(enabled: boolean = true) {
    if (enabled) {
      this._initCoreWebVitals();
    }
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
            case 'first-input': {
              const fidEntry = entry as PerformanceEventTiming & { processingStart: number };
              this._vitals.fid = fidEntry.processingStart - entry.startTime;
              this._vitals.fidGood = this._vitals.fid <= 100;
              break;
            }
            case 'layout-shift': {
              // Type assertion for layout shift entry (not standard in PerformanceEntry)
              const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
              if (!clsEntry.hadRecentInput && clsEntry.value !== undefined) {
                this._vitals.cls += clsEntry.value;
                this._vitals.clsGood = this._vitals.cls <= 0.1;
              }
              break;
            }
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
   * Disconnect observer
   */
  disconnect(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  /**
   * Reset vitals
   */
  reset(): void {
    this._vitals = {
      lcp: 0,
      fid: 0,
      cls: 0,
      lcpGood: true,
      fidGood: true,
      clsGood: true,
    };
  }
}
