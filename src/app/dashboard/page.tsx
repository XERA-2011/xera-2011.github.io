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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
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
                  className="cursor-can-hover cursor-pointer relative inline-flex items-center gap-3 px-8 py-2.5 mt-8 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Tools Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            {/* Life Countdown Tool */}
            <GlowCard
              className="bg-black/40 backdrop-blur-sm p-6 cursor-pointer hover:bg-black/50 transition-all duration-300 group w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] max-w-xs"
              onClick={() => router.push('/tools/life-countdown')}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white">人生倒计时</h3>
              </div>
            </GlowCard>

            {/* Asset Allocation Tool */}
            <GlowCard
              className="bg-black/40 backdrop-blur-sm p-6 cursor-pointer hover:bg-black/50 transition-all duration-300 group w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] max-w-xs"
              onClick={() => router.push('/tools/asset-allocation')}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white">资产配置</h3>
              </div>
            </GlowCard>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="max-w-4xl mx-auto mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-6 text-sm">
            <button
              onClick={() => router.push('/privacy')}
              className="cursor-can-hover text-white/60 hover:text-white transition-colors"
            >
              隐私政策
            </button>
            <span className="text-white/30">•</span>
            <button
              onClick={() => router.push('/terms')}
              className="cursor-can-hover text-white/60 hover:text-white transition-colors"
            >
              服务条款
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
