import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BudgetSettings } from './BudgetSettings';

describe('BudgetSettings', () => {
  it('renders budget overview', () => {
    const handleChange = vi.fn();
    render(<BudgetSettings value={{ totalBudget: 500, dailyCap: 50, alertThresholds: [50], alertEmail: true, alertPush: false, autoStop: true }} onChange={handleChange} />);
    expect(screen.getByText('Обзор бюджета')).toBeInTheDocument();
  });

  it('displays total budget', () => {
    const handleChange = vi.fn();
    render(<BudgetSettings value={{ totalBudget: 500, dailyCap: 50, alertThresholds: [], alertEmail: true, alertPush: false, autoStop: true }} onChange={handleChange} />);
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('shows budget configuration', () => {
    const handleChange = vi.fn();
    render(<BudgetSettings value={{ totalBudget: 500, dailyCap: 50, alertThresholds: [], alertEmail: true, alertPush: false, autoStop: true }} onChange={handleChange} />);
    expect(screen.getByText('Настройки бюджета')).toBeInTheDocument();
  });
});
