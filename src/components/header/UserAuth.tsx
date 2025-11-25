import { auth } from "@/auth"
import Link from "next/link"
import Image from "next/image"
import { UserCircle } from "lucide-react"

export default async function UserAuth() {
  const session = await auth()

  if (session?.user) {
    return (
      <Link
        href="/dashboard"
        className="cursor-can-hover flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="用户中心"
      >
        {session.user.image && (
          <div className="rounded-full bg-white">
            <Image
              src={session.user.image}
              alt={session.user.name || "用户头像"}
              width={24}
              height={24}
              priority
              className="rounded-full w-6 h-6"
            />
          </div>
        )}
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="cursor-can-hover flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
      aria-label="登录"
    >
      <UserCircle className="w-6 h-6" />
    </Link>
  )
}
