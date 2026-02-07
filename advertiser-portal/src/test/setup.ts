import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import './types';

beforeEach(() => {
  // @ts-ignore - vitest globals
  if (typeof expect !== 'undefined') {
    // @ts-ignore
    expect.extend(matchers);
  }
});

afterEach(() => {
  cleanup();
});
