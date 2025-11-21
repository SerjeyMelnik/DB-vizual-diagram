import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },

  // Build optimizations
  build: {
    // Output directory
    outDir: 'dist',

    // Enable/disable CSS code splitting
    cssCodeSplit: true,

    // Browser compatibility target
    target: 'esnext',

    // Enable minification
    minify: 'esbuild',

    // Generate sourcemap for production debugging (set to false for smaller bundles)
    sourcemap: false,

    // Chunk size warning limit (in kB)
    chunkSizeWarningLimit: 1000,

    // Rollup-specific options
    rollupOptions: {
      output: {
        // Manual chunk splitting strategy
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // Separate large libraries into their own chunks
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@xyflow/react')) {
              return 'vendor-xyflow';
            }
            if (id.includes('antd')) {
              return 'vendor-antd';
            }
            if (id.includes('@ant-design/icons')) {
              return 'vendor-icons';
            }
            // Other vendor dependencies
            return 'vendor';
          }
        },

        // Naming pattern for chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Increase warning limit
    reportCompressedSize: false, // Disable for faster builds
  },

  // Server configuration
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: true,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', '@xyflow/react', 'antd', '@ant-design/icons'],
    exclude: [],
  },
});
