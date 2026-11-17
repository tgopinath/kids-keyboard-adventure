import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5360 },
  preview: { port: 5360 },
  build: { chunkSizeWarningLimit: 800 },
});
