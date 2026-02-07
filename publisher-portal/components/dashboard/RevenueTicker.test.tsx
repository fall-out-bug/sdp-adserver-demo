import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RevenueTicker } from './RevenueTicker';

describe('RevenueTicker', () => {
  it('renders revenue', () => {
    render(<RevenueTicker revenue={100.5} />);
    expect(screen.getByText('$100.50')).toBeInTheDocument();
  });

  it('shows positive change', () => {
    render(<RevenueTicker revenue={100} change={0.23} />);
    expect(screen.getByText('23%')).toBeInTheDocument();
  });

  it('shows negative change', () => {
    render(<RevenueTicker revenue={100} change={-0.15} />);
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('displays live indicator', () => {
    render(<RevenueTicker revenue={100} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});
