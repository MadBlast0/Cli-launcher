import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // The renderer runs in a browser-like context (nodeIntegration is off), so
  // Node globals like `process` are unavailable at runtime. Vite replaces these
  // references at build/dev time with the host platform where the app (or the
  // dev session) is running. Each platform build is produced per-OS via
  // electron-builder, so the value is always correct for that build.
  define: {
    'process.platform': JSON.stringify(process.platform),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  plugins: [react(), tailwindcss()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
