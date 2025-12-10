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

  const items = await prisma.lifeCalendarSettings.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  return NextResponse.json({ items })
}
