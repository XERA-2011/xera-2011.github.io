import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/**',
        search: '',
      },
    ],
  },
  // 优化字体加载
  experimental: {
    optimizePackageImports: ['next/font/google'],
  },
};

export default nextConfig;
