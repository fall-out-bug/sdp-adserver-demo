# Publisher Portal

Publisher Portal for Demo AdServer - Monetize your website in 5 minutes.

## Overview

This is the Next.js 14 frontend for the Demo AdServer Publisher Portal. It provides publishers with a dashboard to manage websites, ad placements, and view revenue statistics.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e
```

### Linting

```bash
npm run lint
```

## Project Structure

```
publisher-portal/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── dashboard/         # Dashboard-specific components
├── lib/
│   ├── api/               # API clients
│   ├── hooks/             # Custom React hooks
│   └── stores/            # Zustand stores
│       └── auth.ts        # Auth state management
└── test/                  # Test setup
```

## Environment Variables

Create a `.env.local` file:

```bash
# API URL for backend (F053)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Feature flags
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_REALTIME_INTERVAL=5000
```

## Acceptance Criteria (WS 00-054-01)

- [x] Next.js 14 project created
- [x] Tailwind CSS configured
- [x] Zustand store setup
- [x] Base UI components (Button, Input, Card, Modal)
- [x] Root layout configured
- [x] Project builds successfully
- [x] All components exported
- [x] TypeScript types correct
- [x] Tailwind classes work
- [x] Tests with 100% coverage

## Quality Metrics

- **Test Coverage:** 100%
- **Tests:** 12/12 passing
- **Build Status:** ✅ Successful
- **Type Safety:** ✅ Full TypeScript
- **File Size:** All files <200 LOC

## Features

### Current (WS 00-054-01)

- Project setup with Next.js 14
- UI component library
- Authentication state management
- Test infrastructure

### Planned

- [ ] Authentication flow (WS 00-054-02)
- [ ] Dashboard & statistics (WS 00-054-03)
- [ ] Website management (WS 00-054-04)
- [ ] Placement management (WS 00-054-05)
- [ ] Settings & profile (WS 00-054-06)
- [ ] Testing & deployment (WS 00-054-07)

## Contributing

This project follows TDD (Test-Driven Development) and SDP (Spec-Driven Protocol) principles.

## License

MIT
