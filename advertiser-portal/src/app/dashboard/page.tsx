'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LiveSpendCounter } from '@/components/advertiser/LiveSpendCounter';
import { CampaignList } from '@/components/advertiser/CampaignList';

// Mock data for now - will be replaced with API calls
const mockCampaigns = [
  {
    id: '1',
    name: 'Spring Sale 2026',
    status: 'active' as const,
    totalBudget: 500,
    dailyCap: 50,
    spent: 123.45,
    impressions: 12500,
    clicks: 87,
    ctr: 0.696,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Brand Awareness',
    status: 'paused' as const,
    totalBudget: 1000,
    dailyCap: 100,
    spent: 456.78,
    impressions: 45000,
    clicks: 234,
    ctr: 0.52,
    createdAt: '2026-01-15T00:00:00Z',
  },
];

export default function DashboardPage() {
  const totals = mockCampaigns.reduce(
    (acc, c) => ({
      spent: acc.spent + (c.spent || 0),
      budget: acc.budget + c.totalBudget,
      impressions: acc.impressions + (c.impressions || 0),
      clicks: acc.clicks + (c.clicks || 0),
    }),
    { spent: 0, budget: 0, impressions: 0, clicks: 0 }
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/campaigns/new">
          <Button>Создать кампанию</Button>
        </Link>
      </div>

      {/* Live Spend Counter */}
      <LiveSpendCounter spent={totals.spent} budget={totals.budget} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Потрачено</p>
              <p className="text-2xl font-bold">${totals.spent.toFixed(2)}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Показы</p>
              <p className="text-2xl font-bold">{totals.impressions.toLocaleString('ru-RU')}</p>
            </div>
            <span className="text-3xl">👁️</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Клики</p>
              <p className="text-2xl font-bold">{totals.clicks.toLocaleString('ru-RU')}</p>
            </div>
            <span className="text-3xl">🖱️</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CTR</p>
              <p className="text-2xl font-bold">
                {totals.impressions > 0
                  ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%`
                  : '0%'}
              </p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <CampaignList campaigns={mockCampaigns} isLoading={false} />
    </div>
  );
}
