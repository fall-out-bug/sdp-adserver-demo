'use client';

import { Card } from '@/components/ui/Card';

interface Props {
  spent: number;
  budget: number;
  dailyCap?: number;
  dailySpent?: number;
}

export function SpendProgress({ spent, budget, dailyCap, dailySpent }: Props) {
  const totalPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const dailyPercentage = dailyCap ? (dailySpent || 0) / dailyCap * 100 : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Бюджет исчерпан';
    if (percentage >= 80) return '⚠️ Почти исчерпан';
    if (percentage >= 50) return 'Использовано половина';
    return 'Нормально';
  };

  return (
    <Card>
      <h3 className="font-semibold mb-4">Прогресс расходов</h3>

      <div className="space-y-6">
        {/* Total Budget */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Общий бюджет</span>
            <span className="font-semibold">
              ${spent.toFixed(2)} / ${budget}
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor(totalPercentage)} transition-all`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-600">{totalPercentage.toFixed(1)}%</span>
            <span className="text-xs text-gray-600">
              ${Math.max(0, budget - spent).toFixed(2)} осталось
            </span>
          </div>
        </div>

        {/* Daily Cap */}
        {dailyCap && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Дневной лимит</span>
              <span className="font-semibold">
                ${(dailySpent || 0).toFixed(2)} / ${dailyCap}
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(dailyPercentage)} transition-all`}
                style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600">{dailyPercentage.toFixed(1)}%</span>
              <span className="text-xs text-gray-600">
                ${Math.max(0, dailyCap - (dailySpent || 0)).toFixed(2)} осталось
              </span>
            </div>
          </div>
        )}

        {/* Status Message */}
        <div
          className={`p-3 rounded ${
            totalPercentage >= 80
              ? 'bg-yellow-50 text-yellow-800'
              : totalPercentage >= 50
              ? 'bg-blue-50 text-blue-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          <p className="text-sm font-semibold">{getStatusText(totalPercentage)}</p>
        </div>
      </div>
    </Card>
  );
}
