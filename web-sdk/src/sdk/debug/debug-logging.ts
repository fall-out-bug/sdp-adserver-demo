/**
 * Debug Logging - Logging functionality for DebugManager
 */

import type { DebugConfig } from './debug-types.js';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * DebugLogger class for logging functionality
 */
export class DebugLogger {
  private _config: Required<DebugConfig>;

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
   * Get current log level
   */
  getLogLevel(): LogLevel {
    return this._config.logLevel;
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this._config.logLevel = level;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error
      ? { ...data, error: error.message, stack: error.stack }
      : data;
    this.log(LogLevel.ERROR, message, errorData);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this._config.enabled || level < this._config.logLevel) return;

    const prefix = `[AdServerSDK Debug] [${LogLevel[level]}]`;
    const timestamp = new Date().toISOString();

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.warn(prefix, timestamp, message, data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, timestamp, message, data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, timestamp, message, data ?? '');
        break;
    }
  }
}
