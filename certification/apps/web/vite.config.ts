import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '../..',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/') || id.includes('/react-router')) return 'react-vendor';
          if (id.includes('/@tanstack/')) return 'query-vendor';
          if (id.includes('/zod/') || id.includes('/react-hook-form/') || id.includes('/@hookform/')) return 'form-vendor';
          return undefined;
        },
      },
    },
  },
});
