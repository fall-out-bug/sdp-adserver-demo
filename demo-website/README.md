# AdServer Demo Website

Демонстрационный сайт для AdServer SDK - показывает возможности платформы для издателей.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Structure

```
demo-website/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Homepage
│   ├── demo/              # Live demo page
│   └── formats/           # Ad formats showcase
├── components/            # React components
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── sdk.ts            # Web SDK client
└── types/                # TypeScript types
```

## 🎯 Features

- **Homepage**: Landing page with features overview
- **Formats Page**: Showcase of all supported ad formats
- **Live Demo**: Working examples with real ad delivery
- **Responsive Design**: Mobile-first with Tailwind CSS

## 📦 Ad Formats

- Leaderboard (728×90)
- Medium Rectangle (300×250)
- Skyscraper (160×600)
- Half Page (300×600)
- Native In-Feed (300×250)
- Sponsored Content (variable)

## 🔗 API Integration

Demo website connects to backend API:

- `GET /api/v1/demo/slots` - List available slots
- `GET /api/v1/demo/slots/:id/banner` - Get banner for slot

## 🔑 Admin Panel

Admin endpoints require JWT authentication:

- `POST /api/v1/demo/banners` - Create banner
- `PUT /api/v1/demo/banners/:id` - Update banner
- `DELETE /api/v1/demo/banners/:id` - Delete banner
- `POST /api/v1/demo/slots` - Create slot
- `PUT /api/v1/demo/slots/:id` - Update slot
- `DELETE /api/v1/demo/slots/:id` - Delete slot

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📝 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🎨 Customization

Edit `tailwind.config.ts` to customize colors and styling.
