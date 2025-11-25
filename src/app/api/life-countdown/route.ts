import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET - 获取用户的人生倒计时设置
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const settings = await prisma.lifeCountdownSettings.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    console.error('获取人生倒计时设置失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST - 保存或更新用户的人生倒计时设置
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentAge, targetAge } = body;

    // 验证输入
    if (typeof currentAge !== 'number' || typeof targetAge !== 'number') {
      return NextResponse.json(
        { error: '无效的年龄数据' },
        { status: 400 }
      );
    }

    if (currentAge < 0 || targetAge < 0) {
      return NextResponse.json(
        { error: '年龄不能为负数' },
        { status: 400 }
      );
    }

    if (currentAge >= targetAge) {
      return NextResponse.json(
        { error: '目标年龄必须大于当前年龄' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const settings = await prisma.lifeCountdownSettings.upsert({
      where: { userId: user.id },
      update: {
        currentAge,
        targetAge,
      },
      create: {
        userId: user.id,
        currentAge,
        targetAge,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('保存人生倒计时设置失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
