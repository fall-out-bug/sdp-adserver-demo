import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SpendProgress } from './SpendProgress';

describe('SpendProgress', () => {
  it('renders total budget progress', () => {
    render(<SpendProgress spent={100} budget={500} />);
    expect(screen.getByText('$100.00 / $500')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
  });

  it('shows remaining amount', () => {
    render(<SpendProgress spent={100} budget={500} />);
    expect(screen.getByText('$400.00 осталось')).toBeInTheDocument();
  });

  it('displays daily cap when provided', () => {
    render(<SpendProgress spent={100} budget={500} dailyCap={50} dailySpent={25} />);
    expect(screen.getByText('$25.00 / $50')).toBeInTheDocument();
  });

  it('shows warning when budget is low', () => {
    render(<SpendProgress spent={450} budget={500} />);
    expect(screen.getByText(/Почти исчерпан/)).toBeInTheDocument();
  });

  it('shows exhausted when budget is 100%', () => {
    render(<SpendProgress spent={500} budget={500} />);
    expect(screen.getByText('Бюджет исчерпан')).toBeInTheDocument();
  });
});
