'use client';

import { useWizardStore } from '@/lib/stores/wizard';
import { Card } from '@/components/ui/Card';

export function Step4Review() {
  const { formData } = useWizardStore();

  const budgetInfo = {
    total: formData.totalBudget || 0,
    daily: formData.dailyCap || 0,
    bidType: formData.bidType || 'cpm',
    bidAmount: formData.bidAmount || 0,
  };

  const targeting = formData.targeting;
  const bannerCount = formData.banners?.length || 0;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Проверьте и запустите</h2>

      <div className="space-y-4">
        <Card>
          <h3 className="font-semibold text-lg mb-3">Информация о кампании</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Название:</span>
              <span className="font-semibold">{formData.name}</span>
            </div>
            {formData.description && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Описание:</span>
                <span className="font-semibold">{formData.description}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-lg mb-3">Бюджет</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Общий бюджет:</span>
              <span className="font-semibold">${budgetInfo.total}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Дневной лимит:</span>
              <span className="font-semibold">${budgetInfo.daily}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Тип ставки:</span>
              <span className="font-semibold uppercase">{budgetInfo.bidType}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Ставка:</span>
              <span className="font-semibold">${budgetInfo.bidAmount}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-lg mb-3">Баннеры</h3>
          <p className="text-gray-600">
            {bannerCount} {bannerCount === 1 ? 'баннер' : bannerCount < 5 ? 'баннера' : 'баннеров'} загружено
          </p>
          {bannerCount === 0 && (
            <p className="text-red-600 text-sm mt-1">⚠️ Добавьте хотя бы один баннер</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-lg mb-3">Таргетинг</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">География:</span>
              <span className="font-semibold">{targeting?.geo?.join(', ') || 'Все'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Устройства:</span>
              <span className="font-semibold">{targeting?.devices?.join(', ') || 'Все'}</span>
            </div>
            {targeting?.schedule && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Расписание:</span>
                <span className="font-semibold">
                  Пн-Пт, {targeting.schedule.hours.start}:00-{targeting.schedule.hours.end}:00
                </span>
              </div>
            )}
          </div>
        </Card>

        <div className="bg-red-50 p-4 rounded text-sm text-red-800">
          <p className="font-semibold mb-1">⚠️ Перед запуском</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Проверьте настройки бюджета</li>
            <li>Убедитесь что баннеры корректно отображаются</li>
            <li>Проверьте настройки таргетинга</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
