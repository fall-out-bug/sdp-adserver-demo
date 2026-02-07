export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Demo AdServer</h1>
        <p className="text-center text-gray-600 mb-8">
          Publisher Portal
        </p>
        <div className="space-y-4">
          <a
            href="/register"
            className="block w-full text-center bg-primary-600 text-white py-3 rounded hover:bg-primary-700 transition"
          >
            Регистрация
          </a>
          <a
            href="/login"
            className="block w-full text-center bg-gray-200 text-gray-900 py-3 rounded hover:bg-gray-300 transition"
          >
            Войти
          </a>
        </div>
      </div>
    </div>
  );
}
