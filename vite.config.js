import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Add this for GitHub Pages/Vercel
  build: {
    outDir: 'dist'
  }
})
