import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project (a stray lockfile lives in $HOME).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
