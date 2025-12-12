import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: "无效的用户名" }, { status: 400 })
    }

    const trimmedName = name.trim()

    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json({ error: "用户名长度需在 2 到 20 个字符之间" }, { status: 400 })
    }

    // 简单的正则检查：允许中文、字母、数字、下划线、减号
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(trimmedName)) {
       return NextResponse.json({ error: "用户名只能包含中文、字母、数字、下划线和减号" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { name: trimmedName },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("更新用户名失败:", error)
    return NextResponse.json({ error: "更新用户名失败" }, { status: 500 })
  }
}
