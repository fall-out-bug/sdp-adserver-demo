import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant styles by default', () => {
    const { container } = render(<Button>Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('applies secondary variant styles', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-gray-200');
  });

  it('calls onClick when clicked', () => {
    let clicked = false;
    const handleClick = () => { clicked = true; };
    const { container } = render(<Button onClick={handleClick}>Click</Button>);
    const button = container.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(clicked).toBe(true);
  });

  it('is disabled when disabled prop is true', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
