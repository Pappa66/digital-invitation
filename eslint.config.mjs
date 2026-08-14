import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Pola "muat data lalu setState" dalam effect adalah pola umum di app ini
      // (fetch/init lalu set state); pertahankan sebagai peringatan, bukan error.
      'react-hooks/set-state-in-effect': 'warn'
    }
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'vitest.setup.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'tsconfig.tsbuildinfo'])
]);