import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Active le mode standalone pour Docker
  output: 'standalone',
};

export default nextConfig;
