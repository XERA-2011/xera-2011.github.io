import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  // GitHub Pages 静态导出模式
  // 设置 NEXT_PUBLIC_STATIC_EXPORT=true 启用
  ...(isStaticExport && { output: 'export' }),
  
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
