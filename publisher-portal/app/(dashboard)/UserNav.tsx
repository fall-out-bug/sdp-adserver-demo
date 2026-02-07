'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';

export function UserNav() {
  const { user } = useAuthStore();

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">{user?.name}</span>
      <Link href="/settings" className="text-gray-600 hover:text-gray-900">
        Настройки
      </Link>
    </div>
  );
}
