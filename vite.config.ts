import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts') || id.includes('node_modules/victory-vendor')) {
            return 'recharts';
          }
          if (id.includes('node_modules/qrcode')) {
            return 'qrcode';
          }
          if (id.includes('node_modules/@mui')) {
            return 'mui';
          }
        },
      },
    },
  },
});
