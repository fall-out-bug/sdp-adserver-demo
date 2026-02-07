import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BannerPreview } from './BannerPreview';

describe('BannerPreview', () => {
  it('renders image banner preview', () => {
    const banner = {
      id: '1',
      type: 'image' as const,
      content: 'data:image/png;base64,iVBORw0KG...',
      width: 300,
      height: 250,
    };

    const { container } = render(<BannerPreview banner={banner} />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.src).toBe(banner.content);
  });

  it('renders HTML5 banner placeholder', () => {
    const banner = {
      id: '1',
      type: 'html5' as const,
      content: '<html>...</html>',
      width: 300,
      height: 250,
    };

    render(<BannerPreview banner={banner} />);
    expect(screen.getByText('🎨')).toBeInTheDocument();
    expect(screen.getByText('300×250')).toBeInTheDocument();
    expect(screen.getByText(/html5/i)).toBeInTheDocument();
  });

  it('renders AMPHTML banner placeholder', () => {
    const banner = {
      id: '1',
      type: 'amphtml' as const,
      content: '<html>...</html>',
      width: 300,
      height: 250,
    };

    render(<BannerPreview banner={banner} />);
    expect(screen.getByText(/amphtml/i)).toBeInTheDocument();
  });
});
