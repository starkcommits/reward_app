import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import proxyOptions from './proxyOptions'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: [
      '@radix-ui/react-dropdown-menu',
      // You may need to add other Radix UI components as well
    ],
  },
  plugins: [
    react(),
    tailwindcss,
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: [
    //     'icon-32.svg',
    //     'icon-180.png',
    //     'icon-152.png',
    //     'icon-120.png',
    //   ],
    //   manifest: {
    //     name: 'GrowBro',
    //     short_name: 'GrowBro',
    //     description: 'Your Ultimate Trading Companion',
    //     theme_color: '#4F46E5',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/growbro/',
    //     start_url: '/growbro/',
    //     icons: [
    //       {
    //         src: '/icon-32.svg',
    //         sizes: '32x32',
    //         type: 'image/svg+xml',
    //         purpose: 'any',
    //       },
    //       {
    //         src: '/icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //       {
    //         src: '/icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //     ],
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'unsplash-images',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    //           },
    //         },
    //       },
    //     ],
    //   },
    // }),
  ],
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: proxyOptions,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../rewardapp/public/growbro',
    emptyOutDir: true,
    target: 'es2015',
  },
})
