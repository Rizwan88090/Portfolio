import type { NextConfig } from 'next';

// Where the NestJS API runs. The browser only talks to /api on this site,
// so the admin session cookie stays first-party and no CORS is needed.
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // deploy/build.sh builds into a temporary folder, then swaps it in, so the live site never goes down.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@react-three/drei'],
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
