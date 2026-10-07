import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // De 3D-chunk (three.js) is groot maar wordt lazy geladen; het paneel staat er direct.
    chunkSizeWarningLimit: 1100,
  },
});
