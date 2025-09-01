import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_URL || 'http://ec2-54-91-102-216.compute-1.amazonaws.com/api/v1'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
