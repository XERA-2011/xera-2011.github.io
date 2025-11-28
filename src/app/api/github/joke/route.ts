import { NextRequest, NextResponse } from 'next/server';
import { jokes } from '@/data/jokes/jokes';
import { themes } from '@/data/jokes/themes';
import { renderQnACard, renderQuoteCard } from '@/utils/joke-render';

// 缓存时间（秒）
const CACHE_SECONDS = 10;

/**
 * 从数组中随机获取一个元素
 */
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(request: NextRequest) {
  try {
    // 随机选择一个笑话
    const jokeKeys = Object.keys(jokes);
    const randomKey = jokeKeys[Math.floor(Math.random() * jokeKeys.length)];
    const joke = jokes[randomKey];

    // 验证笑话是否存在
    if (!joke) {
      console.error('Joke not found for key:', randomKey);
      return new NextResponse('Joke not found', { status: 404 });
    }

    // 获取查询参数
    const { searchParams } = request.nextUrl;
    let theme = searchParams.get('theme')?.toLowerCase() || 'default';
    const hideBorder = searchParams.has('hideBorder');

    // 处理随机主题
    if (theme === 'random') {
      theme = getRandomElement(Object.keys(themes));
    }

    // 获取主题配置，如果不存在则使用默认主题
    const themeConfig = themes[theme] || themes.default;

    // 从 URL 参数获取颜色配置，如果没有则使用主题配置
    const borderColor = searchParams.get('borderColor') || themeConfig.borderColor;
    const bgColor = searchParams.get('bgColor') || themeConfig.bgColor;
    const qColor = searchParams.get('qColor') || themeConfig.qColor;
    const aColor = searchParams.get('aColor') || themeConfig.aColor;
    const textColor = searchParams.get('textColor') || themeConfig.quoteColor;
    const codeColor = searchParams.get('codeColor') || themeConfig.codeColor;

    // 根据笑话类型渲染 SVG
    let svgContent: string;

    if (typeof joke === 'object' && joke !== null && 'q' in joke && 'a' in joke) {
      // QnA 类型的笑话
      svgContent = renderQnACard({
        question: joke.q,
        answer: joke.a,
        qColor,
        aColor,
        bgColor,
        borderColor,
        codeColor,
        hideBorder,
      });
    } else {
      // Quote 类型的笑话
      const text = typeof joke === 'string' ? joke : JSON.stringify(joke);
      svgContent = renderQuoteCard({
        text,
        textColor,
        bgColor,
        borderColor,
        codeColor,
        hideBorder,
      });
    }

    // 返回 SVG 响应
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error('Error generating joke card:', error);
    return new NextResponse('Error generating joke card', { status: 500 });
  }
}
