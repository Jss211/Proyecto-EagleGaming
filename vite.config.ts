import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
<<<<<<<<< Temporary merge branch 1
  plugins: [
      react(),
      tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': import.meta.dirname + '/src',
    },
  },
})
=========
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
})
>>>>>>>>> Temporary merge branch 2
