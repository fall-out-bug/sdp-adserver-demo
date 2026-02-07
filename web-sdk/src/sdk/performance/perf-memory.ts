/**
 * Performance Memory - Memory tracking functionality
 */

import type { PerformanceMonitor } from './perf-core.js';

export interface MemorySnapshot {
  label: string;
  timestamp: number;
  used: number;
  total: number;
  limit: number;
}

/**
 * Memory tracking mixin for PerformanceMonitor
 */
export class MemoryTracker {
  private _monitor: PerformanceMonitor;
  private _memorySnapshots: MemorySnapshot[] = [];

  constructor(monitor: PerformanceMonitor) {
    this._monitor = monitor;
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    if (typeof performance === 'undefined' || !('memory' in performance)) {
      return null;
    }

    // Type assertion for performance.memory (non-standard API)
    const perfMemory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (!perfMemory) {
      return null;
    }

    const memory = perfMemory;
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
    const monitor = this._monitor as { isEnabled?: () => boolean };
    if (monitor.isEnabled && !monitor.isEnabled()) return;

    const memory = this.getMemoryUsage();
    if (!memory) return;

    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      ...memory,
    };

    this._memorySnapshots.push(snapshot);

    // Limit snapshots
    const monitorConfig = this._monitor as { _config?: { maxMemorySnapshots?: number } };
    const maxSnapshots = monitorConfig._config?.maxMemorySnapshots ?? 50;
    if (this._memorySnapshots.length > maxSnapshots) {
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
   * Clear memory snapshots
   */
  clearMemorySnapshots(): void {
    this._memorySnapshots = [];
  }
}
