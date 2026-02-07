import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Polyfill ResizeObserver for Recharts
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Extend expect with jest-dom matchers in beforeEach to ensure globals are loaded
beforeEach(() => {
  global.ResizeObserver = ResizeObserverMock;
  // @ts-ignore - vitest globals
  if (typeof expect !== 'undefined') {
    // @ts-ignore
    expect.extend(matchers);
  }
});

afterEach(() => {
  cleanup();
});
