# AdServer Web SDK

Lightweight JavaScript SDK (<5KB gzipped) for ad delivery.

## Features

- 📦 **Tiny**: <5KB gzipped
- ⚡ **Fast**: Async loading, non-blocking
- 🔒 **Secure**: HTML sanitization, CSP compliance
- 🎯 **Simple**: 5-minute integration
- 📊 **Observable**: Built-in events and telemetry

## Quick Start

```html
<!-- Add this snippet to your page -->
<script
  src="https://cdn.adserver.com/sdk.js"
  data-api-endpoint="https://api.adserver.com"
  data-debug="true">
</script>

<!-- Create ad container -->
<div id="ad-slot-123" class="adserver-slot" data-slot-id="slot-123"></div>
```

## Configuration

### Script Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-api-endpoint` | string | `/api/v1` | API base URL |
| `data-debug` | boolean | `false` | Enable debug mode |
| `data-test-mode` | boolean | `false` | Enable test mode |
| `data-lazy-load` | boolean | `true` | Enable lazy loading |
| `data-cache-enabled` | boolean | `true` | Enable caching |
| `data-cache-ttl` | number | `300000` | Cache TTL (ms) |
| `data-retry-enabled` | boolean | `true` | Enable retry logic |
| `data-retry-max-attempts` | number | `3` | Max retry attempts |
| `data-retry-delay` | number | `1000` | Retry delay (ms) |
| `data-iframe-mode` | boolean | `false` | Use iframe for ads |
| `data-fallback-enabled` | boolean | `true` | Enable fallback ads |

### Global Config

```javascript
window.AdServerSDKConfig = {
  apiEndpoint: 'https://api.adserver.com',
  debug: true,
  onReady: () => console.log('SDK ready'),
};
```

## API

### Initialization

```javascript
// Auto-initialize from script tag
// SDK initializes automatically on load

// Manual initialization
import { initSDK } from '@adserver/web-sdk';
const sdk = initSDK({
  apiEndpoint: 'https://api.adserver.com',
  debug: true,
});
```

### Events

```javascript
sdk.on('init', (config) => console.log('Initialized', config));
sdk.on('ready', (config) => console.log('Ready', config));
sdk.on('error', (error) => console.error('Error', error));
sdk.on('destroy', () => console.log('Destroyed'));
```

### Debug Utilities

```javascript
// Get SDK info
sdk.debug.info();

// Get logs
sdk.debug.logs();

// Get errors
sdk.debug.errors();

// Clear logs and errors
sdk.debug.clear();
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck

# Build
npm run build

# Check bundle size
npm run size
```

## License

MIT
