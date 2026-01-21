import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [path.resolve(__dirname, './apps/_shared-ui/src/test/setup.ts')],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    pool: 'threads',
    isolate: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/examples/**',
        'src/**/*.d.ts',
        'src/test/**',
      ],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
      skipFull: true,
      perFile: true,
    },
    slowTestThreshold: 200,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/_shared-ui/src'),
      '@workspace/design-system': path.resolve(__dirname, './packages/design-system/src'),
      '@workspace/shared-ui': path.resolve(__dirname, './apps/_shared-ui/src'),
    },
  },
});
