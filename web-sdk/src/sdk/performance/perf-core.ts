/**
 * Performance Core - Core PerformanceMonitor class (marks, measures, operations)
 */

export type {
  PerformanceConfig,
} from './perf-core-base.js';

export type {
  PerformanceEntry,
} from './perf-marks.js';

export type {
  OperationMetric,
} from './perf-operations.js';

export {
  PerformanceMonitorBase,
} from './perf-core-base.js';

export {
  PerformanceMarks,
} from './perf-marks.js';

export {
  PerformanceOperations,
} from './perf-operations.js';

import type { PerformanceConfig } from './perf-core-base.js';
import type { PerformanceEntry } from './perf-marks.js';
import type { OperationMetric } from './perf-operations.js';
import { PerformanceMonitorBase } from './perf-core-base.js';
import { PerformanceMarks } from './perf-marks.js';
import { PerformanceOperations } from './perf-operations.js';

/**
 * PerformanceMonitor class for monitoring SDK and page performance
 */
export class PerformanceMonitor extends PerformanceMonitorBase {
  private _marks: PerformanceMarks;
  private _operations: PerformanceOperations;

  constructor(config: PerformanceConfig = {}) {
    super(config);
    this._marks = new PerformanceMarks(config);
    this._operations = new PerformanceOperations(config);
  }

  /**
   * Create performance mark
   */
  mark(name: string): boolean {
    if (!this._config.enabled) return false;
    return this._marks.mark(name);
  }

  /**
   * Get custom marks
   */
  getCustomMarks(): string[] {
    return this._marks.getCustomMarks();
  }

  /**
   * Clear all marks
   */
  clearMarks(): void {
    this._marks.clearMarks();
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
    return this._marks.measure(name, startMark, endMark, duration);
  }

  /**
   * Get measures
   */
  getMeasures(): PerformanceEntry[] {
    return this._marks.getMeasures();
  }

  /**
   * Clear measures
   */
  clearMeasures(): void {
    this._marks.clearMeasures();
  }

  /**
   * Start measuring an operation
   */
  startOperation(name: string): void {
    this._operations.startOperation(name);
  }

  /**
   * Stop measuring an operation
   */
  stopOperation(name: string): number {
    return this._operations.stopOperation(name);
  }

  /**
   * Get operation metrics
   */
  getOperationMetrics(): OperationMetric[] {
    return this._operations.getOperationMetrics();
  }

  /**
   * Set performance threshold
   */
  setThreshold(name: string, value: number): void {
    this._operations.setThreshold(name, value);
  }

  /**
   * Get threshold
   */
  getThreshold(name: string): number | undefined {
    return this._operations.getThreshold(name);
  }

  /**
   * Get exceeded thresholds
   */
  getExceededThresholds(): Array<{ name: string; value: number; threshold: number }> {
    return this._operations.getExceededThresholds();
  }
}
