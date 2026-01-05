import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow serving S3-hosted cover art.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'game-tracker-sajeewa.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.eu-north-1.amazonaws.com',
      },
    ],
    // Bypass Next optimizer to avoid 400s while testing
    unoptimized: true,
  },
};

export default nextConfig;
