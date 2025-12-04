import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getDefaultAvatar, EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, captchaId, captchaCode } = await request.json();

    // 验证必填字段
    if (!email || !password || !captchaId || !captchaCode) {
      return NextResponse.json(
        { success: false, message: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, message: `密码长度至少为${MIN_PASSWORD_LENGTH}位` },
        { status: 400 }
      );
    }

    // 验证验证码
    const captchaResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:2011'}/api/captcha`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: captchaId, code: captchaCode }),
      }
    );

    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      return NextResponse.json(
        { success: false, message: captchaResult.message || '验证码错误' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split('@')[0],
        image: getDefaultAvatar(email),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: '注册成功',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
