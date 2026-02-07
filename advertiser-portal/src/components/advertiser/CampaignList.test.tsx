import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CampaignList } from './CampaignList';
import type { Campaign } from '@/lib/api/campaigns';

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Test Campaign',
    status: 'active',
    totalBudget: 500,
    dailyCap: 50,
    spent: 100,
    impressions: 10000,
    clicks: 100,
    ctr: 1.0,
    createdAt: '2026-02-01T00:00:00Z',
  },
];

describe('CampaignList', () => {
  it('renders loading state', () => {
    render(<CampaignList campaigns={[]} isLoading={true} />);
    expect(screen.getByText('Загрузка кампаний...')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<CampaignList campaigns={[]} isLoading={false} />);
    expect(screen.getByText('У вас пока нет кампаний')).toBeInTheDocument();
    expect(screen.getByText('Создать первую кампанию')).toBeInTheDocument();
  });

  it('renders campaigns list', () => {
    render(<CampaignList campaigns={mockCampaigns} isLoading={false} />);
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    expect(screen.getByText('Активна')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('displays correct status label', () => {
    const pausedCampaign: Campaign = { ...mockCampaigns[0], status: 'paused' };
    render(<CampaignList campaigns={[pausedCampaign]} isLoading={false} />);
    expect(screen.getByText('На паузе')).toBeInTheDocument();
  });

  it('displays CTR correctly', () => {
    render(<CampaignList campaigns={mockCampaigns} isLoading={false} />);
    expect(screen.getByText('1.00%')).toBeInTheDocument();
  });
});
