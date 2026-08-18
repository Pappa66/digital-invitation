import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        // Tetap cetak laporan coverage meski ada test gagal (mis. bukti bug
        // progresif pada rsvp.test.tsx), agar gate coverage tidak buta saat suite merah.
        reportOnFailure: true
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src')
      }
    },
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key')
    }
  };
});
