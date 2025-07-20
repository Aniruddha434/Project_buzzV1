import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
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
      // Force disable cache for development
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
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
          // Enhanced manual chunk splitting for better caching and performance
          manualChunks: (id) => {
            // Vendor chunks - split by library type
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }

              // Router
              if (id.includes('react-router')) {
                return 'router-vendor';
              }

              // UI and animation libraries
              if (id.includes('framer-motion') || id.includes('lucide-react') ||
                  id.includes('@radix-ui') || id.includes('@headlessui')) {
                return 'ui-vendor';
              }

              // Three.js ecosystem
              if (id.includes('three') || id.includes('@react-three')) {
                return 'three-vendor';
              }

              // HTTP and utilities
              if (id.includes('axios') || id.includes('clsx') ||
                  id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
                return 'utils-vendor';
              }

              // Toast and notifications
              if (id.includes('react-hot-toast')) {
                return 'toast-vendor';
              }

              // All other node_modules
              return 'vendor';
            }

            // App chunks - split by feature
            if (id.includes('/pages/')) {
              return 'pages';
            }

            if (id.includes('/components/')) {
              return 'components';
            }

            if (id.includes('/utils/') || id.includes('/hooks/') || id.includes('/context/')) {
              return 'app-utils';
            }
          },

          // Asset naming for better caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `js/[name]-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext || '')) {
              return `images/[name]-[hash][extname]`
            }
            if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
              return `fonts/[name]-[hash][extname]`
            }
            if (/css/i.test(ext || '')) {
              return `css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          entryFileNames: 'js/[name]-[hash].js',
        },

        // External dependencies (if needed)
        external: [],

        // Tree shaking configuration
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false
        }
      },
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
        'react-reconciler',
        '@radix-ui/react-dialog',
        '@radix-ui/react-icons',
        '@radix-ui/react-label',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-slot',
        '@headlessui/react',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'react-hot-toast',
        'web-vitals'
      ],
      force: true,
      // Exclude problematic dependencies
      exclude: ['@types/three']
    },

    // ESBuild configuration
    esbuild: {
      target: 'es2015',
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  }
})
