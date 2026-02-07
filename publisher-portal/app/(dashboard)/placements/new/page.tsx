'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { placementsApi, AD_FORMATS } from '@/lib/api/placements';
import { websitesApi } from '@/lib/api/websites';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NewPlacementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    websiteId: '',
    format: 'banner' as 'banner' | 'native' | 'video',
    size: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: websites } = useQuery({
    queryKey: ['websites'],
    queryFn: websitesApi.list,
  });

  const mutation = useMutation({
    mutationFn: placementsApi.create,
    onSuccess: (placement) => {
      router.push(`/placements/${placement.id}`);
    },
    onError: (err: any) => {
      setErrors({ form: err.response?.data?.error || 'Ошибка создания размещения' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.size) {
      setErrors({ size: 'Выберите размер' });
      return;
    }

    mutation.mutate(formData);
  };

  const availableSizes = AD_FORMATS[formData.format] || [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Создать размещение</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 text-red-600 rounded">
              {errors.form}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сайт
            </label>
            <select
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              value={formData.websiteId}
              onChange={(e) => setFormData({ ...formData, websiteId: e.target.value })}
              required
            >
              <option value="">Выберите сайт</option>
              {websites?.filter(w => w.status === 'verified').map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.url})
                </option>
              ))}
            </select>
            {websites && websites.filter(w => w.status === 'verified').length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                Верифицируйте сайт перед созданием размещения
              </p>
            )}
          </div>

          <Input
            label="Название размещения"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Баннер в сайдбаре"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Формат рекламы
            </label>
            <div className="flex gap-3">
              {(['banner', 'native', 'video'] as const).map((format) => (
                <label key={format} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={formData.format === format}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        format: e.target.value as any,
                        size: '',
                      });
                    }}
                    className="mr-2"
                  />
                  <span className="capitalize">{format}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Размер
            </label>
            <select
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              required
            >
              <option value="">Выберите размер</option>
              {availableSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
            {errors.size && (
              <p className="text-sm text-red-600 mt-1">{errors.size}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Создание...' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={mutation.isPending}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
