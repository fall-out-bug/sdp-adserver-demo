'use client';

import React from 'react';

interface Stats {
  impressions: number;
  clicks: number;
  revenue: number;
  ecpm: number;
}

interface Change {
  revenue?: number;
  impressions?: number;
  clicks?: number;
}

interface Props {
  stats: Stats;
  change?: Change;
}

export function StatsCards({ stats, change }: Props) {
  const cards = [
    {
      title: 'Показы',
      value: stats.impressions.toLocaleString('ru-RU'),
      change: change?.impressions,
      icon: '👁️',
    },
    {
      title: 'Клики',
      value: stats.clicks.toLocaleString('ru-RU'),
      change: change?.clicks,
      icon: '🖱️',
    },
    {
      title: 'Доход',
      value: `$${stats.revenue.toFixed(2)}`,
      change: change?.revenue,
      icon: '💰',
    },
    {
      title: 'eCPM',
      value: `$${stats.ecpm.toFixed(2)}`,
      change: undefined,
      icon: '📊',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
              {card.change !== undefined && (
                <p className={`text-sm mt-1 ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change >= 0 ? '+' : ''}{(card.change * 100).toFixed(1)}%
                </p>
              )}
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
