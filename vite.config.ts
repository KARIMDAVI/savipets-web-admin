import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173, // Default Vite port
    strictPort: false, // Try next available port if 5173 is taken
    open: false, // Don't auto-open browser
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            // React and related libraries must be together (Ant Design depends on React)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('antd') || id.includes('@ant-design')) {
              return 'react-vendor';
            }
            // Bundle @tanstack/react-query with react-vendor (commonly used with React)
            if (id.includes('@tanstack/react-query')) {
              return 'react-vendor';
            }
            // Bundle dayjs with react-vendor (small, commonly used)
            if (id.includes('dayjs')) {
              return 'react-vendor';
            }
            // Bundle all smaller utilities with react-vendor to avoid circular dependency issues
            // This ensures dependencies that might have circular refs are bundled together
            if (id.includes('zustand') || id.includes('validator') || id.includes('dompurify')) {
              return 'react-vendor';
            }
            // Bundle turf (if not @turf) with react-vendor
            if (id.includes('turf') && !id.includes('@turf')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('mapbox') || id.includes('@turf')) {
              return 'mapbox-vendor';
            }
            // Bundle recharts with react-vendor to avoid circular dependency issues
            if (id.includes('recharts')) {
              return 'react-vendor';
            }
            if (id.includes('xlsx') || id.includes('jspdf')) {
              return 'export-vendor';
            }
            // Split CRM feature into separate chunk
            if (id.includes('features/crm')) {
              return 'crm-feature';
            }
            // Bundle all remaining small dependencies with react-vendor to avoid circular deps
            return 'react-vendor';
          }
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging
    sourcemap: false,
    // Minify
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions',
      'firebase/storage',
      'mapbox-gl',
      '@turf/turf',
      'recharts',
      'dayjs',
    ],
  },
})
