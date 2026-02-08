import Link from 'next/link';
import { BANNER_FORMATS } from '@/types/demo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Monetize Your Traffic with AdServer
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Simple, fast, and powerful ad delivery platform. Start showing ads
              on your website in less than 5 minutes.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/demo" className="btn btn-primary">
                Live Demo
              </Link>
              <Link href="/formats" className="btn btn-secondary">
                View Formats
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose AdServer?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Our SDK delivers ads in under 100ms, ensuring your page load
                speed stays optimized.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
              <p className="text-gray-600">
                Just 3 lines of code to get started. No complex setup required.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                Track impressions, clicks, and revenue in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formats Preview */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">
            Supported Ad Formats
          </h2>
          <p className="text-center text-gray-600 mb-12">
            All standard IAB formats plus native advertising
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BANNER_FORMATS.map((format) => (
              <Link
                key={format.format}
                href={`/formats/${format.format}`}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{format.name}</h3>
                  <span className="text-sm text-gray-500">
                    {format.width}×{format.height}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{format.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join 1000+ publishers already using AdServer
          </p>
          <Link href="/demo" className="btn bg-white text-primary-600 hover:bg-primary-50">
            View Live Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container text-center">
          <p>&copy; 2026 AdServer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
