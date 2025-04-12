// vite.config.ts
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'client/dist',
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react', 
            'react-dom'
          ],
          'ui-lib': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          'animations': ['framer-motion'],
          'utils': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase the warning limit
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
})
