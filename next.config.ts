import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.json',
    // Ignore TypeScript errors during Vercel builds for now
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during Vercel builds for now
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Performance optimizations
  experimental: {
    // Optimize package imports for common libraries
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'date-fns',
      'lodash',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Compression
  compress: true,

  // Production source maps (disabled for smaller bundles)
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);
