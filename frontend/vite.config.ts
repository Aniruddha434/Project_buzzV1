import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Path resolution
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost',
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
  },
})
