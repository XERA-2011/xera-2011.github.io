
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
    }

    // 验证 URL 和安全性（黑名单模式）
    let targetUrl: URL;
    try {
        targetUrl = new URL(url);
        
        // 允许的协议
        if (!['http:', 'https:'].includes(targetUrl.protocol)) {
            return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
        }

        const hostname = targetUrl.hostname.toLowerCase();

        // 基础黑名单：禁止 localhost 和常见本地别名
        const BLACKLIST = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
        if (BLACKLIST.includes(hostname) || hostname.startsWith('127.') || hostname.startsWith('169.254.')) {
             return NextResponse.json({ error: 'Access to local resources is denied' }, { status: 403 });
        }

        // 私有 IP 地址段检查 (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
        // 简单的正则匹配 IPv4
        const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = hostname.match(ipPattern);
        
        if (match) {
            const octets = match.slice(1).map(Number);
            const [first, second] = octets;

            let isPrivate = false;
            if (first === 10) isPrivate = true;
            else if (first === 172 && second >= 16 && second <= 31) isPrivate = true;
            else if (first === 192 && second === 168) isPrivate = true;
            
            if (isPrivate) {
                return NextResponse.json({ error: 'Access to private network is denied' }, { status: 403 });
            }
        }

        // 注意：这种检查无法防止 DNS Rebinding 攻击（即恶意域名解析到内网 IP）。
        // 但对于通用的订阅检查工具有足够的“防手滑”保护。

    } catch (e) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                // 伪装成 Clash 客户端，防止被某些订阅服务器拦截
                'User-Agent': 'Clash/1.0', 
                'Accept': '*/*',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch URL: ${response.statusText}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type');
        const text = await response.text();

        return new NextResponse(text, {
            status: 200,
            headers: {
                'Content-Type': contentType || 'text/plain',
                'Access-Control-Allow-Origin': '*', // Optional: if you want to allow other sites to use this proxy
            },
        });
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
