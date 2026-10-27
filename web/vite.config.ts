import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

/** Fixed dev port so docs, proxy checks and Playwright agree. */
const DEV_PORT = 5173;
/** The existing TrendRadar backend (repo root `node server.js`). Dev only. */
const BACKEND_DEV_ORIGIN = 'http://localhost:3000';

/** VITE_SPECIMEN: '' or '0' = off, '1' = include the /_specimen design page in a build. */
function specimenFlag(value: string | undefined): boolean {
  const v = (value ?? '').trim();
  if (v === '' || v === '0') return false;
  if (v === '1') return true;
  throw new Error(`VITE_SPECIMEN must be empty, "0" or "1"; got "${v}".`);
}

export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  define: {
    // The dev server and Vitest always have the specimen; builds only with VITE_SPECIMEN=1.
    __SPECIMEN_ENABLED__: JSON.stringify(
      specimenFlag(loadEnv(mode, process.cwd(), 'VITE_').VITE_SPECIMEN) || command === 'serve',
    ),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: DEV_PORT,
    strictPort: true,
    proxy: {
      '/api': { target: BACKEND_DEV_ORIGIN, changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
}));
