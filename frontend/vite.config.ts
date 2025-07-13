import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Path resolution with enhanced aliases
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@context": path.resolve(__dirname, "./src/context"),
        "@types": path.resolve(__dirname, "./src/types"),
        "@assets": path.resolve(__dirname, "./src/assets"),
      },
    },
    // Development server configuration
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 5173,
      host: env.VITE_DEV_HOST || 'localhost',
      open: true,
      proxy: {
        // Proxy API requests to backend with enhanced CORS support
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔴 Proxy error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`🔄 Proxying: ${req.method} ${req.url}`);
              // Add CORS headers to proxied requests
              proxyReq.setHeader('Origin', 'http://localhost:5173');
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
          'http://localhost:5173',
          'http://localhost:5002',
          'http://localhost:5001',
          'http://localhost:5000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5002',
          'http://127.0.0.1:5001',
          'http://127.0.0.1:5000'
        ],
        credentials: true,
      },
    },

    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },
    // Build configuration for production optimization
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,

      // Chunk size warnings
      chunkSizeWarningLimit: 1000,

      // Rollup options for advanced optimization
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],

            // Utility chunks
            'utils': ['axios', 'clsx', 'tailwind-merge'],
          },

          // Asset naming for better caching
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `images/[name]-[hash][extname]`
            }
            if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
              return `fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          entryFileNames: 'js/[name]-[hash].js',
        },
      },

      // Terser options for production
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
    },

    // Enhanced environment variables
    define: {
      __BACKEND_URL__: JSON.stringify(env.VITE_BACKEND_URL || 'http://localhost:5000'),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __NODE_ENV__: JSON.stringify(mode),
    },

    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
      postcss: './postcss.config.js',
    },

    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'framer-motion',
        'lucide-react',
        'use-sync-external-store/shim',
        'use-sync-external-store/shim/with-selector',
        '@react-three/fiber',
        '@react-three/drei',
        'three',
        'react-reconciler'
      ],
      force: true
    },

    // ESBuild configuration
    esbuild: {
      target: 'es2015',
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  }
})
