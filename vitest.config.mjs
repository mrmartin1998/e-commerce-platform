import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['__tests__/setup/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.*',
        'src/app/layout.js',
        'src/app/globals.css',
        '.next/',
        'public/',
        'scripts/',
        // Exclude UI pages and components (not tested yet in this iteration)
        'src/app/**/page.js',
        'src/app/components/**/*.js',
        'src/components/**/*.js',
      ],
      // Coverage thresholds based on current API route testing
      // Note: Tested routes (auth, products, payment) have 60-100% coverage
      // Overall lower due to untested admin routes, middleware, models
      thresholds: {
        lines: 12,
        functions: 15,
        branches: 50,
        statements: 12,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
