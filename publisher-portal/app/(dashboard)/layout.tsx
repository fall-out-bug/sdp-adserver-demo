import React from 'react';
import Link from 'next/link';
import { Providers } from './providers';
import { UserNav } from './UserNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Demo AdServer</h1>
              <UserNav />
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex gap-6">
            <aside className="w-48">
              <nav className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded hover:bg-gray-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/websites"
                  className="block px-3 py-2 rounded hover:bg-gray-200"
                >
                  Мои сайты
                </Link>
                <Link
                  href="/placements"
                  className="block px-3 py-2 rounded hover:bg-gray-200"
                >
                  Размещения
                </Link>
                <Link
                  href="/reports"
                  className="block px-3 py-2 rounded hover:bg-gray-200"
                >
                  Отчеты
                </Link>
              </nav>
            </aside>

            <main className="flex-1">{children}</main>
          </div>
        </div>
      </div>
    </Providers>
  );
}
