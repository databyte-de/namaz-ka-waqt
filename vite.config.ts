import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This must match your GitHub repository name exactly
  // If your repo is https://github.com/username/my-app, this should be '/my-app/'
  base: '/namaz-ka-waqt/',
})