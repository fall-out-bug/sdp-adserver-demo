/**
 * Debug Types - Type definitions for DebugManager
 */

export interface DebugConfig {
  enabled?: boolean;
  logLevel?: import('./debug-logging.js').LogLevel;
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

export interface DebugBorderOptions {
  color?: string;
  width?: string;
  style?: string;
}
