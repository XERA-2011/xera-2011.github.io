'use client';

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { GreetingHeader } from "@/components/dashboard/greeting-header"
import { UserInfoCard } from "@/components/dashboard/user-info-card"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <GreetingHeader />
        <UserInfoCard />
      </div>
    </div>
  )
}

