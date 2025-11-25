import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TrendingUp } from 'lucide-react'

export default async function AdminAssetAllocationPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  if (!session.user.isAdmin) {
    redirect('/dashboard')
  }

  const assetItems = await prisma.assetAllocation.findMany({
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

  type AssetItem = (typeof assetItems)[number]

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              资产配置记录
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            查看所有用户在数据库中保存的资产配置
          </p>
        </div>

        <div className="overflow-x-auto border rounded-md bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">用户邮箱</th>
                <th className="px-3 py-2 text-left">名称</th>
                <th className="px-3 py-2 text-left">金额</th>
                <th className="px-3 py-2 text-left">更新时间</th>
              </tr>
            </thead>
            <tbody>
              {assetItems.map((item: AssetItem) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 align-top">{item.user?.email}</td>
                  <td className="px-3 py-2 align-top">{item.name}</td>
                  <td className="px-3 py-2 align-top">{item.amount}</td>
                  <td className="px-3 py-2 align-top text-xs">
                    {item.updatedAt instanceof Date
                      ? item.updatedAt.toLocaleString()
                      : String(item.updatedAt)}
                  </td>
                </tr>
              ))}
              {assetItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-muted-foreground"
                  >
                    暂无资产配置记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}