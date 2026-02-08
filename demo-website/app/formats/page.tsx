import Link from 'next/link';
import { BANNER_FORMATS } from '@/types/demo';

export default function FormatsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container py-4">
          <Link href="/" className="text-primary-600 hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-bold mt-2">Ad Formats</h1>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Supported Ad Formats</h2>
          <p className="text-gray-600">
            Click on any format to see detailed specifications and examples.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {BANNER_FORMATS.map((format) => (
            <Link
              key={format.format}
              href={`/formats/${format.format}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold">{format.name}</h3>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {format.width}×{format.height}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{format.description}</p>
              <div className="flex items-center text-primary-600 font-medium">
                View Details →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
