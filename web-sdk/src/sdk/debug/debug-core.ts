/**
 * Debug Core - DebugManager core functionality
 */

export type {
  DebugConfig,
  DebugEvent,
  DebugOverlay,
  DebugStatistics,
} from './debug-types.js';

export {
  LogLevel,
} from './debug-logging.js';

export {
  DebugLogger,
} from './debug-logging.js';

export {
  DebugEventTracker,
} from './debug-events.js';

export {
  DebugCounter,
} from './debug-counters.js';

export {
  DebugOverlayUI,
} from './debug-overlay.js';

export {
  DebugMemory,
} from './debug-memory.js';

import type { DebugConfig, DebugEvent, DebugOverlay, DebugStatistics } from './debug-types.js';
import { LogLevel, DebugLogger } from './debug-logging.js';
import { DebugEventTracker } from './debug-events.js';
import { DebugCounter } from './debug-counters.js';
import { DebugOverlayUI } from './debug-overlay.js';
import { DebugMemory } from './debug-memory.js';

/**
 * DebugManager class for SDK debugging
 */
export class DebugManager {
  protected _config: Required<DebugConfig>;
  protected _logger: DebugLogger;
  protected _eventTracker: DebugEventTracker;
  protected _counter: DebugCounter;
  protected _memory: DebugMemory;
  protected _overlay: DebugOverlayUI;

  constructor(config: DebugConfig = {}) {
    this._config = {
      enabled: config.enabled ?? false,
      logLevel: config.logLevel ?? LogLevel.INFO,
      enableOverlay: config.enableOverlay ?? true,
      maxEvents: config.maxEvents ?? 1000,
      maxTimers: config.maxTimers ?? 100,
      maxCounters: config.maxCounters ?? 50,
    };

    this._logger = new DebugLogger(this._config);
    this._eventTracker = new DebugEventTracker(this._config);
    this._counter = new DebugCounter(this._config);
    this._memory = new DebugMemory(this._config, this._logger);
    this._overlay = new DebugOverlayUI(this._config);
  }

  /**
   * Check if debug mode is enabled
   */
  isEnabled(): boolean {
    return this._config.enabled;
  }

  /**
   * Enable debug mode
   */
  enable(): void {
    this._config.enabled = true;
    this._updateSubConfigs();
    this._logger.info('Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disable(): void {
    this._config.enabled = false;
    this._updateSubConfigs();
  }

  /**
   * Get current log level
   */
  getLogLevel(): LogLevel {
    return this._logger.getLogLevel();
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this._logger.setLogLevel(level);
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this._logger.debug(message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this._logger.info(message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this._logger.warn(message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    this._logger.error(message, error, data);
  }

  /**
   * Record debug event
   */
  recordEvent(type: string, data: Record<string, unknown> = {}): void {
    this._eventTracker.recordEvent(type, data);
  }

  /**
   * Get all events
   */
  getEvents(): DebugEvent[] {
    return this._eventTracker.getEvents();
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): DebugEvent[] {
    return this._eventTracker.getEventsByType(type);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this._eventTracker.clearEvents();
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, amount = 1): void {
    this._counter.incrementCounter(name, amount);
  }

  /**
   * Decrement a counter
   */
  decrementCounter(name: string, amount = 1): void {
    this._counter.decrementCounter(name, amount);
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this._counter.getCounter(name);
  }

  /**
   * Reset a counter
   */
  resetCounter(name: string): void {
    this._counter.resetCounter(name);
  }

  /**
   * Get all counters
   */
  getCounters(): Record<string, number> {
    return this._counter.getCounters();
  }

  /**
   * Clear all counters
   */
  clearCounters(): void {
    this._counter.clearCounters();
  }

  /**
   * Track memory usage at a point
   */
  trackMemory(label: string): number | null {
    return this._memory.trackMemory(label);
  }

  /**
   * Get memory usage for a label
   */
  getMemoryUsage(label: string): number | null {
    return this._memory.getMemoryUsage(label);
  }

  /**
   * Get memory difference between two snapshots
   */
  getMemoryDiff(label1: string, label2: string): number | null {
    return this._memory.getMemoryDiff(label1, label2);
  }

  /**
   * Get all memory snapshots
   */
  getMemorySnapshots(): any[] {
    return this._memory.getMemorySnapshots();
  }

  /**
   * Show debug overlay
   */
  showOverlay(): boolean {
    return this._overlay.showOverlay();
  }

  /**
   * Hide debug overlay
   */
  hideOverlay(): void {
    this._overlay.hideOverlay();
  }

  /**
   * Toggle overlay visibility
   */
  toggleOverlay(): void {
    this._overlay.toggleOverlay();
  }

  /**
   * Check if overlay is visible
   */
  isOverlayVisible(): boolean {
    return this._overlay.isOverlayVisible();
  }

  /**
   * Update overlay data
   */
  updateOverlay(data: Record<string, unknown>): void {
    this._overlay.updateOverlay(data);
  }

  /**
   * Get overlay state
   */
  getOverlayState(): DebugOverlay | null {
    return this._overlay.getOverlayState();
  }

  /**
   * Highlight element visually for debugging
   */
  highlightElement(element: Element, color: string): void {
    this._overlay.highlightElement(element, color);
  }

  /**
   * Remove highlight from element
   */
  unhighlightElement(element: Element): void {
    this._overlay.unhighlightElement(element);
  }

  /**
   * Create debug border around element
   */
  debugBorder(
    element: Element,
    options: { color?: string; width?: string; style?: 'solid' | 'dashed' | 'dotted' } = {}
  ): void {
    this._overlay.debugBorder(element, options);
  }

  /**
   * Export debug data
   */
  export(): {
    events: DebugEvent[];
    counters: Record<string, number>;
    timers: any[];
    config: DebugConfig;
    overlay: DebugOverlay;
  } {
    return {
      events: this._eventTracker.getEvents(),
      counters: this._counter.getCounters(),
      timers: [], // To be implemented by TimersMixin
      config: { ...this._config },
      overlay: this._overlay.getOverlayState(),
    };
  }

  /**
   * Import debug data
   */
  import(data: {
    events?: DebugEvent[];
    counters?: Record<string, number>;
    config?: DebugConfig;
  }): void {
    if (data.events) {
      this._eventTracker.importEvents(data.events);
    }

    if (data.counters) {
      this._counter.importCounters(data.counters);
    }

    if (data.config) {
      this._config = { ...this._config, ...data.config };
      this._updateSubConfigs();
    }
  }

  /**
   * Get JSON export
   */
  toJSON(): string {
    return JSON.stringify(this.export());
  }

  /**
   * Get statistics
   */
  getStatistics(): DebugStatistics {
    return {
      totalEvents: this._eventTracker.getEventCount(),
      totalTimers: 0, // To be implemented by TimersMixin
      totalCounters: this._counter.getCounterCount(),
      totalMemorySnapshots: this._memory.getMemorySnapshotCount(),
      activeTimers: 0, // To be implemented by TimersMixin
    };
  }

  /**
   * Reset all debug data
   */
  reset(): void {
    this._eventTracker.clearEvents();
    this._counter.clearCounters();
    this._memory.clearMemorySnapshots();
  }

  /**
   * Update sub-module configs
   */
  private _updateSubConfigs(): void {
    this._logger.updateConfig(this._config);
    this._eventTracker.updateConfig(this._config);
    this._counter.updateConfig(this._config);
    this._memory.updateConfig(this._config);
    this._overlay.updateConfig(this._config);
  }
}
