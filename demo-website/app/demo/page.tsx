'use client';

import { useEffect, useState } from 'react';
import { initSDK } from '@/lib/sdk';

export default function DemoPage() {
  const [loadedBanners, setLoadedBanners] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize SDK
    const sdk = initSDK({ debug: true });

    // Load banners when component mounts
    const slotIds = ['demo-leaderboard', 'demo-medium-rect', 'demo-skyscraper'];

    slotIds.forEach((slotId) => {
      sdk
        .loadBanner(slotId, `container-${slotId}`)
        .then(() => {
          setLoadedBanners((prev) => new Set(prev).add(slotId));
        })
        .catch((err) => {
          console.error(`Failed to load ${slotId}:`, err);
        });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">🚀 AdServer Live Demo</h1>
        </div>
      </header>

      <div className="container py-8">
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Live Ad Examples</h2>
          <p className="text-gray-600">
            See AdServer SDK in action. These banners are loaded dynamically from
            our backend.
          </p>
        </div>

        {/* Leaderboard */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Leaderboard (728×90)</h3>
          <div className="bg-white rounded-lg shadow p-8 flex justify-center">
            <div id="container-demo-leaderboard" className="border border-gray-200 rounded">
              {!loadedBanners.has('demo-leaderboard') && (
                <div className="w-[728px] h-[90px] flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Medium Rectangle */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4">
            Medium Rectangle (300×250)
          </h3>
          <div className="bg-white rounded-lg shadow p-8 flex justify-center">
            <div id="container-demo-medium-rect" className="border border-gray-200 rounded">
              {!loadedBanners.has('demo-medium-rect') && (
                <div className="w-[300px] h-[250px] flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Skyscraper */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Skyscraper (160×600)</h3>
          <div className="bg-white rounded-lg shadow p-8 flex justify-center">
            <div id="container-demo-skyscraper" className="border border-gray-200 rounded">
              {!loadedBanners.has('demo-skyscraper') && (
                <div className="w-[160px] h-[600px] flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Integration Code */}
        <section className="bg-white rounded-lg shadow p-8">
          <h3 className="text-xl font-semibold mb-4">Integration Code</h3>
          <p className="text-gray-600 mb-4">
            Copy this code to start showing ads on your website:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`<!-- Add this to your HTML -->
<div id="my-ad-slot"></div>

<script src="/sdk.js"></script>
<script>
  AdServer.loadBanner('demo-leaderboard', 'my-ad-slot');
</script>`}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
