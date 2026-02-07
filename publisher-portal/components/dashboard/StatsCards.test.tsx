import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatsCards } from './StatsCards';

describe('StatsCards', () => {
  it('renders all stats cards', () => {
    const stats = {
      impressions: 1000,
      clicks: 50,
      revenue: 10.5,
      ecpm: 10.5,
    };

    render(<StatsCards stats={stats} />);

    expect(screen.getByText('Показы')).toBeInTheDocument();
    expect(screen.getByText('Клики')).toBeInTheDocument();
    expect(screen.getByText('Доход')).toBeInTheDocument();
    expect(screen.getByText('eCPM')).toBeInTheDocument();
  });

  it('displays numeric values', () => {
    const stats = {
      impressions: 1000,
      clicks: 50,
      revenue: 10.5,
      ecpm: 10.5,
    };

    const { container } = render(<StatsCards stats={stats} />);

    // Check that values are rendered
    expect(container.textContent).toContain('50');
  });

  it('shows change indicators when provided', () => {
    const stats = {
      impressions: 1000,
      clicks: 50,
      revenue: 10.5,
      ecpm: 10.5,
    };
    const change = {
      revenue: 0.23,
      impressions: 0.15,
      clicks: 0.1,
    };

    const { container } = render(<StatsCards stats={stats} change={change} />);

    // Check that percentage indicators are present
    expect(container.textContent).toMatch(/%/);
  });
});
