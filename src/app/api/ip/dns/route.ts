
import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import util from 'util';

const lookup = util.promisify(dns.lookup);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Missing "domain" parameter' }, { status: 400 });
    }

    try {
        const { address } = await lookup(domain);
        return NextResponse.json({ ip: address });
    } catch (error: any) {
        console.error('DNS lookup error:', error);
        return NextResponse.json(
            { error: 'DNS resolution failed', details: error.message },
            { status: 500 }
        );
    }
}
