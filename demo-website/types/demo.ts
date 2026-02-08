// Demo banner types
export interface DemoBanner {
  id: string;
  name: string;
  format: BannerFormat;
  html?: string;
  image_url?: string;
  width: number;
  height: number;
  click_url?: string;
  active: boolean;
  created_at: string;
}

export interface DemoSlot {
  id: string;
  slot_id: string;
  name: string;
  format: BannerFormat;
  width: number;
  height: number;
  demo_banner_id?: string;
  demo_banner?: DemoBanner;
  created_at: string;
}

export type BannerFormat =
  | 'leaderboard'
  | 'medium-rectangle'
  | 'skyscraper'
  | 'half-page'
  | 'native-in-feed'
  | 'sponsored-content';

export interface BannerExample {
  format: BannerFormat;
  name: string;
  width: number;
  height: number;
  description: string;
}

export const BANNER_FORMATS: BannerExample[] = [
  {
    format: 'leaderboard',
    name: 'Leaderboard',
    width: 728,
    height: 90,
    description: 'Full-width banner at top of page',
  },
  {
    format: 'medium-rectangle',
    name: 'Medium Rectangle',
    width: 300,
    height: 250,
    description: 'Standard embedded banner',
  },
  {
    format: 'skyscraper',
    name: 'Skyscraper',
    width: 160,
    height: 600,
    description: 'Vertical sidebar banner',
  },
  {
    format: 'half-page',
    name: 'Half Page',
    width: 300,
    height: 600,
    description: 'Large vertical banner',
  },
  {
    format: 'native-in-feed',
    name: 'Native In-Feed',
    width: 300,
    height: 250,
    description: 'Blends with content',
  },
  {
    format: 'sponsored-content',
    name: 'Sponsored Content',
    width: 300,
    height: 250,
    description: 'Text-based native ad',
  },
];
