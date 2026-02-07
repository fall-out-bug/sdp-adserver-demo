/**
 * Debug Events - Event tracking for DebugManager
 */

import type { DebugEvent, DebugConfig } from './debug-types.js';

/**
 * DebugEventTracker class for event tracking
 */
export class DebugEventTracker {
  private _config: Required<DebugConfig>;
  private _events: DebugEvent[] = [];

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
   * Record debug event
   */
  recordEvent(type: string, data: Record<string, unknown> = {}): void {
    if (!this._config.enabled) return;

    const event: DebugEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this._events.push(event);

    // Limit events
    if (this._events.length > this._config.maxEvents) {
      this._events.shift();
    }
  }

  /**
   * Get all events
   */
  getEvents(): DebugEvent[] {
    return [...this._events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): DebugEvent[] {
    return this._events.filter((e) => e.type === type);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this._events = [];
  }

  /**
   * Get event count
   */
  getEventCount(): number {
    return this._events.length;
  }

  /**
   * Import events from external source
   */
  importEvents(events: DebugEvent[]): void {
    for (const event of events) {
      this._events.push(event);
    }
  }
}
