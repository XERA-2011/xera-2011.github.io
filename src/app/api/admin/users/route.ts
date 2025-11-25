import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  const result = await requireAdmin()

  if (result.type === 'unauthorized') {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  if (result.type === 'forbidden') {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lifeCountdownSettings: true,
      assetAllocations: true,
      accounts: true,
      sessions: true,
    },
  })

  return NextResponse.json({ users })
}
