import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const apiPort = process.env.PORT ?? '4000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // In development the API runs separately; proxy keeps everything same-origin.
    proxy: { '/api': `http://localhost:${apiPort}` },
  },
  preview: {
    proxy: { '/api': `http://localhost:${apiPort}` },
  },
});
