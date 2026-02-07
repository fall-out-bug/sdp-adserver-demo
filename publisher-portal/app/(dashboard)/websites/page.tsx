'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { websitesApi } from '@/lib/api/websites';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function WebsitesPage() {
  const queryClient = useQueryClient();

  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: websitesApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: websitesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const labels = {
      pending: 'Ожидает верификации',
      verified: 'Верифицирован',
      rejected: 'Отклонен',
    };

    return (
      <span className={`px-2 py-1 rounded text-sm ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои сайты</h1>
        <Link href="/websites/new">
          <Button>Добавить сайт</Button>
        </Link>
      </div>

      {isLoading ? (
        <div>Загрузка...</div>
      ) : !websites || websites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">У вас пока нет добавленных сайтов</p>
            <Link href="/websites/new">
              <Button>Добавить первый сайт</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {websites.map((website) => (
            <Card key={website.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{website.name}</h3>
                    {getStatusBadge(website.status)}
                  </div>
                  <p className="text-gray-600">{website.url}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Добавлен: {new Date(website.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                <div className="flex gap-2">
                  {website.status === 'pending' && (
                    <Link href={`/websites/${website.id}/verify`}>
                      <Button variant="secondary" size="sm">
                        Верификация
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Удалить сайт?')) {
                        deleteMutation.mutate(website.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
