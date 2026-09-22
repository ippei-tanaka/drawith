import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.51', '192.168.1.220', 'drawith-app'],
  logging: {
    incomingRequests: false,
  },
};

export default nextConfig;
