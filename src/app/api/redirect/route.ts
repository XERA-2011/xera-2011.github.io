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

    // 验证 URL 格式及白名单
    let decodedUrl: string;
    let urlObj: URL;
    try {
      decodedUrl = decodeURIComponent(targetUrl);
      urlObj = new URL(decodedUrl);
      
      // 允许的协议
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return new NextResponse('Invalid protocol', { status: 400 });
      }

      // 域名白名单
      const ALLOWED_DOMAINS = [
        'api.dicebear.com',
        'cdn.jsdelivr.net',
        'raw.githubusercontent.com',
        'github.com',
        'avatars.githubusercontent.com',
        'lh3.googleusercontent.com',
        'img.shields.io',
        'pic.twitter.com',
        'pbs.twimg.com'
      ];

      // 检查域名是否在白名单中（支持子域名匹配，如 xxx.github.com 需谨慎，这里采用精确后缀匹配或完全匹配）
      // 为安全起见，这里使用严格匹配或特定子域匹配
      const hostname = urlObj.hostname.toLowerCase();
      const isAllowed = ALLOWED_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );

      if (!isAllowed) {
        return new NextResponse('Domain not allowed', { status: 403 });
      }

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
