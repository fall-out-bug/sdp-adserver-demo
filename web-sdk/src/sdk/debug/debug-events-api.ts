/**
 * Debug Events API - Event tracking API for DebugManager
 */

import { DebugManager } from './debug-manager.js';
import type { DebugEvent } from './debug-types.js';

/**
 * Extend DebugManager with event tracking methods
 */
export declare class DebugManagerEvents extends DebugManager {
  /**
   * Log debug message
   */
  debug(message: string, data?: Record<string, unknown>): void;

  /**
   * Log info message
   */
  info(message: string, data?: Record<string, unknown>): void;

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, unknown>): void;

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;

  /**
   * Record debug event
   */
  recordEvent(type: string, data: Record<string, unknown>): void;

  /**
   * Get all events
   */
  getEvents(): DebugEvent[];

  /**
   * Get events by type
   */
  getEventsByType(type: string): DebugEvent[];

  /**
   * Clear all events
   */
  clearEvents(): void;
}
