
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Clash-IP-Check/1.0',
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
