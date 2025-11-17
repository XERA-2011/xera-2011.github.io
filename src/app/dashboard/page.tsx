'use client';

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { motion } from 'framer-motion'
import GlowCard from "@/components/ui/GlowCard"

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
        <div className="animate-pulse text-white/60">加载中...</div>
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
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            仪表板
          </h1>
          <p className="text-white/60">欢迎回来，{session.user.name}</p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="bg-black/40 backdrop-blur-sm p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              {session.user.image && (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/10 rounded-full blur opacity-50"></div>
                  <Image
                    src={session.user.image}
                    alt="头像"
                    width={96}
                    height={96}
                    priority
                    className="relative rounded-full border-2 border-white/20"
                  />
                </div>
              )}

              {/* User details */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {session.user.name}
                </h2>
                <p className="text-white/60">
                  {session.user.email}
                </p>

                {/* Sign out button */}
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="cursor-can-hover relative inline-flex items-center gap-3 px-8 py-2.5 mt-8 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-can-hover"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>退出中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>退出登录</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  )
}
