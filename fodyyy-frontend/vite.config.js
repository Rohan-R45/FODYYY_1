import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enable JSX in .js files
      include: "**/*.{jsx,js}",
    })
  ],
  
  // Configure esbuild to handle JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  
  // Environment-specific configuration
  define: {
    __DEV__: mode === 'development',
  },
  
  // Build optimizations
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', 'react-hot-toast', 'react-toastify'],
          utils: ['axios', 'qrcode']
        }
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
  },
  
  // Development server
  server: {
    host: true,
    port: 5174,
    open: false,
    strictPort: false,
    hmr: {
      overlay: true
    }
  },
  
  // Preview server
  preview: {
    port: 5175,
    host: true,
    open: false
  },
  
  // CSS optimization
  css: {
    devSourcemap: mode === 'development',
    postcss: './postcss.config.js'
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src'
    }
  }
}))
