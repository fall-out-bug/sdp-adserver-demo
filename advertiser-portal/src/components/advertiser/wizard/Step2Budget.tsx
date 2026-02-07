'use client';

import { useWizardStore } from '@/lib/stores/wizard';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function Step2Budget() {
  const { formData, updateFormData } = useWizardStore();

  const totalBudget = formData.totalBudget || 500;
  const dailyCap = formData.dailyCap || 50;
  const bidAmount = formData.bidAmount || 2.5;

  const estimatedImpressions = Math.floor((totalBudget / bidAmount) * 1000);
  const estimatedDays = Math.ceil(totalBudget / dailyCap);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Бюджет и ставки</h2>

      <div className="space-y-4">
        <Input
          label="Общий бюджет ($)"
          type="number"
          value={totalBudget}
          onChange={(e) => updateFormData({ totalBudget: parseFloat(e.target.value) })}
          min={10}
          required
        />

        <Input
          label="Дневной лимит ($)"
          type="number"
          value={dailyCap}
          onChange={(e) => updateFormData({ dailyCap: parseFloat(e.target.value) })}
          min={1}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тип ставки
          </label>
          <div className="flex gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="bidType"
                value="cpm"
                checked={formData.bidType === 'cpm'}
                onChange={(e) => updateFormData({ bidType: e.target.value as 'cpm' | 'cpc' })}
                className="mr-2"
              />
              <span>CPM (за 1000 показов)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="bidType"
                value="cpc"
                checked={formData.bidType === 'cpc'}
                onChange={(e) => updateFormData({ bidType: e.target.value as 'cpm' | 'cpc' })}
                className="mr-2"
              />
              <span>CPC (за клик)</span>
            </label>
          </div>
        </div>

        <Input
          label={`Ставка (${formData.bidType?.toUpperCase()})`}
          type="number"
          value={bidAmount}
          onChange={(e) => updateFormData({ bidAmount: parseFloat(e.target.value) })}
          min={0.01}
          step={0.01}
          required
        />

        <Card>
          <h3 className="font-semibold mb-3">Оценка</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Примерно показов:</span>
              <span className="font-semibold">{estimatedImpressions.toLocaleString('ru-RU')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Дней кампании:</span>
              <span className="font-semibold">{estimatedDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">В день (примерно):</span>
              <span className="font-semibold">
                {Math.floor(estimatedImpressions / estimatedDays).toLocaleString('ru-RU')} показов
              </span>
            </div>
          </div>
        </Card>

        <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Контроль бюджета</p>
          <p>Кампания автоматически остановится при достижении общего бюджета.</p>
        </div>
      </div>
    </div>
  );
}
