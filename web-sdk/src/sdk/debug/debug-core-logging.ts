/**
 * Debug Core Logging - Logging functionality for DebugManager
 */

import { DebugManager } from './debug-manager.js';
import { LogLevel } from './debug-logging.js';

/**
 * Extend DebugManager with logging methods
 */
export class DebugManagerWithLogging extends DebugManager {
  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void {
    (this as any)._logger.debug(message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    (this as any)._logger.info(message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    (this as any)._logger.warn(message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    (this as any)._logger.error(message, error, data);
  }
}
