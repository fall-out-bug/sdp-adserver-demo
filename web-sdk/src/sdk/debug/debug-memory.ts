/**
 * Debug Memory - Memory tracking for DebugManager
 */

import type { DebugConfig, MemorySnapshot } from './debug-types.js';
import type { LogLevel } from './debug-logging.js';

/**
 * DebugMemory class for memory tracking
 */
export class DebugMemory {
  private _config: Required<DebugConfig>;
  private _memorySnapshots: MemorySnapshot[] = [];
  private _warn: (message: string, data?: Record<string, unknown>) => void;

  constructor(config: Required<DebugConfig>, logger: { warn: (message: string, data?: Record<string, unknown>) => void }) {
    this._config = config;
    this._warn = logger.warn;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<DebugConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Track memory usage at a point
   */
  trackMemory(label: string): number | null {
    if (!this._config.enabled) return null;

    if (
      typeof performance === 'undefined' ||
      !(performance as any).memory
    ) {
      this._warn('Memory API not available');
      return null;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
    };

    this._memorySnapshots.push(snapshot);

    // Limit snapshots
    if (this._memorySnapshots.length > this._config.maxEvents) {
      this._memorySnapshots.shift();
    }

    return memory.usedJSHeapSize;
  }

  /**
   * Get memory usage for a label
   */
  getMemoryUsage(label: string): number | null {
    const snapshot = this._memorySnapshots.find((s) => s.label === label);
    return snapshot?.usedJSHeapSize ?? null;
  }

  /**
   * Get memory difference between two snapshots
   */
  getMemoryDiff(label1: string, label2: string): number | null {
    const snapshot1 = this._memorySnapshots.find((s) => s.label === label1);
    const snapshot2 = this._memorySnapshots.find((s) => s.label === label2);

    if (!snapshot1 || !snapshot2) return null;

    return snapshot2.usedJSHeapSize - snapshot1.usedJSHeapSize;
  }

  /**
   * Get all memory snapshots
   */
  getMemorySnapshots(): MemorySnapshot[] {
    return [...this._memorySnapshots];
  }

  /**
   * Clear memory snapshots
   */
  clearMemorySnapshots(): void {
    this._memorySnapshots = [];
  }

  /**
   * Get memory snapshot count
   */
  getMemorySnapshotCount(): number {
    return this._memorySnapshots.length;
  }
}
