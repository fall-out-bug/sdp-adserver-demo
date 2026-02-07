/**
 * Debug - Debug mode with visual debugging capabilities
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface DebugConfig {
  enabled?: boolean;
  logLevel?: LogLevel;
  enableOverlay?: boolean;
  maxEvents?: number;
  maxTimers?: number;
  maxCounters?: number;
}

export interface DebugEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface TimerEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface MemorySnapshot {
  label: string;
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
}

export interface DebugOverlay {
  visible: boolean;
  data: Record<string, unknown>;
}

export interface DebugStatistics {
  totalEvents: number;
  totalTimers: number;
  totalCounters: number;
  totalMemorySnapshots: number;
  activeTimers: number;
}

export interface DebugBorderOptions {
  color?: string;
  width?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * DebugManager class for SDK debugging with visual capabilities
 */
export class DebugManager {
  private _config: Required<DebugConfig>;
  private _events: DebugEvent[] = [];
  private _timers: Map<string, TimerEntry> = new Map();
  private _counters: Map<string, number> = new Map();
  private _memorySnapshots: MemorySnapshot[] = [];
  private _overlay: DebugOverlay = { visible: false, data: {} };
  private _highlightedElements: WeakMap<Element, string> = new WeakMap();

  constructor(config: DebugConfig = {}) {
    this._config = {
      enabled: config.enabled ?? false,
      logLevel: config.logLevel ?? LogLevel.INFO,
      enableOverlay: config.enableOverlay ?? true,
      maxEvents: config.maxEvents ?? 1000,
      maxTimers: config.maxTimers ?? 100,
      maxCounters: config.maxCounters ?? 50,
    };
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
    this.log(LogLevel.INFO, 'Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disable(): void {
    this._config.enabled = false;
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
   * Show debug overlay
   */
  showOverlay(): boolean {
    if (!this._config.enabled || !this._config.enableOverlay) {
      return false;
    }
    this._overlay.visible = true;
    this._updateOverlayElement();
    return true;
  }

  /**
   * Hide debug overlay
   */
  hideOverlay(): void {
    this._overlay.visible = false;
    this._removeOverlayElement();
  }

  /**
   * Toggle overlay visibility
   */
  toggleOverlay(): void {
    if (this._overlay.visible) {
      this.hideOverlay();
    } else {
      this.showOverlay();
    }
  }

  /**
   * Check if overlay is visible
   */
  isOverlayVisible(): boolean {
    return this._overlay.visible;
  }

  /**
   * Update overlay data
   */
  updateOverlay(data: Record<string, unknown>): void {
    this._overlay.data = { ...this._overlay.data, ...data };
    if (this._overlay.visible) {
      this._updateOverlayElement();
    }
  }

  /**
   * Get overlay state
   */
  getOverlayState(): DebugOverlay | null {
    return { ...this._overlay };
  }

  /**
   * Start a timer
   */
  startTimer(name: string): void {
    if (!this._config.enabled) return;

    if (this._timers.has(name)) {
      this.warn(`Timer "${name}" already exists, overwriting`);
    }

    this._timers.set(name, {
      name,
      startTime: performance.now(),
    });

    // Limit timers
    if (this._timers.size > this._config.maxTimers) {
      const firstKey = this._timers.keys().next().value;
      if (firstKey) {
        this._timers.delete(firstKey);
      }
    }
  }

  /**
   * Stop a timer and return duration
   */
  stopTimer(name: string): number {
    const timer = this._timers.get(name);
    if (!timer) {
      throw new Error(`Timer "${name}" not found`);
    }

    const endTime = performance.now();
    const duration = endTime - timer.startTime;

    this._timers.set(name, {
      ...timer,
      endTime,
      duration,
    });

    return duration;
  }

  /**
   * Measure timer without stopping it
   */
  measureTimer(name: string): number {
    const timer = this._timers.get(name);
    if (!timer) {
      throw new Error(`Timer "${name}" not found`);
    }

    return performance.now() - timer.startTime;
  }

  /**
   * Get all timers
   */
  getTimers(): TimerEntry[] {
    return Array.from(this._timers.values());
  }

  /**
   * Clear a specific timer
   */
  clearTimer(name: string): void {
    this._timers.delete(name);
  }

  /**
   * Clear all timers
   */
  clearAllTimers(): void {
    this._timers.clear();
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, amount = 1): void {
    const current = this._counters.get(name) ?? 0;
    this._counters.set(name, current + amount);

    // Limit counters
    if (this._counters.size > this._config.maxCounters) {
      const firstKey = this._counters.keys().next().value;
      if (firstKey) {
        this._counters.delete(firstKey);
      }
    }
  }

  /**
   * Decrement a counter
   */
  decrementCounter(name: string, amount = 1): void {
    const current = this._counters.get(name) ?? 0;
    this._counters.set(name, Math.max(0, current - amount));
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this._counters.get(name) ?? 0;
  }

  /**
   * Reset a counter
   */
  resetCounter(name: string): void {
    this._counters.set(name, 0);
  }

  /**
   * Get all counters
   */
  getCounters(): Record<string, number> {
    return Object.fromEntries(this._counters);
  }

  /**
   * Clear all counters
   */
  clearCounters(): void {
    this._counters.clear();
  }

  /**
   * Track memory usage at a point
   */
  trackMemory(label: string): number | null {
    if (!this._config.enabled) return null;

    if (
      typeof performance === 'undefined' ||
      !(performance as any).memory
    ) {
      this.warn('Memory API not available');
      return null;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      label,
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
    };

    this._memorySnapshots.push(snapshot);

    // Limit snapshots
    if (this._memorySnapshots.length > this._config.maxEvents) {
      this._memorySnapshots.shift();
    }

    return memory.usedJSHeapSize;
  }

  /**
   * Get memory usage for a label
   */
  getMemoryUsage(label: string): number | null {
    const snapshot = this._memorySnapshots.find((s) => s.label === label);
    return snapshot?.usedJSHeapSize ?? null;
  }

  /**
   * Get memory difference between two snapshots
   */
  getMemoryDiff(label1: string, label2: string): number | null {
    const snapshot1 = this._memorySnapshots.find((s) => s.label === label1);
    const snapshot2 = this._memorySnapshots.find((s) => s.label === label2);

    if (!snapshot1 || !snapshot2) return null;

    return snapshot2.usedJSHeapSize - snapshot1.usedJSHeapSize;
  }

  /**
   * Get all memory snapshots
   */
  getMemorySnapshots(): MemorySnapshot[] {
    return [...this._memorySnapshots];
  }

  /**
   * Highlight element visually for debugging
   */
  highlightElement(element: Element, color: string): void {
    if (!this._config.enabled) return;

    element.classList.add('ads-debug-highlight');
    (element as HTMLElement).style.outline = `2px solid ${color}`;
    this._highlightedElements.set(element, color);
  }

  /**
   * Remove highlight from element
   */
  unhighlightElement(element: Element): void {
    element.classList.remove('ads-debug-highlight');
    (element as HTMLElement).style.outline = '';
    this._highlightedElements.delete(element);
  }

  /**
   * Create debug border around element
   */
  debugBorder(
    element: Element,
    options: DebugBorderOptions = {}
  ): void {
    if (!this._config.enabled) return;

    const {
      color = 'red',
      width = '2px',
      style = 'solid',
    } = options;

    element.classList.add('ads-debug-border', `ads-debug-border-${color}`);
    (element as HTMLElement).style.border = `${width} ${style} ${color}`;
  }

  /**
   * Export debug data
   */
  export(): {
    events: DebugEvent[];
    counters: Record<string, number>;
    timers: TimerEntry[];
    config: DebugConfig;
    overlay: DebugOverlay;
  } {
    return {
      events: [...this._events],
      counters: this.getCounters(),
      timers: this.getTimers(),
      config: { ...this._config },
      overlay: { ...this._overlay },
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
      this._events = [...data.events];
    }

    if (data.counters) {
      this._counters = new Map(Object.entries(data.counters));
    }

    if (data.config) {
      this._config = { ...this._config, ...data.config };
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
      totalEvents: this._events.length,
      totalTimers: this._timers.size,
      totalCounters: this._counters.size,
      totalMemorySnapshots: this._memorySnapshots.length,
      activeTimers: Array.from(this._timers.values()).filter(
        (t) => t.endTime === undefined
      ).length,
    };
  }

  /**
   * Reset all debug data
   */
  reset(): void {
    this._events = [];
    this._timers.clear();
    this._counters.clear();
    this._memorySnapshots = [];
    this._overlay = { visible: false, data: {} };
    this._removeOverlayElement();
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
        console.log(prefix, timestamp, message, data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, timestamp, message, data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, timestamp, message, data ?? '');
        break;
    }
  }

  /**
   * Update overlay element in DOM
   */
  private _updateOverlayElement(): void {
    if (typeof window === 'undefined') return;

    let overlay = document.getElementById('ads-debug-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ads-debug-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.85);
        color: #0f0;
        padding: 15px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 999999;
        max-width: 300px;
        max-height: 400px;
        overflow: auto;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">AdServer Debug</div>
      ${Object.entries(this._overlay.data)
        .map(([key, value]) => `<div>${key}: ${JSON.stringify(value)}</div>`)
        .join('')}
    `;
  }

  /**
   * Remove overlay element from DOM
   */
  private _removeOverlayElement(): void {
    if (typeof window === 'undefined') return;

    const overlay = document.getElementById('ads-debug-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Singleton instance
let globalDebugManager: DebugManager | null = null;

/**
 * Get global debug manager instance
 */
export function getDebugManager(config?: DebugConfig): DebugManager {
  if (!globalDebugManager) {
    globalDebugManager = new DebugManager(config);
  } else if (config) {
    // Update config if provided
    Object.assign(globalDebugManager, { _config: { ...globalDebugManager, ...config } });
  }
  return globalDebugManager;
}

/**
 * Reset global debug manager
 */
export function resetDebugManager(): void {
  if (globalDebugManager) {
    globalDebugManager.reset();
  }
  globalDebugManager = null;
}
