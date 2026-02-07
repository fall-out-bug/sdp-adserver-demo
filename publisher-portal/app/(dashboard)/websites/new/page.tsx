'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { websitesApi } from '@/lib/api/websites';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NewWebsitePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: websitesApi.create,
    onSuccess: (website) => {
      router.push(`/websites/${website.id}/verify`);
    },
    onError: (err: any) => {
      setErrors({ form: err.response?.data?.error || 'Ошибка добавления сайта' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate URL
    try {
      new URL(formData.url);
    } catch {
      setErrors({ url: 'Некорректный URL' });
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Добавить сайт</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-red-50 text-red-600 rounded">
              {errors.form}
            </div>
          )}

          <Input
            label="Название сайта"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Мой блог"
            required
          />

          <Input
            label="URL сайта"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            error={errors.url}
            placeholder="https://example.com"
            required
          />

          <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
            <p className="font-semibold mb-2">После добавления:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Скопируйте мета-тег верификации</li>
              <li>Добавьте его на ваш сайт в &lt;head&gt;</li>
              <li>Мы проверим верификацию автоматически</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Добавление...' : 'Добавить сайт'}
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
