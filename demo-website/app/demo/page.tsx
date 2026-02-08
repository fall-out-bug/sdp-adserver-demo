'use client';

import { useEffect, useState } from 'react';
import { initSDK } from '@/lib/sdk';

export default function DemoPage() {
  const [loadedBanners, setLoadedBanners] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load banners only once when component mounts
    const loadBanners = async () => {
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Initialize SDK
      const sdk = initSDK({ debug: true });
      console.log('[DemoPage] SDK initialized, loading banners...');

      // Load banners sequentially
      const slotIds = ['demo-leaderboard', 'demo-medium-rect', 'demo-skyscraper'];

      for (const slotId of slotIds) {
        try {
          await sdk.loadBanner(slotId, `container-${slotId}`);
          console.log(`[DemoPage] Banner loaded for ${slotId}`);
          setLoadedBanners((prev) => new Set(prev).add(slotId));
        } catch (err) {
          console.error(`[DemoPage] Failed to load ${slotId}:`, err);
        }
      }
    };

    loadBanners();

    // No cleanup needed since we only load once
  }, []); // Empty deps array = only run once

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div className="header">
        <div className="container">
          <h1>🚀 AdServer Live Demo</h1>
        </div>
      </div>

      <div className="container">
        {/* Intro */}
        <div className="section">
          <h2>Live Ad Examples</h2>
          <p>
            See AdServer SDK in action. These banners are loaded dynamically from
            our backend.
          </p>
        </div>

        {/* Leaderboard */}
        <div className="section">
          <h3>Leaderboard (728×90)</h3>
          <div className="banner-container">
            <div
              id="container-demo-leaderboard"
              className="banner-slot"
              style={{ width: '728px', height: '90px', position: 'relative' }}
            >
              {!loadedBanners.has('demo-leaderboard') && (
                <div className="loading" style={{ width: '728px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medium Rectangle */}
        <div className="section">
          <h3>Medium Rectangle (300×250)</h3>
          <div className="banner-container">
            <div
              id="container-demo-medium-rect"
              className="banner-slot"
              style={{ width: '300px', height: '250px', position: 'relative' }}
            >
              {!loadedBanners.has('demo-medium-rect') && (
                <div className="loading" style={{ width: '300px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skyscraper */}
        <div className="section">
          <h3>Skyscraper (160×600)</h3>
          <div className="banner-container">
            <div
              id="container-demo-skyscraper"
              className="banner-slot"
              style={{ width: '160px', height: '600px', position: 'relative' }}
            >
              {!loadedBanners.has('demo-skyscraper') && (
                <div className="loading" style={{ width: '160px', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Code */}
        <div className="section">
          <h3>Integration Code</h3>
          <p style={{ marginBottom: '15px' }}>
            Copy this code to start showing ads on your website:
          </p>
          <pre>
            <code>{`<!-- Add this to your HTML -->
<div id="my-ad-slot"></div>

<script src="/sdk.js"></script>
<script>
  AdServer.loadBanner('demo-leaderboard', 'my-ad-slot');
</script>`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
