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
  async redirects() {
    return [
      // Handle mixed trailing slash patterns based on actual API documentation
      // Only redirect collection endpoints that actually have trailing slashes in the backend
      {
        source: '/api/v1/tasks',
        destination: '/api/v1/tasks/',
        permanent: false,
      },
      {
        source: '/api/v1/users',
        destination: '/api/v1/users/',
        permanent: false,
      },
      {
        source: '/api/v1/conversations',
        destination: '/api/v1/conversations/',
        permanent: false,
      },
      // Note: performance/evaluations, analytics/patterns, analytics/trends 
      // do NOT have trailing slashes in the backend, so no redirects needed
    ];
  },
};

export default nextConfig;
