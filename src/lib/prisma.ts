import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

// 为 Serverless 环境优化的连接池配置
if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({
    connectionString,
    max: 1, // 限制连接数，适合 Serverless
    idleTimeoutMillis: 10000, // 10 秒后关闭空闲连接
    connectionTimeoutMillis: 5000, // 5 秒连接超时
  })
}

const adapter = new PrismaPg(globalForPrisma.pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
