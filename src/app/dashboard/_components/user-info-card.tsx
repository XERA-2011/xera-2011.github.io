"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LogOut, Edit2 } from "lucide-react"
import { AvatarEditDialog } from "./avatar-edit-dialog"
import { NameEditDialog } from "./name-edit-dialog"

export function UserInfoCard() {
  const { data: session } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!session?.user) return null

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: "/" })
  }

  return (
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
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-primary/10 rounded-full blur opacity-50"></div>
              <div className="relative rounded-full bg-white overflow-hidden">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="头像"
                    width={96}
                    height={96}
                    priority
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gray-500">{session.user.name?.[0] || '?'}</span>
                  </div>
                )}

                {/* Edit Overlay */}
                <AvatarEditDialog>
                  <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                    <Edit2 className="w-6 h-6 text-white" />
                  </button>
                </AvatarEditDialog>
              </div>
            </div>

            {/* User details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <h2 className="text-2xl font-bold">
                  {session.user.name}
                </h2>
                <NameEditDialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-50 hover:opacity-100"
                    title="修改昵称"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </NameEditDialog>
              </div>
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
  )
}
