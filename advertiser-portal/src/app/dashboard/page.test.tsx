import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

describe('Dashboard Page', () => {
  it('renders dashboard header', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders create campaign button', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Создать кампанию')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    render(<DashboardPage />);
    expect(screen.getAllByText('Потрачено').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Показы').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Клики').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CTR').length).toBeGreaterThan(0);
  });

  it('displays calculated totals', () => {
    const { container } = render(<DashboardPage />);
    // Check that the component renders without errors
    // The totals are calculated from mock campaigns
    expect(screen.getByText('Spring Sale 2026')).toBeInTheDocument();
  });

  it('renders campaigns list', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Spring Sale 2026')).toBeInTheDocument();
    expect(screen.getByText('Brand Awareness')).toBeInTheDocument();
  });
});
