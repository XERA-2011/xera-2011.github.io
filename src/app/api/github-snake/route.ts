import { NextResponse } from 'next/server';

/**
 * GitHub Snake SVG 代理 API
 * 
 * 作用：代理获取 GitHub 贡献图蛇形动画 SVG
 * 原因：部分浏览器的跟踪防护功能会阻止直接访问第三方 CDN (jsdelivr.net)
 * 解决方案：通过服务端 API 代理请求，绕过浏览器的跟踪防护限制
 * 
 * 缓存策略：
 * - Next.js 缓存：1 小时 (revalidate: 3600)
 * - 浏览器缓存：1 小时 (Cache-Control)
 */
export async function GET() {
  try {
    const response = await fetch(
      'https://cdn.jsdelivr.net/gh/XERA-2011/XERA-2011/profile-snake-contrib/github-contribution-grid-snake-dark.svg',
      {
        next: { revalidate: 3600 } // 缓存 1 小时
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch SVG');
    }

    const svg = await response.text();

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error fetching GitHub snake SVG:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
