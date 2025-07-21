import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external connections
    port: 5174, // Default port changed from 5173 to 5174
    open: false, // Don't auto-open browser
    strictPort: false, // Allow fallback to next available port if 5174 is busy
  },
  preview: {
    port: 5175, // Alternative port for preview builds
    host: true,
    open: false
  }
})
