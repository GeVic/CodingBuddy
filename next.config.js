/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
  },

  // Disable ESLint during builds (TypeScript 5 compatibility issue)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Simple performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Redirects
  async redirects() {
    return [];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://codingbuddy.dev",
  },

  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
