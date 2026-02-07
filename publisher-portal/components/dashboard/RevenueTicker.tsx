'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  revenue: number;
  change?: number;
}

export function RevenueTicker({ revenue, change }: Props) {
  const [displayRevenue, setDisplayRevenue] = useState(revenue);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (revenue > displayRevenue) {
      setDirection('up');
    } else if (revenue < displayRevenue) {
      setDirection('down');
    }

    const timeout = setTimeout(() => {
      setDisplayRevenue(revenue);
      setDirection('neutral');
    }, 500);

    return () => clearTimeout(timeout);
  }, [revenue, displayRevenue]);

  const changePercent = change ? (change * 100).toFixed(0) : '0';
  const isPositive = change && change > 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-blue-100 text-sm font-medium">ДОХОД СЕГОДНЯ</p>
          <p className="text-4xl font-bold mt-1">
            ${displayRevenue.toFixed(2)}
          </p>
        </div>

        {change !== undefined && (
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
            {isPositive ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-lg font-semibold">{Math.abs(Number(changePercent))}%</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
          <span className="text-sm text-blue-100">Live</span>
        </div>
      </div>

      {/* Progress bar animation */}
      <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white/60 animate-progress" style={{ animation: 'progress 5s linear infinite' }} />
      </div>
    </div>
  );
}
