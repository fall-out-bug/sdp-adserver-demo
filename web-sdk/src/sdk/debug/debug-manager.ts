/**
 * Debug Manager - Main DebugManager class implementation
 */

import type { DebugConfig } from './debug-types.js';
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
   * Update sub-module configs
   */
  protected _updateSubConfigs(): void {
    this._logger.updateConfig(this._config);
    this._eventTracker.updateConfig(this._config);
    this._counter.updateConfig(this._config);
    this._memory.updateConfig(this._config);
    this._overlay.updateConfig(this._config);
  }
}
