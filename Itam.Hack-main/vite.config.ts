import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Доступен из локальной сети
    port: 5173,
    proxy: {
      '/api': {
        // В Docker используем имя сервиса, локально - IP или localhost
        target: process.env.VITE_API_URL || 'http://192.168.0.103:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
