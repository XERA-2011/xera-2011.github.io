"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">登录</h2>
          <p className="mt-2 text-gray-600">使用 Google 账号登录</p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-colors"
        >
          使用 Google 登录
        </button>
      </div>
    </div>
  )
}
