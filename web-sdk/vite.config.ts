import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/sdk/index.ts'),
      name: 'AdServerSDK',
      fileName: 'sdk',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        globals: {
          // No external dependencies for browser SDK
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/', 'node_modules/']
    }
  }
});
