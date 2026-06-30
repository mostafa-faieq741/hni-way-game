import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',

  // ── Dev server ─────────────────────────────────────────────────────────────
  server: {
    // Proxy /api/* to the local backend (npm run dev:api on port 3001).
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    // Inline ALL assets (images, fonts, etc.) as base64 — no external requests
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Single JS chunk
        inlineDynamicImports: true,
      },
    },
  },
})
