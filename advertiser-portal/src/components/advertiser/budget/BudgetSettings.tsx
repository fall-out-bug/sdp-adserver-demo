'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface BudgetConfig {
  totalBudget: number;
  dailyCap: number;
  alertThresholds: number[];
  alertEmail: boolean;
  alertPush: boolean;
  autoStop: boolean;
}

interface Props {
  value: BudgetConfig;
  onChange: (value: BudgetConfig) => void;
  readOnly?: boolean;
}

export function BudgetSettings({ value, onChange, readOnly = false }: Props) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (updates: Partial<BudgetConfig>) => {
    const newValue = { ...localValue, ...updates };
    setLocalValue(newValue);
    if (!readOnly) {
      onChange(newValue);
    }
  };

  const budgetUsage = 45.67; // Would come from stats
  const budgetPercentage = (budgetUsage / localValue.totalBudget) * 100;

  return (
    <div className="space-y-4">
      {/* Budget Overview */}
      <Card>
        <h3 className="font-semibold text-lg mb-4">Обзор бюджета</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Общий бюджет:</span>
            <span className="font-semibold">${localValue.totalBudget}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Потрачено:</span>
            <span className="font-semibold">${budgetUsage.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Осталось:</span>
            <span className="font-semibold text-green-600">
              ${(localValue.totalBudget - budgetUsage).toFixed(2)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                budgetPercentage > 90
                  ? 'bg-red-500'
                  : budgetPercentage > 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>

          <p className="text-xs text-gray-600 text-center">{budgetPercentage.toFixed(1)}% бюджета использовано</p>
        </div>
      </Card>

      {/* Budget Configuration */}
      <Card>
        <h3 className="font-semibold text-lg mb-4">Настройки бюджета</h3>

        <div className="space-y-4">
          <Input
            label="Общий бюджет ($)"
            type="number"
            value={localValue.totalBudget}
            onChange={(e) => handleChange({ totalBudget: parseFloat(e.target.value) })}
            disabled={readOnly}
            min={10}
          />

          <Input
            label="Дневной лимит ($)"
            type="number"
            value={localValue.dailyCap}
            onChange={(e) => handleChange({ dailyCap: parseFloat(e.target.value) })}
            disabled={readOnly}
            min={1}
          />

          <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
            <p className="font-semibold mb-1">ℹ️ Автоматическая остановка</p>
            <p>
              {localValue.autoStop
                ? 'Кампания остановится при достижении дневного лимита.'
                : 'Кампания может превысить дневной лимит.'}
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localValue.autoStop}
              onChange={(e) => handleChange({ autoStop: e.target.checked })}
              disabled={readOnly}
              className="rounded"
            />
            <span className="text-sm">Останавливать кампанию при достижении дневного лимита</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
