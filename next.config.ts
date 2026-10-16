import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Cover art and gallery media are served by the backend (/uploads), so
    // skip the Next optimizer and load them directly.
    unoptimized: true,
  },
};

export default nextConfig;
