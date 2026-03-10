import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: true, // expose on local network so phones can connect
  },
  optimizeDeps: {
    include: ['@google/genai', 'p-retry', 'retry'],
  },
})
