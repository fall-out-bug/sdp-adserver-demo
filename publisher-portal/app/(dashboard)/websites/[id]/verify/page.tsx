'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { websitesApi } from '@/lib/api/websites';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function VerifyWebsitePage() {
  const params = useParams();
  const websiteId = params.id as string;

  const { data: website, isLoading } = useQuery({
    queryKey: ['website', websiteId],
    queryFn: async () => {
      const websites = await websitesApi.list();
      return websites.find((w) => w.id === websiteId);
    },
  });

  const metaTag = websitesApi.getVerificationTag(websiteId);

  if (isLoading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (!website) {
    return <div className="p-6">Сайт не найден</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Верификация сайта</h1>

      <Card className="mb-6">
        <h3 className="font-semibold mb-2">{website.name}</h3>
        <p className="text-gray-600">{website.url}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Инструкция по верификации</h2>

        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-2">1. Скопируйте этот мета-тег:</p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
              <code>{metaTag}</code>
            </div>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => navigator.clipboard.writeText(metaTag)}
            >
              Копировать
            </Button>
          </div>

          <div>
            <p className="font-semibold mb-2">2. Добавьте его в &lt;head&gt; вашего сайта:</p>
            <div className="bg-gray-100 p-4 rounded text-sm">
              <pre className="text-gray-800">{`<!DOCTYPE html>
<html>
<head>
  ${metaTag}
  <!-- другие мета-теги -->
</head>
<body>
  ...
</body>
</html>`}</pre>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-2">3. Сохраните изменения на сайте</p>
          </div>

          <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
            <p>Верификация проверяется автоматически. Обычно это занимает до 5 минут.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
