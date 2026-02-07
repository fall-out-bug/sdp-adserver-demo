/**
 * Performance Marks - Performance mark and measure functionality
 */

import type { PerformanceConfig } from './perf-core-base.js';
import { PerformanceMonitorBase } from './perf-core-base.js';

export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

/**
 * Performance mark and measure management
 */
export class PerformanceMarks extends PerformanceMonitorBase {
  private _customMarks: string[] = [];
  private _customMeasures: PerformanceEntry[] = [];

  constructor(config: PerformanceConfig = {}) {
    super(config);
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
        apiMeasures = entries.map((e: PerformanceEntry) => ({
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
   * Clear all marks and measures
   */
  clearAll(): void {
    this.clearMarks();
    this.clearMeasures();
    this._customMeasures = [];
  }

  /**
   * Import marks from external source
   */
  importMarks(marks: string[]): void {
    for (const mark of marks) {
      this._customMarks.push(mark);
    }
  }
}
