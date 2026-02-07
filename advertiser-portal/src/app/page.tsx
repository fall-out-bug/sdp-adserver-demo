import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Advertiser Portal
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Добро пожаловать в портал рекламодателя
        </p>
        <div className="space-y-4">
          <Link
            href="/register"
            className="block w-full text-center bg-primary-600 text-white py-3 rounded hover:bg-primary-700 transition"
          >
            Регистрация
          </Link>
          <Link
            href="/login"
            className="block w-full text-center bg-gray-200 text-gray-900 py-3 rounded hover:bg-gray-300 transition"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
