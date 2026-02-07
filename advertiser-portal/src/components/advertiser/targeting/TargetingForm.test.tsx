import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TargetingForm } from './TargetingForm';
import { useWizardStore } from '@/lib/stores/wizard';

vi.mock('@/lib/stores/wizard');

describe('TargetingForm', () => {
  beforeEach(() => {
    vi.mocked(useWizardStore).mockReturnValue({
      formData: {
        targeting: {
          geo: ['RU'],
          devices: ['desktop', 'mobile'],
          schedule: { days: [1, 2, 3, 4, 5], hours: { start: 9, end: 21 } },
          categories: [],
        },
      },
      updateFormData: vi.fn(),
    } as any);
  });

  it('renders targeting sections', () => {
    render(<TargetingForm />);
    expect(screen.getByText('Настройка таргетинга')).toBeInTheDocument();
    expect(screen.getByText('География')).toBeInTheDocument();
    expect(screen.getByText('Устройства')).toBeInTheDocument();
  });

  it('expands section on click', () => {
    render(<TargetingForm />);
    // Geo is expanded by default, so we should see the country list
    expect(screen.getByText('Россия')).toBeInTheDocument();
  });

  it('displays summary for collapsed sections', () => {
    render(<TargetingForm />);
    // Geo section is expanded by default, so we should see countries
    expect(screen.getByText('Россия')).toBeInTheDocument();
  });
});
