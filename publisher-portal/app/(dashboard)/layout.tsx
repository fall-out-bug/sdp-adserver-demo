import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Demo AdServer</h1>
            <a href="/logout" className="text-gray-600 hover:text-gray-900">
              Выйти
            </a>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
