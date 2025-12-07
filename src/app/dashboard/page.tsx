'use client';

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 12) return '早上好';
              if (hour >= 12 && hour < 18) return '下午好';
              if (hour >= 18 && hour < 22) return '晚上好';
              return '夜深了';
            })()}，{session.user.name}
          </h1>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                {session.user.image && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-primary/10 rounded-full blur opacity-50"></div>
                    <div className="relative rounded-full bg-white">
                      <Image
                        src={session.user.image}
                        alt="头像"
                        width={96}
                        height={96}
                        priority
                        className="rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* User details */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold mb-2">
                    {session.user.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {session.user.email}
                  </p>

                  <Separator className="my-4" />

                  {/* Sign out button */}
                  <Button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    variant="outline"
                    className="mt-4"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        退出中...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4 mr-2" />
                        退出登录
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
