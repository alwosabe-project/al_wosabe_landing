import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "media.alwosabe.com" },
      ...(process.env.MEDIA_HOST ? [{ protocol: "https" as const, hostname: process.env.MEDIA_HOST }] : []),
    ],
  },
};

export default nextConfig;
