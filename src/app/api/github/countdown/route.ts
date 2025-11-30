import { NextRequest, NextResponse } from 'next/server';

// 字体颜色配置
const COLOR_CONFIG = {
  black: {
    text: '#000000'
  },
  white: {
    text: '#ffffff'
  },
};

type ColorName = keyof typeof COLOR_CONFIG;

interface CountdownData {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  isExpired: boolean;
}

/**
 * 计算倒计时数据
 */
function calculateCountdown(targetDate: Date): CountdownData {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      years: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      isExpired: true
    };
  }

  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    years,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    isExpired: false
  };
}

/**
 * 渲染倒计时卡片
 */
function renderCountdownCard(
  countdownData: CountdownData,
  options: {
    color?: ColorName;
  } = {}
) {
  const {
    color: colorName = 'black',
  } = options;

  const color = COLOR_CONFIG[colorName] || COLOR_CONFIG.black;
  const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif";

  const text = `Countdown: ${countdownData.totalDays.toLocaleString()} days`;
  const fontSize = 20;
  const padding = 10;

  // 估算文字宽度（每个字符约为字体大小的0.55倍）
  const textWidth = text.length * fontSize * 0.55;
  const cardWidth = Math.ceil(textWidth + padding * 2);
  const cardHeight = fontSize + padding * 2;

  return `
    <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="${cardWidth / 2}" y="${cardHeight / 2 + fontSize / 3}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="600" fill="${color.text}" text-anchor="middle">
        ${text}
      </text>
    </svg>
  `;
}

/**
 * 渲染过期卡片
 */
function renderExpiredCard(
  options: {
    color?: ColorName;
  } = {}
) {
  const {
    color: colorName = 'black',
  } = options;

  const color = COLOR_CONFIG[colorName] || COLOR_CONFIG.black;
  const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif";

  const text = 'Countdown: Expired';
  const fontSize = 20;
  const padding = 10;

  // 估算文字宽度
  const textWidth = text.length * fontSize * 0.55;
  const cardWidth = Math.ceil(textWidth + padding * 2);
  const cardHeight = fontSize + padding * 2;

  return `
    <svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="${cardWidth / 2}" y="${cardHeight / 2 + fontSize / 3}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="600" fill="${color.text}" text-anchor="middle">
        ${text}
      </text>
    </svg>
  `;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 获取参数
    const targetParam = searchParams.get('target');
    const color = (searchParams.get('color') || 'black') as ColorName;

    if (!targetParam) {
      const errorSvg = `
        <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" font-family="sans-serif" fill="#000000" text-anchor="middle">
            请提供目标时间参数 (target)
          </text>
        </svg>
      `;
      return new NextResponse(errorSvg, {
        status: 400,
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }

    // 解析目标时间
    let targetDate: Date;
    try {
      // 支持多种格式
      if (targetParam.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD
        targetDate = new Date(targetParam + 'T23:59:59');
      } else if (targetParam.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
        // YYYY-MM-DDTHH:mm:ss
        targetDate = new Date(targetParam);
      } else if (targetParam.match(/^\d{13}$/)) {
        // 时间戳（毫秒）
        targetDate = new Date(parseInt(targetParam));
      } else if (targetParam.match(/^\d{10}$/)) {
        // 时间戳（秒）
        targetDate = new Date(parseInt(targetParam) * 1000);
      } else {
        // 尝试直接解析
        targetDate = new Date(targetParam);
      }

      if (isNaN(targetDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch {
      const errorSvg = `
        <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="50%" font-family="sans-serif" fill="#000000" text-anchor="middle">
            无效的时间格式
          </text>
        </svg>
      `;
      return new NextResponse(errorSvg, {
        status: 400,
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }

    // 计算倒计时
    const countdownData = calculateCountdown(targetDate);

    let svgContent: string;

    if (countdownData.isExpired) {
      svgContent = renderExpiredCard({ color });
    } else {
      svgContent = renderCountdownCard(countdownData, { color });
    }

    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=30, s-maxage=30' // 30秒缓存，因为倒计时会变化
      }
    });
  } catch (error) {
    console.error('倒计时API错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorSvg = `
      <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" font-family="sans-serif" fill="#000000" text-anchor="middle">
          ${errorMessage}
        </text>
      </svg>
    `;
    return new NextResponse(errorSvg, {
      status: 500,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}