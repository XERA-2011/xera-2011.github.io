import { NextRequest, NextResponse } from 'next/server';
import { jokes } from '@/data/jokes/jokes';
import { renderQnACard, renderQuoteCard } from '@/lib/svg-renderers/joke-render';

// 缓存时间（秒）
const CACHE_SECONDS = 10;

// 主题配置
const THEME_CONFIG = {
  dark: {
    borderColor: '#ffffff',
    bgColor: 'transparent',
    qColor: '#ffffff',
    aColor: '#ffffff',
    quoteColor: '#ffffff',
    codeColor: '#ffffff',
  },
  light: {
    borderColor: '#000000',
    bgColor: 'transparent',
    qColor: '#000000',
    aColor: '#000000',
    quoteColor: '#000000',
    codeColor: '#000000',
  },
};

type ThemeName = keyof typeof THEME_CONFIG;

// 估算文本所需行数
function estimateLines(text: string, fontSize: number, containerWidth: number): number {
  if (!text) return 0;
  // 简单估算：每个字符平均宽度为 fontSize * 0.6 (考虑中英文混排)
  // 中文字符宽度 = fontSize
  // 英文字符宽度 ≈ fontSize * 0.6
  let width = 0;
  for (const char of text) {
    if (char.charCodeAt(0) > 255) {
      width += fontSize;
    } else {
      width += fontSize * 0.55;
    }
  }
  return Math.ceil(width / containerWidth);
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
    const requestedWidth = searchParams.get('width') ? parseInt(searchParams.get('width')!) : undefined;
    const requestedHeight = searchParams.get('height') ? parseInt(searchParams.get('height')!) : undefined;
    const theme = searchParams.get('theme') as ThemeName | null;

    // 默认使用 dark 主题配色
    const themeConfig = theme && THEME_CONFIG[theme] ? THEME_CONFIG[theme] : THEME_CONFIG.dark;

    const borderColor = themeConfig.borderColor;
    const bgColor = themeConfig.bgColor;
    const qColor = themeConfig.qColor;
    const aColor = themeConfig.aColor;
    const textColor = themeConfig.quoteColor;
    const codeColor = themeConfig.codeColor;

    // 布局常量
    const PADDING = 32; // 1rem * 2
    const FONT_SIZE = 14;
    const LINE_HEIGHT = 1.5; // CSS line-height: 1.5
    const GAP = 8; // .question margin-bottom: 0.5rem (8px)
    const ZH_GAP = 2; // .zh margin-top: 2px
    const DEFAULT_WIDTH = 500;
    
    // 计算有效宽度
    const configWidth = requestedWidth || DEFAULT_WIDTH;
    const contentWidth = configWidth - PADDING;

    // 估算所需高度
    let estimatedHeight = 0;

    if (typeof joke === 'object' && joke !== null && 'q' in joke && 'a' in joke) {
      // QnA 类型的笑话
      // 加上前缀 "Q. " 和 "A. " 的宽度估算 (约为 3 个宽字符)
      const qPrefix = "Q. ";
      const aPrefix = "A. ";
      
      const qLines = estimateLines(qPrefix + joke.q, FONT_SIZE, contentWidth);
      const aLines = estimateLines(aPrefix + joke.a, FONT_SIZE, contentWidth);
      
      estimatedHeight = PADDING + (qLines * FONT_SIZE * LINE_HEIGHT) + GAP + (aLines * FONT_SIZE * LINE_HEIGHT);

      if ('q_zh' in joke) {
        const qZhLines = estimateLines("问：" + joke.q_zh!, FONT_SIZE * 0.9, contentWidth);
        estimatedHeight += (qZhLines * FONT_SIZE * 0.9 * LINE_HEIGHT) + ZH_GAP;
      }
      if ('a_zh' in joke) {
        const aZhLines = estimateLines("答：" + joke.a_zh!, FONT_SIZE * 0.9, contentWidth);
        estimatedHeight += (aZhLines * FONT_SIZE * 0.9 * LINE_HEIGHT) + ZH_GAP;
      }

    } else {
      // Quote 类型的笑话
      let text = '';
      let textZh = '';
      if (typeof joke === 'object' && joke !== null && 'text' in joke) {
        text = joke.text;
        textZh = 'text_zh' in joke ? joke.text_zh! : '';
      } else {
        text = typeof joke === 'string' ? joke : JSON.stringify(joke);
      }
      
      const lines = estimateLines(text, FONT_SIZE, contentWidth);
      estimatedHeight = PADDING + (lines * FONT_SIZE * LINE_HEIGHT);
      
      if (textZh) {
        const zhLines = estimateLines(textZh, FONT_SIZE * 0.9, contentWidth);
        estimatedHeight += (zhLines * FONT_SIZE * 0.9 * LINE_HEIGHT) + ZH_GAP;
      }
    }

    // 确定最终宽高
    // 如果没有指定 height，使用估算高度（最小 100）
    const minHeight = 100;
    const finalHeight = requestedHeight || Math.max(minHeight, Math.ceil(estimatedHeight));

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
        width: configWidth,
        height: finalHeight,
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
        width: configWidth,
        height: finalHeight,
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
        width: configWidth,
        height: finalHeight,
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


