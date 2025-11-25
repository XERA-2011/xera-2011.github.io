import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  if (!session.user.isAdmin) {
    redirect('/dashboard')
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

  type UserWithRelations = (typeof users)[number]

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              用户列表
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            查看站点所有用户的基础信息
          </p>
        </div>

        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-3 text-left">用户列表</h3>
          <div className="overflow-x-auto border rounded-md bg-card">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">邮箱</th>
                  <th className="px-3 py-2 text-left">名称</th>
                  <th className="px-3 py-2 text-left">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: UserWithRelations) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2 align-top text-xs break-all">{u.id}</td>
                    <td className="px-3 py-2 align-top">{u.email}</td>
                    <td className="px-3 py-2 align-top">{u.name}</td>
                    <td className="px-3 py-2 align-top text-xs">{u.createdAt instanceof Date ? u.createdAt.toLocaleString() : String(u.createdAt)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                      暂无用户数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
