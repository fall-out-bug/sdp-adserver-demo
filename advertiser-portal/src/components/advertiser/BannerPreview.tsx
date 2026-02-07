'use client';

import type { CampaignFormData } from '@/lib/stores/wizard';

interface BannerPreviewProps {
  banner: CampaignFormData['banners'][0];
}

export function BannerPreview({ banner }: BannerPreviewProps) {
  if (banner.type === 'image') {
    return (
      <div className="bg-white rounded shadow p-2">
        <img
          src={banner.content as string}
          alt="Banner preview"
          className="w-full h-auto"
          style={{ maxHeight: '200px', objectFit: 'contain' }}
        />
      </div>
    );
  }

  // For HTML5/AMPHTML banners
  return (
    <div className="bg-white rounded shadow p-2">
      <div
        className="w-full flex items-center justify-center bg-gray-100"
        style={{ height: `${banner.height}px`, maxHeight: '200px' }}
      >
        <div className="text-center">
          <div className="text-2xl mb-1">🎨</div>
          <div className="text-xs text-gray-600">{banner.width}×{banner.height}</div>
          <div className="text-xs text-gray-500 uppercase">{banner.type}</div>
        </div>
      </div>
    </div>
  );
}
