import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LiveSpendCounter } from './LiveSpendCounter';

describe('LiveSpendCounter', () => {
  it('renders spent amount', () => {
    render(<LiveSpendCounter spent={100.5} budget={500} />);
    expect(screen.getByText('$100.50')).toBeInTheDocument();
  });

  it('shows correct percentage', () => {
    render(<LiveSpendCounter spent={250} budget={500} />);
    expect(screen.getByText(/50\.0%/)).toBeInTheDocument();
  });

  it('displays Live indicator', () => {
    render(<LiveSpendCounter spent={100} budget={500} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('displays budget range', () => {
    render(<LiveSpendCounter spent={100} budget={500} />);
    expect(screen.getByText(/из \$500\.00 бюджета/)).toBeInTheDocument();
  });
});
