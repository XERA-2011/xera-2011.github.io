import { NextResponse } from 'next/server';

/**
 * 通用 URL 转发代理 API
 * 
 * 作用：代理转发任意 URL 的请求
 * 原因：
 * 1. 绕过浏览器的 CORS 限制
 * 2. 绕过浏览器的跟踪防护功能（如第三方 CDN 阻止）
 * 3. 统一缓存管理
 * 
 * 使用方法：
 * - url: 必填，要转发的目标 URL（需要 encodeURIComponent 编码）
 * - cache: 可选，缓存时间（秒），默认 3600（1小时）
 * 
 * 示例：
 * /api/redirect?url=https%3A%2F%2Fexample.com%2Fimage.svg&cache=7200
 * 
 * 缓存策略：
 * - Next.js 缓存：由 cache 参数控制（默认 1 小时）
 * - 浏览器缓存：与 Next.js 缓存保持一致
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取目标 URL
    const targetUrl = searchParams.get('url');
    if (!targetUrl) {
      return new NextResponse('Missing required parameter: url', { 
        status: 400 
      });
    }

    // 验证 URL 格式
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(targetUrl);
      new URL(decodedUrl); // 验证是否为有效 URL
    } catch {
      return new NextResponse('Invalid URL format', { 
        status: 400 
      });
    }

    // 获取缓存时间（秒），默认 1 小时
    const cacheTime = parseInt(searchParams.get('cache') || '3600', 10);
    const validCacheTime = isNaN(cacheTime) || cacheTime < 0 ? 3600 : cacheTime;

    // 转发请求
    const response = await fetch(decodedUrl, {
      next: { revalidate: validCacheTime }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    // 获取响应内容
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const content = await response.arrayBuffer();

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${validCacheTime}, s-maxage=${validCacheTime}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error proxying request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Failed to proxy request: ${errorMessage}`, { 
      status: 500 
    });
  }
}
