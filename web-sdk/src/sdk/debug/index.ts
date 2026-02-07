/**
 * Debug - Debug mode with visual debugging capabilities
 */

export type {
  DebugConfig,
  DebugEvent,
  DebugOverlay,
  DebugStatistics,
  DebugBorderOptions,
} from './debug-types.js';

export type {
  TimerEntry,
} from './debug-timers.js';

export {
  LogLevel,
  DebugManager as DebugManagerCore,
} from './debug-core.js';

export {
  DebugOverlayUI,
} from './debug-overlay.js';

export {
  TimerTracker,
} from './debug-timers.js';

import { DebugManager as DebugCore, type DebugConfig, type DebugEvent, type DebugOverlay, type DebugStatistics } from './debug-core.js';
import { TimerTracker, type TimerEntry } from './debug-timers.js';

/**
 * Extended DebugManager class with all functionality
 */
export class DebugManager extends DebugCore {
  private _timerTracker: TimerTracker;

  constructor(config: DebugConfig = {}) {
    super(config);
    this._timerTracker = new TimerTracker(this._config);
  }

  /**
   * Start a timer
   */
  startTimer(name: string): void {
    this._timerTracker.startTimer(name);
  }

  /**
   * Stop a timer and return duration
   */
  stopTimer(name: string): number {
    return this._timerTracker.stopTimer(name);
  }

  /**
   * Measure timer without stopping it
   */
  measureTimer(name: string): number {
    return this._timerTracker.measureTimer(name);
  }

  /**
   * Get all timers
   */
  getTimers(): TimerEntry[] {
    return this._timerTracker.getTimers();
  }

  /**
   * Clear a specific timer
   */
  clearTimer(name: string): void {
    this._timerTracker.clearTimer(name);
  }

  /**
   * Clear all timers
   */
  clearAllTimers(): void {
    this._timerTracker.clearAllTimers();
  }

  /**
   * Export debug data
   */
  override export(): {
    events: DebugEvent[];
    counters: Record<string, number>;
    timers: TimerEntry[];
    config: DebugConfig;
    overlay: DebugOverlay;
  } {
    return {
      ...super.export(),
      timers: this.getTimers(),
    };
  }

  /**
   * Get statistics
   */
  override getStatistics(): DebugStatistics {
    return {
      ...super.getStatistics(),
      totalTimers: this._timerTracker.getTimersCount(),
      activeTimers: this._timerTracker.getActiveTimersCount(),
    };
  }

  /**
   * Reset all debug data
   */
  override reset(): void {
    super.reset();
    this._timerTracker.clearAllTimers();
  }
}

// Singleton instance
let globalDebugManager: DebugManager | null = null;

/**
 * Get global debug manager instance
 */
export function getDebugManager(config?: DebugConfig): DebugManager {
  if (!globalDebugManager) {
    globalDebugManager = new DebugManager(config);
  } else if (config) {
    // Update config if provided
    Object.assign(globalDebugManager, { _config: { ...globalDebugManager._config, ...config } });
  }
  return globalDebugManager;
}

/**
 * Reset global debug manager
 */
export function resetDebugManager(): void {
  if (globalDebugManager) {
    globalDebugManager.reset();
  }
  globalDebugManager = null;
}
