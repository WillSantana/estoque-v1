// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^\/((?!api).)*$/], // ✅ permite rotas SPA, ignora /api
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/127\.0\.0\.1:8000\/api\/.*/,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'no-cache-api',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'StockFeed - Controle de Estoque',
        short_name: 'StockFeed',
        description: 'Sistema de Controle de Estoque para Casas de Ração e Pet Shops',
        theme_color: '#ffffff',
        background_color: '#f0fdf4',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            purpose: 'any maskable',
            type: 'image/png',
          },
        ],
      },
      cacheId: 'stockfeed-v1.0.3',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
