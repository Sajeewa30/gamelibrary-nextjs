import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'localhost',
      'game-tracker-sajeewa.s3.eu-north-1.amazonaws.com',
    ],
  },
};

export default nextConfig;
