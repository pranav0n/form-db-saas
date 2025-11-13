import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@saas/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: [
      'saasfrontend-production-4faf.up.railway.app',
      '.up.railway.app',
      'localhost',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})

