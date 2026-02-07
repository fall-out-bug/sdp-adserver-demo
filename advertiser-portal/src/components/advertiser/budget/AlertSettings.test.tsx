import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AlertSettings } from './AlertSettings';

describe('AlertSettings', () => {
  it('renders threshold buttons', () => {
    render(
      <AlertSettings
        thresholds={[50, 75]}
        email={true}
        push={false}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('highlights selected thresholds', () => {
    const { container } = render(
      <AlertSettings
        thresholds={[50]}
        email={true}
        push={false}
        onChange={vi.fn()}
      />
    );
    const button50 = screen.getByText('50%').closest('button');
    expect(button50).toHaveClass('bg-primary-600');
  });

  it('calls onChange when threshold clicked', () => {
    const handleChange = vi.fn();
    render(
      <AlertSettings
        thresholds={[]}
        email={true}
        push={false}
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByText('50%'));
    expect(handleChange).toHaveBeenCalledWith({ thresholds: [50] });
  });

  it('toggles email preference', () => {
    const handleChange = vi.fn();
    render(
      <AlertSettings
        thresholds={[]}
        email={true}
        push={false}
        onChange={handleChange}
      />
    );

    const emailCheckbox = screen.getByText('Email').previousElementSibling as HTMLInputElement;
    fireEvent.click(emailCheckbox);
    expect(handleChange).toHaveBeenCalledWith({ email: false });
  });
});
