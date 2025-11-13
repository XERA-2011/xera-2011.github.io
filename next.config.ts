import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除 output: 'export' 以支持 API 路由和服务器端功能
  images: { 
    unoptimized: true,     // 关闭 Next.js 默认图片优化
    localPatterns: [
      {
        pathname: '/api/joke',
        search: '',
      },
    ],
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
