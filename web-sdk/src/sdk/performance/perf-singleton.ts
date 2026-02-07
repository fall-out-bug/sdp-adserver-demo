/**
 * Performance Singleton - Global performance monitor instance
 */

import type { PerformanceConfig } from './perf-core-base.js';
import { PerformanceMonitor } from './perf-full.js';

// Singleton instance
let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * Get global performance monitor instance
 */
export function getPerformanceMonitor(config?: PerformanceConfig): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor(config);
  }
  return globalPerformanceMonitor;
}

/**
 * Reset global performance monitor
 */
export function resetPerformanceMonitor(): void {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.reset();
  }
  globalPerformanceMonitor = null;
}
