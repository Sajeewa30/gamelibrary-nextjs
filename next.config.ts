import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow serving S3-hosted cover art. If optimizer issues persist,
    // set unoptimized to true to bypass Next Image optimization.
    domains: [
      'localhost',
      'game-tracker-sajeewa.s3.eu-north-1.amazonaws.com',
    ],
    unoptimized: true,
  },
};

export default nextConfig;
