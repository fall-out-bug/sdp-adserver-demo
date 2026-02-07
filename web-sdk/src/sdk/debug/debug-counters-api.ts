/**
 * Debug Counters API - Counter tracking API for DebugManager
 */

import { DebugManager } from './debug-manager.js';

/**
 * Extend DebugManager with counter tracking methods
 */
export declare class DebugManagerCounters extends DebugManager {
  /**
   * Increment a counter
   */
  incrementCounter(name: string, amount?: number): void;

  /**
   * Decrement a counter
   */
  decrementCounter(name: string, amount?: number): void;

  /**
   * Get counter value
   */
  getCounter(name: string): number;

  /**
   * Reset a counter
   */
  resetCounter(name: string): void;

  /**
   * Get all counters
   */
  getCounters(): Record<string, number>;

  /**
   * Clear all counters
   */
  clearCounters(): void;
}
