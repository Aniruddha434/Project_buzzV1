import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to backend with enhanced CORS support
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Proxy error:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`🔄 Proxying: ${req.method} ${req.url}`);
            // Add CORS headers to proxied requests
            proxyReq.setHeader('Origin', 'http://localhost:5174');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`✅ Proxy response: ${proxyRes.statusCode} for ${req.url}`);
          });
        },
      },
    },
    // CORS configuration for development server
    cors: {
      origin: [
        'http://localhost:5002',
        'http://localhost:5001',
        'http://localhost:5000',
        'http://127.0.0.1:5002',
        'http://127.0.0.1:5001',
        'http://127.0.0.1:5000'
      ],
      credentials: true,
    },
  },
  // Define environment variables
  define: {
    __BACKEND_URL__: JSON.stringify(process.env.VITE_BACKEND_URL || 'http://localhost:5000'),
  },
})
