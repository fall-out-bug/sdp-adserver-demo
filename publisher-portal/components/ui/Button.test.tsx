import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant classes', () => {
    render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3');
  });

  it('is disabled when loading', () => {
    render(<Button disabled>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
