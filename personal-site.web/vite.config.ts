import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Third-party code that gets its own chunk, so app updates do not invalidate it.
const VENDOR_CHUNKS: Record<string, string[]> = {
  react: ['node_modules/react/', 'node_modules/react-dom/', 'node_modules/react-router'],
  mui: ['node_modules/@mui/', 'node_modules/@emotion/'],
  i18n: ['node_modules/i18next/', 'node_modules/react-i18next/'],
};

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Vite reports module ids with forward slashes on every platform.
        manualChunks(id) {
          if (!id.includes('node_modules/')) return undefined;

          for (const [chunk, patterns] of Object.entries(VENDOR_CHUNKS)) {
            if (patterns.some((pattern) => id.includes(pattern))) return chunk;
          }

          return undefined;
        },
      },
    },
  },
});
