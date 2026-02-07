/**
 * Performance Operations - Operation tracking functionality
 */

import type { PerformanceConfig } from './perf-core-base.js';
import { PerformanceMonitorBase } from './perf-core-base.js';

export interface OperationMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

/**
 * Operation tracking for performance monitoring
 */
export class PerformanceOperations extends PerformanceMonitorBase {
  private _operations: Map<string, OperationMetric> = new Map();
  private _thresholds: Map<string, number> = new Map();

  constructor(config: PerformanceConfig = {}) {
    super(config);
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
    }

    return exceeded;
  }

  /**
   * Clear all operations
   */
  clearOperations(): void {
    this._operations.clear();
  }

  /**
   * Clear all thresholds
   */
  clearThresholds(): void {
    this._thresholds.clear();
  }

  /**
   * Reset all operations and thresholds
   */
  reset(): void {
    this.clearOperations();
    this.clearThresholds();
  }

  /**
   * Import operations from external source
   */
  importOperations(operations: OperationMetric[]): void {
    for (const op of operations) {
      this._operations.set(op.name, op);
    }
  }

  /**
   * Get all thresholds
   */
  getThresholds(): Map<string, number> {
    return this._thresholds;
  }
}
