import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/tasks',
        destination: `${process.env.BACKEND_URL || 'http://ec2-54-90-93-250.compute-1.amazonaws.com/api/v1'}/tasks/`,
      },
      {
        source: '/api/v1/users',
        destination: `${process.env.BACKEND_URL || 'http://ec2-54-90-93-250.compute-1.amazonaws.com/api/v1'}/users/`,
      },
      {
        source: '/api/v1/conversations',
        destination: `${process.env.BACKEND_URL || 'http://ec2-54-90-93-250.compute-1.amazonaws.com/api/v1'}/conversations/`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_URL || 'http://ec2-54-90-93-250.compute-1.amazonaws.com/api/v1'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
