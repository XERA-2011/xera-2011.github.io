import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: { 
    unoptimized: true,     // 关闭 Next.js 默认图片优化
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/**',
      },
    ],
  },
  // 优化字体加载
  experimental: {
    optimizePackageImports: ['next/font/google'],
  },
};

export default nextConfig;
