import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import blogPortalApiPlugin from './plugins/blog-portal-api.js';

export default defineConfig({
  plugins: [blogPortalApiPlugin(), reactRouter()],
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
