import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewCampaignPage from './page';
import { useWizardStore } from '@/lib/stores/wizard';
import { campaignsApi } from '@/lib/api/campaigns';

vi.mock('@/lib/stores/wizard');
vi.mock('@/lib/api/campaigns');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('New Campaign Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWizardStore).mockReturnValue({
      currentStep: 1,
      formData: { name: 'Test Campaign', totalBudget: 500, banners: [] },
      setStep: vi.fn(),
      updateFormData: vi.fn(),
      resetWizard: vi.fn(),
    } as any);
  });

  it('renders first step', () => {
    render(<NewCampaignPage />);
    expect(screen.getByText('Детали кампании')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    render(<NewCampaignPage />);
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    const { container } = render(<NewCampaignPage />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2); // Back and Next buttons
  });

  it('displays wizard title', () => {
    render(<NewCampaignPage />);
    expect(screen.getByText('Детали кампании')).toBeInTheDocument();
  });
});
