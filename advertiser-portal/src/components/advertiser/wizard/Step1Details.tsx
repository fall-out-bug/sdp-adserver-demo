'use client';

import { useWizardStore } from '@/lib/stores/wizard';
import { Input } from '@/components/ui/Input';

export function Step1Details() {
  const { formData, updateFormData } = useWizardStore();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Детали кампании</h2>

      <div className="space-y-4">
        <Input
          label="Название кампании"
          value={formData.name || ''}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Spring Sale 2026"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание (опционально)
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
            rows={3}
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Опишите вашу кампанию..."
          />
        </div>

        <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
          <p className="font-semibold mb-2">Советы:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Используйте понятное название для удобства</li>
            <li>Описание поможет вам помнить цель кампании</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
