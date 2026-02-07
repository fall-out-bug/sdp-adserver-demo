/**
 * EventEmitter - Event system for SDK lifecycle and custom events
 */

type EventListener = (...args: unknown[]) => void;

type EventType = string | symbol;

interface EventEmitterConfig {
  maxListeners?: number;
}

/**
 * EventEmitter class for managing SDK events
 * Supports: on, off, once, emit
 */
export class EventEmitter {
  private _events: Map<EventType, Set<EventListener>>;
  private _maxListeners: number;
  private _eventCount: Map<EventType, number>;

  constructor(config: EventEmitterConfig = {}) {
    this._events = new Map();
    this._maxListeners = config.maxListeners ?? 100;
    this._eventCount = new Map();
  }

  /**
   * Register event listener
   */
  on(event: EventType, listener: EventListener): this {
    this._addListener(event, listener, false);
    return this;
  }

  /**
   * Register one-time event listener
   */
  once(event: EventType, listener: EventListener): this {
    this._addListener(event, listener, true);
    return this;
  }

  /**
   * Remove event listener
   */
  off(event: EventType, listener?: EventListener): this {
    const listeners = this._events.get(event);
    if (!listeners) return this;

    if (listener) {
      listeners.delete(listener);
      this._decrementEventCount(event);
    } else {
      this._events.delete(event);
      this._eventCount.delete(event);
    }

    return this;
  }

  /**
   * Emit event to all listeners
   */
  emit(event: EventType, ...args: unknown[]): boolean {
    const listeners = this._events.get(event);
    if (!listeners || listeners.size === 0) return false;

    // Create copy to avoid issues if listeners modify the set during iteration
    const listenersArray = Array.from(listeners);
    const toRemove: EventListener[] = [];

    for (const listener of listenersArray) {
      try {
        listener(...args);
      } catch (error) {
        // Log error but don't stop propagation
        console.error(`Error in event listener for "${String(event)}":`, error);
      }

      // Check if this was a once listener (marked with a special property)
      if ((listener as unknown as { _once: boolean })._once) {
        toRemove.push(listener);
      }
    }

    // Remove once listeners
    for (const listener of toRemove) {
      listeners.delete(listener);
      this._decrementEventCount(event);
    }

    return true;
  }

  /**
   * Remove all listeners for all events or specific event
   */
  removeAllListeners(event?: EventType): this {
    if (event) {
      this._events.delete(event);
      this._eventCount.delete(event);
    } else {
      this._events.clear();
      this._eventCount.clear();
    }
    return this;
  }

  /**
   * Get listener count for event
   */
  listenerCount(event: EventType): number {
    return this._events.get(event)?.size ?? 0;
  }

  /**
   * Get all event names
   */
  eventNames(): EventType[] {
    return Array.from(this._events.keys());
  }

  private _addListener(event: EventType, listener: EventListener, once: boolean): void {
    let listeners = this._events.get(event);
    if (!listeners) {
      listeners = new Set();
      this._events.set(event, listeners);
      this._eventCount.set(event, 0);
    }

    const count = this._eventCount.get(event)!;
    if (count >= this._maxListeners) {
      console.warn(
        `Possible memory leak detected. ${count} listeners registered for "${String(event)}". Max: ${this._maxListeners}`
      );
    }

    // Mark once listeners
    if (once) {
      (listener as unknown as { _once: boolean })._once = true;
    }

    listeners.add(listener);
    this._eventCount.set(event, count + 1);
  }

  private _decrementEventCount(event: EventType): void {
    const count = this._eventCount.get(event);
    if (count !== undefined) {
      if (count <= 1) {
        this._eventCount.delete(event);
      } else {
        this._eventCount.set(event, count - 1);
      }
    }
  }
}

// Singleton instance for SDK
let globalEventEmitter: EventEmitter | null = null;

export function getEventEmitter(): EventEmitter {
  if (!globalEventEmitter) {
    globalEventEmitter = new EventEmitter();
  }
  return globalEventEmitter;
}

export function resetEventEmitter(): void {
  if (globalEventEmitter) {
    globalEventEmitter.removeAllListeners();
  }
  globalEventEmitter = null;
}
