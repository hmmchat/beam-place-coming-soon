import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stale `.next` chunks (e.g. "Cannot find module './611.js'") happen when the
  // webpack runtime manifest points at chunk files that were deleted or replaced.
  // In dev: no persistent webpack cache + (see package.json) a fresh `.next` on each `npm run dev`.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
