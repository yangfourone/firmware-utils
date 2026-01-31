import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This ensures assets use relative paths (e.g. "./assets/...")
  // instead of absolute paths (e.g. "/assets/...").
  // This allows the app to run in subdirectories.
  base: './', 
});