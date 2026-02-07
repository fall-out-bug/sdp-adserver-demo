# Playwright Configuration for Advertiser Portal

## Installation

Playwright is already installed as a dev dependency.

## Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run headed mode
npx playwright test --headed
```

## Test Files

E2E tests should be placed in `tests/e2e/` directory.

## Browser Support

- Chromium (default)
- Firefox
- WebKit

## Test Fixtures

Test fixtures for login/auth are located in `tests/fixtures/`.

## Configuration

Playwright configuration is in `playwright.config.ts`.
