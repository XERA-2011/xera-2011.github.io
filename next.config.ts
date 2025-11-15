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
  // 确保 Prisma 引擎文件被正确打包
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    return config;
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./src/generated/prisma/**/*'],
  },
};

export default nextConfig;
