import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Clock } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'

async function deleteLifeCalendar(formData: FormData) {
  'use server'

  const result = await requireAdmin()

  if (result.type !== 'ok') {
    return
  }

  const id = formData.get('id') as string | null

  if (!id) {
    return
  }

  await prisma.lifeCalendarSettings.delete({
    where: { id },
  })

  revalidatePath('/admin/life-calendar')
}

export default async function AdminLifeCalendarPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  if (!session.user.isAdmin) {
    redirect('/dashboard')
  }

  const lifeItems = await prisma.lifeCalendarSettings.findMany({
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

  type LifeItem = (typeof lifeItems)[number]

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-8 h-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              生命日历设置
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            查看所有用户保存的生命日历参数
          </p>
        </div>

        <div className="overflow-x-auto border rounded-md bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">用户邮箱</th>
                <th className="px-3 py-2 text-left">当前年龄</th>
                <th className="px-3 py-2 text-left">目标年龄</th>
                <th className="px-3 py-2 text-left">更新时间</th>
                <th className="px-3 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {lifeItems.map((item: LifeItem) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 align-top">{item.user?.email}</td>
                  <td className="px-3 py-2 align-top">{item.currentAge}</td>
                  <td className="px-3 py-2 align-top">{item.targetAge}</td>
                  <td className="px-3 py-2 align-top text-xs">
                    {item.updatedAt instanceof Date
                      ? item.updatedAt.toLocaleString()
                      : String(item.updatedAt)}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <form action={deleteLifeCalendar}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded border px-2 py-1 text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {lifeItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-muted-foreground"
                  >
                    暂无生命日历设置
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