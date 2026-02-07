'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  revenue: number;
}

interface Props {
  data: DataPoint[];
}

export function RevenueChart({ data }: Props) {
  const formattedData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    revenue: d.revenue,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Доход']}
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ fill: '#0ea5e9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
