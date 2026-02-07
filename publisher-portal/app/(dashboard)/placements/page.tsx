'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi, AD_FORMATS } from '@/lib/api/placements';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';

export default function PlacementsPage() {
  const [codeModal, setCodeModal] = useState<{ open: boolean; code: string; name: string }>({
    open: false,
    code: '',
    name: '',
  });

  const { data: placements, isLoading } = useQuery({
    queryKey: ['placements'],
    queryFn: placementsApi.list,
  });

  const getFormatLabel = (format: string) => {
    const labels = { banner: 'Баннер', native: 'Нативный', video: 'Видео' };
    return labels[format as keyof typeof labels];
  };

  const getSizeInfo = (size: string) => {
    for (const format of Object.values(AD_FORMATS)) {
      for (const s of format) {
        if (s.value === size) return s;
      }
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои размещения</h1>
        <Link href="/placements/new">
          <Button>Создать размещение</Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : !placements || placements.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">У вас пока нет размещений</p>
            <Link href="/placements/new">
              <Button>Создать первое размещение</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Название</th>
                <th className="text-left py-3 px-4">Формат</th>
                <th className="text-left py-3 px-4">Размер</th>
                <th className="text-left py-3 px-4">Статус</th>
                <th className="text-left py-3 px-4">Код</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((placement) => {
                const sizeInfo = getSizeInfo(placement.size);
                return (
                  <tr key={placement.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{placement.name}</td>
                    <td className="py-3 px-4">{getFormatLabel(placement.format)}</td>
                    <td className="py-3 px-4">
                      {sizeInfo ? sizeInfo.label : placement.size}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        placement.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {placement.status === 'active' ? 'Активен' : 'Пауза'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setCodeModal({
                          open: true,
                          code: placementsApi.generateAdCode(placement.id),
                          name: placement.name,
                        })}
                      >
                        Получить код
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={codeModal.open}
        onClose={() => setCodeModal({ ...codeModal, open: false })}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Код для {codeModal.name}</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
            <pre>{codeModal.code}</pre>
          </div>
          <Button
            className="mt-4"
            onClick={() => navigator.clipboard.writeText(codeModal.code)}
          >
            Копировать код
          </Button>
        </div>
      </Modal>
    </div>
  );
}
