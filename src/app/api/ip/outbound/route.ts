import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch outbound IP');
    }

    const data = await res.json();

    return NextResponse.json({
      outboundIp: data.ip,
      source: 'api.ipify.org',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
