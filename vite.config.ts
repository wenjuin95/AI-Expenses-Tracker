import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",

      // Keep your existing manifest.json.
      manifest: false,

      // Register manually in main.tsx.
      injectRegister: false,

      // Service worker scope follows Vite's base path.
      scope: "/AI-Expenses-Tracker/"
    })
  ],



  base: '/AI-Expenses-Tracker/'
})
