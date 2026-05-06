import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',

  // ── Dev server ─────────────────────────────────────────────────────────────
  server: {
    // Proxy /api/* to a local Express or Vercel dev server when developing
    // backend routes locally. Run `vercel dev` or `node api/server.js` on
    // port 3001, then uncomment the proxy below.
    //
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true,
    //   },
    // },
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
