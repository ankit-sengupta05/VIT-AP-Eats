import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // API routes — network first, fall back to cache
      {
        urlPattern: /^https?.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 64, maxAgeSeconds: 60 * 5 }, // 5 min
          networkTimeoutSeconds: 10,
        },
      },
      // Images — cache first for performance
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
          expiration: { maxEntries: 256, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
        },
      },
      // Google Fonts — stale while revalidate
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "google-fonts-cache" },
      },
      // OpenStreetMap tiles — cache first
      {
        urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "osm-tile-cache",
          expiration: { maxEntries: 512, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
        },
      },
      // JS/CSS static assets — stale while revalidate
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "static-assets" },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // next-pwa injects a webpack config. Turbopack in Next.js 16 requires an explicit
  // `turbopack` key alongside any `webpack` config to avoid a fatal build error.
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default withPWA(nextConfig);
