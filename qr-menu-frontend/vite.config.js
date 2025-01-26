import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Това позволява достъп от други устройства в мрежата
    port: 5173, // Портът, на който слуша сървърът
  },
})
