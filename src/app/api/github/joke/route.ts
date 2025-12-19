import { NextRequest, NextResponse } from 'next/server';
import { jokes } from '@/data/jokes/jokes';
import { renderQnACard, renderQuoteCard } from '@/lib/svg-renderers/joke-render';

// 缓存时间（秒）
const CACHE_SECONDS = 10;

// 主题配置
const THEME_CONFIG = {
  dark: {
    borderColor: '#30363d',
    bgColor: '#000000',
    qColor: '#ffffff',
    aColor: '#e5e5e5',
    quoteColor: '#ffffff',
    codeColor: '#ffffff',
  },
  light: {
    borderColor: '#e1e4e8',
    bgColor: '#ffffff',
    qColor: '#000000',
    aColor: '#24292e',
    quoteColor: '#000000',
    codeColor: '#24292e',
  },
};

type ThemeName = keyof typeof THEME_CONFIG;

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
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined;
    const height = searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined;

    // 默认使用 dark 主题配色
    const themeConfig = THEME_CONFIG.dark;

    const borderColor = themeConfig.borderColor;
    const bgColor = themeConfig.bgColor;
    const qColor = themeConfig.qColor;
    const aColor = themeConfig.aColor;
    const textColor = themeConfig.quoteColor;
    const codeColor = themeConfig.codeColor;

    // 根据笑话类型渲染 SVG
    let svgContent: string;

    if (typeof joke === 'object' && joke !== null && 'q' in joke && 'a' in joke) {
      // QnA 类型的笑话
      svgContent = renderQnACard({
        question: joke.q,
        answer: joke.a,
        questionZh: 'q_zh' in joke ? joke.q_zh : undefined,
        answerZh: 'a_zh' in joke ? joke.a_zh : undefined,
        qColor,
        aColor,
        bgColor,
        borderColor,
        codeColor,
        hideBorder: false,
        width,
        height,
      });
    } else if (typeof joke === 'object' && joke !== null && 'text' in joke) {
      // Quote 类型的笑话（对象形式）
      svgContent = renderQuoteCard({
        text: joke.text,
        textZh: 'text_zh' in joke ? joke.text_zh : undefined,
        textColor,
        bgColor,
        borderColor,
        codeColor,
        hideBorder: false,
        width,
        height,
      });
    } else {
      // Quote 类型的笑话（字符串形式）
      const text = typeof joke === 'string' ? joke : JSON.stringify(joke);
      svgContent = renderQuoteCard({
        text,
        textColor,
        bgColor,
        borderColor,
        codeColor,
        hideBorder: false,
        width,
        height,
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


