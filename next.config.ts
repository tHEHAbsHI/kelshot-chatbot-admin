import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_URL || 'http://ec2-54-91-102-216.compute-1.amazonaws.com/api/v1'}/:path*`,
      },
    ];
  },
  // Removed redirects to prevent redirect loops
  // The backend handles both trailing slash and non-trailing slash requests
};

export default nextConfig;
