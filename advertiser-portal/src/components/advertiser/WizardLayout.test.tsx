import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { WizardLayout } from './WizardLayout';

describe('WizardLayout', () => {
  it('renders current step indicator', () => {
    render(
      <WizardLayout
        currentStep={2}
        totalSteps={4}
        onNext={() => {}}
        onPrevious={() => {}}
      >
        Content
      </WizardLayout>
    );
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    const { container } = render(
      <WizardLayout
        currentStep={1}
        totalSteps={4}
        onNext={() => {}}
        onPrevious={() => {}}
      >
        Content
      </WizardLayout>
    );
    const progressBar = container.querySelector('.bg-primary-600') as HTMLElement;
    expect(progressBar.style.width).toBe('25%');
  });

  it('renders children content', () => {
    render(
      <WizardLayout
        currentStep={1}
        totalSteps={4}
        onNext={() => {}}
        onPrevious={() => {}}
      >
        <div>Step content here</div>
      </WizardLayout>
    );
    expect(screen.getByText('Step content here')).toBeInTheDocument();
  });

  it('calls onNext when Next button is clicked', async () => {
    const user = userEvent.setup();
    const handleNext = vi.fn();
    render(
      <WizardLayout
        currentStep={1}
        totalSteps={4}
        onNext={handleNext}
        onPrevious={() => {}}
      >
        Content
      </WizardLayout>
    );
    await user.click(screen.getByText('Next →'));
    expect(handleNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious when Back button is clicked', async () => {
    const user = userEvent.setup();
    const handlePrevious = vi.fn();
    render(
      <WizardLayout
        currentStep={2}
        totalSteps={4}
        onNext={() => {}}
        onPrevious={handlePrevious}
      >
        Content
      </WizardLayout>
    );
    await user.click(screen.getByText('← Back'));
    expect(handlePrevious).toHaveBeenCalledTimes(1);
  });

  it('disables Back button on first step', () => {
    render(
      <WizardLayout
        currentStep={1}
        totalSteps={4}
        onNext={() => {}}
        onPrevious={() => {}}
      >
        Content
      </WizardLayout>
    );
    const backButton = screen.getByText('← Back').closest('button');
    expect(backButton).toBeDisabled();
  });

  it('shows Launch Campaign button on last step', () => {
    render(
      <WizardLayout
        currentStep={4}
        totalSteps={4}
        onNext={() => {}}
        onPrevious={() => {}}
      >
        Content
      </WizardLayout>
    );
    expect(screen.getByText('Launch Campaign →')).toBeInTheDocument();
  });

  it('disables Next button when onNextDisabled is true', () => {
    render(
      <WizardLayout
        currentStep={1}
        totalSteps={4}
        onNext={() => {}}
        onPrevious={() => {}}
        onNextDisabled={true}
      >
        Content
      </WizardLayout>
    );
    const nextButton = screen.getByText('Next →').closest('button');
    expect(nextButton).toBeDisabled();
  });
});
