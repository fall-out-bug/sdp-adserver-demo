/**
 * Debug Core Logging - Logging functionality for DebugManager
 */

import { DebugManager } from './debug-manager.js';

/**
 * Extend DebugManager with logging methods
 */
export class DebugManagerWithLogging extends DebugManager {
  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    (this as { _logger: { debug: (msg: string, d?: Record<string, unknown>) => void } })._logger.debug(message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    (this as { _logger: { info: (msg: string, d?: Record<string, unknown>) => void } })._logger.info(message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    (this as { _logger: { warn: (msg: string, d?: Record<string, unknown>) => void } })._logger.warn(message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    (this as { _logger: { error: (msg: string, err?: Error | unknown, d?: Record<string, unknown>) => void } })._logger.error(message, error, data);
  }
}
