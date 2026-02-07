'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  campaignId: string;
}

export function TrendChart({ campaignId }: Props) {
  const { data: trendData } = useQuery({
    queryKey: ['campaign-trend', campaignId],
    queryFn: async () => {
      // Mock data - would be real API call
      return [
        { date: '01-02', impressions: 1200, clicks: 8 },
        { date: '02-02', impressions: 1450, clicks: 12 },
        { date: '03-02', impressions: 1100, clicks: 7 },
        { date: '04-02', impressions: 1800, clicks: 15 },
        { date: '05-02', impressions: 1650, clicks: 13 },
        { date: '06-02', impressions: 1900, clicks: 18 },
        { date: '07-02', impressions: 2100, clicks: 22 },
      ];
    },
    refetchInterval: 30000,
  });

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="impressions"
            stroke="#0ea5e9"
            strokeWidth={2}
            name="Показы"
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Клики"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
