"use client"

import Link from "next/link"
import { UserCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { UserAvatar } from "./user-avatar"

export default function UserAuth() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <Link
        href="/dashboard"
        className="cursor-can-hover flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="用户中心"
      >
        <UserAvatar user={session.user} />
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
