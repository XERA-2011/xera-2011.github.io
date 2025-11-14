import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border p-6">
          <h1 className="text-3xl font-bold">仪表板</h1>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600">用户信息</p>
              <div className="mt-2 space-y-2">
                <p><strong>姓名:</strong> {session.user.name}</p>
                <p><strong>邮箱:</strong> {session.user.email}</p>
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt="头像"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full"
                  />
                )}
              </div>
            </div>

            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                退出登录
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
