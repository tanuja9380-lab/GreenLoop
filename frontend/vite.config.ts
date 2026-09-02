import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
  react(),
  VitePWA({
    manifest: {
      name: "GreenLoop",
      short_name: "GreenLoop",
      description: "Smart Waste Management & Green Rewards",
      theme_color: "#42b883",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      scope: "/",
      icons: [
  {
    src: "/hero.png",
    sizes: "512x512",
    type: "image/png",
  },
],
    },
  }),
],
})
