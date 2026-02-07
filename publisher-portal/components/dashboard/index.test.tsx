import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { RevenueChart } from './RevenueChart';
import { RevenueTicker } from './RevenueTicker';

// Basic smoke tests for chart components to ensure they render
describe('Dashboard Components Smoke Tests', () => {
  it('RevenueChart renders without crashing', () => {
    expect(() => render(<RevenueChart data={[]} />)).not.toThrow();
  });

  it('RevenueTicker renders without crashing', () => {
    expect(() => render(<RevenueTicker revenue={100} />)).not.toThrow();
  });
});
