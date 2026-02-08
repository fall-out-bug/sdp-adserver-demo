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
    if (this.getLogLevel() <= LogLevel.DEBUG) {
      console.warn(`[AdServerSDK] [DEBUG] ${message}`, data ?? '');
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (this.getLogLevel() <= LogLevel.INFO) {
      console.warn(`[AdServerSDK] [INFO] ${message}`, data ?? '');
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void {
    if (this.getLogLevel() <= LogLevel.WARN) {
      console.warn(`[AdServerSDK] [WARN] ${message}`, data ?? '');
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    if (this.getLogLevel() <= LogLevel.ERROR) {
      console.error(`[AdServerSDK] [ERROR] ${message}`, error ?? '', data ?? '');
    }
  }
}
