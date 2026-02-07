/**
 * Debug Timers - Timer tracking functionality
 */

import type { DebugConfig } from './debug-types.js';

export interface TimerEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * Timer tracking for DebugManager
 */
export class TimerTracker {
  private _config: Required<DebugConfig>;
  private _timers: Map<string, TimerEntry> = new Map();

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
   * Start a timer
   */
  startTimer(name: string): void {
    if (!this._config.enabled) return;

    if (this._timers.has(name)) {
      // Timer already exists, will be overwritten
    }

    this._timers.set(name, {
      name,
      startTime: performance.now(),
    });

    // Limit timers
    const maxTimers = this._config.maxTimers ?? 100;
    if (this._timers.size > maxTimers) {
      const firstKey = this._timers.keys().next().value;
      if (firstKey) {
        this._timers.delete(firstKey);
      }
    }
  }

  /**
   * Stop a timer and return duration
   */
  stopTimer(name: string): number {
    const timer = this._timers.get(name);
    if (!timer) {
      throw new Error(`Timer "${name}" not found`);
    }

    const endTime = performance.now();
    const duration = endTime - timer.startTime;

    this._timers.set(name, {
      ...timer,
      endTime,
      duration,
    });

    return duration;
  }

  /**
   * Measure timer without stopping it
   */
  measureTimer(name: string): number {
    const timer = this._timers.get(name);
    if (!timer) {
      throw new Error(`Timer "${name}" not found`);
    }

    return performance.now() - timer.startTime;
  }

  /**
   * Get all timers
   */
  getTimers(): TimerEntry[] {
    return Array.from(this._timers.values());
  }

  /**
   * Clear a specific timer
   */
  clearTimer(name: string): void {
    this._timers.delete(name);
  }

  /**
   * Clear all timers
   */
  clearAllTimers(): void {
    this._timers.clear();
  }

  /**
   * Get active timers count
   */
  getActiveTimersCount(): number {
    return Array.from(this._timers.values()).filter(
      (t) => t.endTime === undefined
    ).length;
  }

  /**
   * Get total timers count
   */
  getTimersCount(): number {
    return this._timers.size;
  }
}
