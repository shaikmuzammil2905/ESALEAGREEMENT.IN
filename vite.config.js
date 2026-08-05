import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        features: resolve(__dirname, 'features.html'),
        whyChooseUs: resolve(__dirname, 'why-choose-us.html'),
        howItWorks: resolve(__dirname, 'how-it-works.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        faq: resolve(__dirname, 'faq.html'),
        legalAssistance: resolve(__dirname, 'legal-assistance.html'),
        loans: resolve(__dirname, 'loans.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
})
