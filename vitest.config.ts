import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    environmentOptions: {
      // Custom environment options here
    },
    environmentMatchGlobs: [
      // Use miniflare for service worker tests
      ['src/**/*.sw.test.ts', 'miniflare'],
    ],
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 