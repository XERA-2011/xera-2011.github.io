"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import { User } from "next-auth"

interface UserAvatarProps {
  user: User
}

export function UserAvatar({ user: initialUser }: UserAvatarProps) {
  const { data: session } = useSession()
  const user = session?.user || initialUser

  if (!user.image) return null

  return (
    <div className="rounded-full bg-white">
      <Image
        src={user.image}
        alt={user.name || "用户头像"}
        width={24}
        height={24}
        priority
        className="rounded-full w-6 h-6"
      />
    </div>
  )
}
