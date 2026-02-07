'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Добро пожаловать, {user?.name || 'Издатель'}!
      </h1>
      <p className="text-gray-600">
        Это ваша главная страница. Здесь будет статистика ваших доходов.
      </p>
    </div>
  );
}
