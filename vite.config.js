import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // Force frontend to use port 5173
    strictPort: true, // If 5173 is busy, Vite will throw an error instead of switching
  },
});
