import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { avatarUrl } = await req.json()

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return NextResponse.json({ error: "无效的头像 URL" }, { status: 400 })
    }

    // 简单的安全检查，确保 URL 是来自 dicebear 的
    if (!avatarUrl.startsWith('https://api.dicebear.com/')) {
       return NextResponse.json({ error: "仅支持 DiceBear 头像" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { image: avatarUrl },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("更新头像失败:", error)
    return NextResponse.json({ error: "更新头像失败" }, { status: 500 })
  }
}
