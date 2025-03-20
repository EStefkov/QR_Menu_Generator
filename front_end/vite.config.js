import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      // V4 specific options
      darkMode: 'class',
    }),
  ],
  server: {
    port: 5173
  }
})
