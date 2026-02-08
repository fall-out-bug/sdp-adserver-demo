import Link from 'next/link';
import { BANNER_FORMATS } from '@/types/demo';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return BANNER_FORMATS.map((format) => ({
    format: format.format,
  }));
}

export default function FormatPage({ params }: { params: { format: string } }) {
  const format = BANNER_FORMATS.find((f) => f.format === params.format);

  if (!format) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container py-4">
          <Link href="/formats" className="text-primary-600 hover:underline">
            ← Back to Formats
          </Link>
          <h1 className="text-3xl font-bold mt-2">{format.name}</h1>
        </div>
      </header>

      <div className="container py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Format Info */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-lg font-semibold">
                {format.width}×{format.height}
              </span>
              <span className="text-gray-500">pixels</span>
            </div>
            <p className="text-gray-600 text-lg">{format.description}</p>
          </div>

          {/* Preview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
              <div
                className="bg-gradient-to-br from-primary-400 to-primary-600 rounded flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ width: `${format.width}px`, height: `${format.height}px` }}
              >
                {format.name}
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 font-semibold">Format ID</td>
                  <td className="py-3">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {format.format}
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">Width</td>
                  <td className="py-3">{format.width}px</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">Height</td>
                  <td className="py-3">{format.height}px</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">IAB Standard</td>
                  <td className="py-3">
                    {['leaderboard', 'medium-rectangle', 'skyscraper', 'half-page'].includes(format.format)
                      ? '✅ Yes'
                      : '❌ No (Native)'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Integration */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Integration Example</h2>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<div id="ad-slot" style="width: ${format.width}px; height: ${format.height}px;"></div>
<script>
  AdServer.loadBanner('${format.format}', 'ad-slot');
</script>`}</code>
            </pre>
          </div>

          <div className="mt-8">
            <Link
              href="/demo"
              className="btn btn-primary"
            >
              See Live Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
