import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/sdk/index.lite.ts'),
      name: 'AdServerSDK',
      fileName: 'adserver',
      formats: ['umd', 'iife']
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info', 'console.warn'],
        passes: 3,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        dead_code: true,
        conditionals: true,
        evaluate: true,
      },
      format: {
        comments: false,
        ascii_only: true,
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/,
          reserved: []
        }
      }
    },
    target: 'es2015',
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
