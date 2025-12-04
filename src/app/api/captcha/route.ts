import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

function generateCaptchaCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateCaptchaSVG(code: string): string {
  const width = 120;
  const height = 40;
  const fontSize = 24;

  // 生成随机背景色
  const bgColor = `hsl(${Math.random() * 360}, 20%, 95%)`;

  // 生成干扰线
  let lines = '';
  for (let i = 0; i < 3; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const color = `hsl(${Math.random() * 360}, 50%, 60%)`;
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1" opacity="0.3"/>`;
  }

  // 生成验证码文字
  let texts = '';
  const charSpacing = width / (code.length + 1);
  for (let i = 0; i < code.length; i++) {
    const x = charSpacing * (i + 1);
    const y = height / 2 + fontSize / 3;
    const rotation = (Math.random() - 0.5) * 30;
    const color = `hsl(${Math.random() * 360}, 60%, 40%)`;
    texts += `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="bold" fill="${color}" text-anchor="middle" transform="rotate(${rotation} ${x} ${y})">${code[i]}</text>`;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      ${lines}
      ${texts}
    </svg>
  `;
}

export async function GET() {
  // 生成验证码
  const code = generateCaptchaCode();
  const id = Math.random().toString(36).substring(2);

  // 存储验证码到 Redis，5分钟有效期 (300秒)
  await redis.set(`captcha:${id}`, code.toLowerCase(), { ex: 300 });

  // 生成 SVG 图片
  const svg = generateCaptchaSVG(code);

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Captcha-Id': id,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { id, code } = await request.json();

    if (!id || !code) {
      return NextResponse.json(
        { success: false, message: '参数错误' },
        { status: 400 }
      );
    }

    const storedCode = await redis.get<string>(`captcha:${id}`);

    if (!storedCode) {
      return NextResponse.json(
        { success: false, message: '验证码已过期' },
        { status: 400 }
      );
    }

    if (storedCode !== code.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: '验证码错误' },
        { status: 400 }
      );
    }

    // 验证成功后删除验证码
    await redis.del(`captcha:${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('验证码验证失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
