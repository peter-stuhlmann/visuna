import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts', // optional: für Setup von Testing Library
    // Falls du TS-Pfade verwendest, kannst du hier resolve configuration ergänzen
    // resolve: { alias: { '@': './src' } },
  },
});
