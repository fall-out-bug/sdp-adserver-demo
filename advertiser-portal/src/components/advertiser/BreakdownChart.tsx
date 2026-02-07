'use client';

import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Props {
  campaignId: string;
  type: 'device' | 'geo' | 'banner';
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export function BreakdownChart({ campaignId, type }: Props) {
  const { data: breakdownData } = useQuery({
    queryKey: ['campaign-breakdown', campaignId, type],
    queryFn: async () => {
      // Mock data - would be real API call
      if (type === 'device') {
        return [
          { name: 'Desktop', value: 4500, impressions: 4500, clicks: 35 },
          { name: 'Mobile', value: 3200, impressions: 3200, clicks: 28 },
          { name: 'Tablet', value: 800, impressions: 800, clicks: 5 },
        ];
      }
      if (type === 'geo') {
        return [
          { name: 'Россия', value: 6200 },
          { name: 'Беларусь', value: 1200 },
          { name: 'Казахстан', value: 800 },
          { name: 'Другие', value: 300 },
        ];
      }
      return [
        { name: 'Banner 1 (300x250)', value: 4100 },
        { name: 'Banner 2 (728x90)', value: 3200 },
        { name: 'Banner 3 (160x600)', value: 1200 },
      ];
    },
    refetchInterval: 30000,
  });

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={breakdownData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={(entry) => `${entry.name}: ${entry.value}`}
          >
            {breakdownData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
