import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  output: "standalone",
  poweredByHeader: false,
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      ...(process.env.NODE_ENV === 'development' ? [{ protocol: 'http' as const, hostname: '127.0.0.1' }] : []),
      { protocol: "https", hostname: "media.alwosabe.com" },
      ...(process.env.MEDIA_HOST ? [{ protocol: "https" as const, hostname: process.env.MEDIA_HOST }] : []),
    ],
  },
};

export default nextConfig;
