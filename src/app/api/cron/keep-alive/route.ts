import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const timestamp = new Date().toISOString();
    
    // 1. Redis 保活
    // Write a key with an expiration time to avoid taking up space
    const redisPromise = redis.set('cron:keep-alive', timestamp, {
      ex: 86400 // 24 hours
    });

    // 2. Database 保活 (防止 Supabase 等数据库因长时间无请求而暂停)
    // Execute a simple query to keep the connection alive
    const dbPromise = prisma.$executeRaw`SELECT 1`;

    await Promise.all([redisPromise, dbPromise]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Keep alive ping sent to Redis and Database',
      timestamp 
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ping services' },
      { status: 500 }
    );
  }
}
