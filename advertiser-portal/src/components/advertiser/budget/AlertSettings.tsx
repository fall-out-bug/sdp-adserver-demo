'use client';

import { Card } from '@/components/ui/Card';

interface Props {
  thresholds: number[];
  email: boolean;
  push: boolean;
  onChange: (settings: any) => void;
  readOnly?: boolean;
}

export function AlertSettings({ thresholds, email, push, onChange, readOnly }: Props) {
  const availableThresholds = [25, 50, 75, 80, 90, 95, 100];

  return (
    <Card>
      <h3 className="font-semibold mb-4">Настройки уведомлений</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Уведомлять при достижении:</p>
          <div className="grid grid-cols-4 gap-2">
            {availableThresholds.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  const newThresholds = thresholds.includes(t)
                    ? thresholds.filter((th) => th !== t)
                    : [...thresholds, t];
                  onChange({ thresholds: newThresholds.sort((a: number, b: number) => a - b) });
                }}
                disabled={readOnly}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  thresholds.includes(t)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t}%
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Получать уведомления через:</p>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-lg">📧</span>
                <span className="text-sm">Email</span>
              </div>
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => onChange({ email: e.target.checked })}
                disabled={readOnly}
                className="rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔔</span>
                <span className="text-sm">Push уведомления</span>
              </div>
              <input
                type="checkbox"
                checked={push}
                onChange={(e) => onChange({ push: e.target.checked })}
                disabled={readOnly}
                className="rounded"
              />
            </label>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
          <p>💡 Уведомления отправляются в реальном времени при достижении указанных порогов бюджета.</p>
        </div>
      </div>
    </Card>
  );
}
