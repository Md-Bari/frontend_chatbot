import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lifter-skipper-cheer.ngrok-free.dev';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'campbell-thriller-spending-foreign.trycloudflare.com',
    '*.trycloudflare.com',
    'localhost:3000',
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'campbell-thriller-spending-foreign.trycloudflare.com',
        '*.trycloudflare.com',
      ],
    },
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${BACKEND_URL}/api/health`,
      },
    ];
  },
};

export default nextConfig;
