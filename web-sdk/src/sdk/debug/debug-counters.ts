/**
 * Debug Counters - Counter tracking for DebugManager
 */

import type { DebugConfig } from './debug-types.js';

/**
 * DebugCounter class for counter tracking
 */
export class DebugCounter {
  private _config: Required<DebugConfig>;
  private _counters: Map<string, number> = new Map();

  constructor(config: Required<DebugConfig>) {
    this._config = config;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<DebugConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, amount = 1): void {
    const current = this._counters.get(name) ?? 0;
    this._counters.set(name, current + amount);

    // Limit counters
    if (this._counters.size > this._config.maxCounters) {
      const firstKey = this._counters.keys().next().value;
      if (firstKey) {
        this._counters.delete(firstKey);
      }
    }
  }

  /**
   * Decrement a counter
   */
  decrementCounter(name: string, amount = 1): void {
    const current = this._counters.get(name) ?? 0;
    this._counters.set(name, Math.max(0, current - amount));
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this._counters.get(name) ?? 0;
  }

  /**
   * Reset a counter
   */
  resetCounter(name: string): void {
    this._counters.set(name, 0);
  }

  /**
   * Get all counters
   */
  getCounters(): Record<string, number> {
    return Object.fromEntries(this._counters);
  }

  /**
   * Clear all counters
   */
  clearCounters(): void {
    this._counters.clear();
  }

  /**
   * Get counter count
   */
  getCounterCount(): number {
    return this._counters.size;
  }

  /**
   * Import counters from external source
   */
  importCounters(counters: Record<string, number>): void {
    for (const [name, value] of Object.entries(counters)) {
      this._counters.set(name, value);
    }
  }
}
