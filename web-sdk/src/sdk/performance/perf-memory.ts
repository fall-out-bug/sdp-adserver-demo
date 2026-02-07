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
    if (!(this._monitor as any).isEnabled()) return;

    const memory = this.getMemoryUsage();
    if (!memory) return;

    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      ...memory,
    };

    this._memorySnapshots.push(snapshot);

    // Limit snapshots
    const maxSnapshots = (this._monitor as any)._config?.maxMemorySnapshots ?? 50;
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
