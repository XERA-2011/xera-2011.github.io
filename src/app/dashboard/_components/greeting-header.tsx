"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

export function GreetingHeader() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
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
  )
}
