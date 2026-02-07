'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api/stats';
import { placementsApi } from '@/lib/api/placements';
import { useRealtimeStats } from '@/lib/hooks/useRealtimeStats';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RevenueTicker } from '@/components/dashboard/RevenueTicker';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

export default function DashboardPage() {
  const { data: stats, isLoading } = useRealtimeStats();

  const { data: chartData } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => statsApi.getRevenueChart('7d'),
  });

  const { data: placements } = useQuery({
    queryKey: ['placements'],
    queryFn: placementsApi.list,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/placements/new">
          <Button>Создать размещение</Button>
        </Link>
      </div>

      {/* Real-time Revenue Ticker */}
      {stats && <RevenueTicker revenue={stats.stats.revenue} change={stats.change?.revenue} />}

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats.stats} change={stats.change} />}

      {/* Placements Table */}
      {placements && placements.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Ваши размещения</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Название</th>
                  <th className="text-right py-3 px-4">Показы</th>
                  <th className="text-right py-3 px-4">Клики</th>
                  <th className="text-right py-3 px-4">Доход</th>
                  <th className="text-right py-3 px-4">eCPM</th>
                </tr>
              </thead>
              <tbody>
                {placements.slice(0, 5).map((placement) => (
                  <tr key={placement.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{placement.name}</td>
                    <td className="text-right py-3 px-4">
                      {placement.impressions?.toLocaleString('ru-RU') || '—'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {placement.clicks?.toLocaleString('ru-RU') || '—'}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      {placement.revenue ? `$${placement.revenue.toFixed(2)}` : '—'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {placement.ecpm ? `$${placement.ecpm.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Revenue Chart */}
      {chartData && chartData.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Доход за 7 дней</h2>
          <RevenueChart data={chartData} />
        </Card>
      )}

      {/* Empty State */}
      {!placements || placements.length === 0 ? (
        <Card className="mt-6">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">Нет активных размещений</p>
            <p className="text-sm text-gray-500 mb-4">
              Создайте первое размещение чтобы начать зарабатывать
            </p>
            <Link href="/placements/new">
              <Button>Создать размещение</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
