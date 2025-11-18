import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Fix: __dirname is not available in ES modules. This defines it using import.meta.url.
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blingCallback: resolve(__dirname, 'bling-callback.html'),
      },
    },
  },
})