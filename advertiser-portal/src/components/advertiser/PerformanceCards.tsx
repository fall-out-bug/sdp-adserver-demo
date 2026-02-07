'use client';

interface Props {
  stats: {
    impressions?: number;
    clicks?: number;
    spent?: number;
    ctr?: number;
  };
}

export function PerformanceCards({ stats }: Props) {
  const cards = [
    {
      title: 'Показы',
      value: stats.impressions?.toLocaleString('ru-RU') || '0',
      change: stats.impressions && stats.impressions > 0 ? '+12%' : '+0%',
      icon: '👁️',
    },
    {
      title: 'Клики',
      value: stats.clicks?.toLocaleString('ru-RU') || '0',
      change: stats.clicks && stats.clicks > 0 ? '+8%' : '+0%',
      icon: '🖱️',
    },
    {
      title: 'CTR',
      value: stats.ctr ? `${stats.ctr.toFixed(2)}%` : '0%',
      change: stats.ctr && stats.ctr > 0.5 ? '+0.1%' : '+0%',
      icon: '📊',
    },
    {
      title: 'eCPM',
      value:
        stats.impressions && stats.impressions > 0 && stats.spent
          ? `$${(stats.spent / stats.impressions) * 1000}`
          : '$0.00',
      change: '+$0.10',
      icon: '💰',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
              <p
                className={`text-sm mt-1 ${
                  card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {card.change}
              </p>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
