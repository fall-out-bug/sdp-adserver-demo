'use client';

import { useEffect, useState } from 'react';

interface Props {
  spent: number;
  budget: number;
}

export function LiveSpendCounter({ spent, budget }: Props) {
  const [displaySpent, setDisplaySpent] = useState(spent);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    if (spent > displaySpent) {
      setDirection('up');
    } else if (spent < displaySpent) {
      setDirection('down');
    } else {
      setDirection('neutral');
    }

    const timeout = setTimeout(() => {
      setDisplaySpent(spent);
      setDirection('neutral');
    }, 500);

    return () => clearTimeout(timeout);
  }, [spent, displaySpent]);

  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white mb-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-purple-100 text-sm font-medium">РАСХОД СЕГОДНЯ</p>
          <p className="text-4xl font-bold mt-1">${displaySpent.toFixed(2)}</p>
          <p className="text-purple-100 text-sm mt-1">из ${budget.toFixed(2)} бюджета</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
          <span className="text-sm text-purple-100">Live</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/80 transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <p className="text-xs text-purple-100 mt-2">{percentage.toFixed(1)}% бюджета израсходовано</p>
    </div>
  );
}
