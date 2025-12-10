import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'

const adminLinks = [
  { href: '/admin/users', title: '用户列表', description: '查看所有用户及其基础信息' },
  { href: '/admin/life-calendar', title: '生命日历设置', description: '查看所有用户的生命日历配置' },
  { href: '/admin/asset-allocation', title: '资产配置记录', description: '查看所有用户的资产配置记录' },
]

export default async function AdminHomePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  if (!session.user.isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              管理员控制台
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            仅管理员可见的站点数据总览和管理入口
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {adminLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-lg border px-4 py-3 hover:bg-accent transition-colors text-left"
            >
              <div className="font-semibold mb-1">{link.title}</div>
              <div className="text-xs text-muted-foreground">{link.description}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
