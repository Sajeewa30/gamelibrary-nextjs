import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'images.igdb.com'],
  },
};

export default nextConfig;
