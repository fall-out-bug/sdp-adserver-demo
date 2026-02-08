'use client';

import { useEffect, useState, useRef } from 'react';
import { initSDK } from '@/lib/sdk';

export default function DemoPage() {
  const [loadedBanners, setLoadedBanners] = useState<Set<string>>(new Set());
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const mediumRectRef = useRef<HTMLDivElement>(null);
  const skyscraperRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);

    // Load banners only once when component mounts and DOM is ready
    const loadBanners = async () => {
      // Wait for React to complete rendering using requestAnimationFrame
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 50); // Small additional delay
        });
      });

      // Collect all refs at the start to avoid re-render issues
      const slotRefs = [
        { id: 'demo-leaderboard', ref: leaderboardRef, name: 'Leaderboard' },
        { id: 'demo-medium-rect', ref: mediumRectRef, name: 'Medium Rectangle' },
        { id: 'demo-skyscraper', ref: skyscraperRef, name: 'Skyscraper' },
      ];

      // Wait for all refs to be ready
      for (const slot of slotRefs) {
        let attempts = 0;
        while (!slot.ref.current && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 50));
          attempts++;
        }
      }

      // Initialize SDK
      const sdk = initSDK({ debug: true });
      console.log('[DemoPage] SDK initialized, loading banners...');

      // Collect loaded slot IDs
      const loadedSlots: string[] = [];

      // Load banners sequentially
      for (const slot of slotRefs) {
        if (!slot.ref.current) {
          console.error(`[DemoPage] Container ref for ${slot.name} not ready after retries`);
          continue;
        }

        try {
          await sdk.loadBanner(slot.id, slot.ref.current);
          console.log(`[DemoPage] Banner loaded for ${slot.name}`);
          loadedSlots.push(slot.id);
        } catch (err) {
          console.error(`[DemoPage] Failed to load ${slot.name}:`, err);
        }
      }

      // Update state once with all loaded slots
      if (loadedSlots.length > 0) {
        setLoadedBanners(new Set(loadedSlots));
      }
    };

    loadBanners();
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
              ref={leaderboardRef}
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
              ref={mediumRectRef}
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
              ref={skyscraperRef}
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
