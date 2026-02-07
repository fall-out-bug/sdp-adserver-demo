/**
 * Performance Core Base - Base configuration and state management
 */

export interface PerformanceConfig {
  enabled?: boolean;
  autoMeasure?: boolean;
  maxMarks?: number;
  maxMeasures?: number;
  maxOperations?: number;
  maxMemorySnapshots?: number;
}

/**
 * PerformanceMonitor base class with configuration and state
 */
export class PerformanceMonitorBase {
  protected _config: Required<PerformanceConfig>;

  constructor(config: PerformanceConfig = {}) {
    this._config = {
      enabled: config.enabled ?? true,
      autoMeasure: config.autoMeasure ?? true,
      maxMarks: config.maxMarks ?? 100,
      maxMeasures: config.maxMeasures ?? 100,
      maxOperations: config.maxOperations ?? 50,
      maxMemorySnapshots: config.maxMemorySnapshots ?? 50,
    };
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
   * Get current timestamp from performance API
   */
  protected _now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }
}
