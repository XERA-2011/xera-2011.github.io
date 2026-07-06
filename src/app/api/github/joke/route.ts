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

// 估算文本所需行数 (剥离 HTML 标签，并正确处理换行)
function estimateLines(text: string, fontSize: number, containerWidth: number): number {
  if (!text) return 0;
  
  // 将常见的换行/段落标签（如 <p>, <br>, <div> 等）转换为换行符，并剥离其他所有 HTML 标签
  const cleanText = text
    .replace(/<\/?(p|br|div|h[1-6])[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '');
    
  const paragraphs = cleanText.split('\n');
  let totalLines = 0;
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    let width = 0;
    for (const char of trimmed) {
      if (char.charCodeAt(0) > 255) {
        width += fontSize;
      } else {
        width += fontSize * 0.55;
      }
    }
    // 每个非空段落/行至少占用 1 行
    totalLines += Math.max(1, Math.ceil(width / containerWidth));
  }
  
  return totalLines;
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
    const DEFAULT_FONT_SIZE = 14;
    const LINE_HEIGHT = 1.5; // CSS line-height: 1.5
    const GAP = 8; // .question margin-bottom: 0.5rem (8px)
    const ZH_GAP = 2; // .zh margin-top: 2px
    const DEFAULT_WIDTH = 500;
    const MIN_FONT_SIZE = 10;
    
    // 计算有效宽度
    const configWidth = requestedWidth || DEFAULT_WIDTH;
    const contentWidth = configWidth - PADDING;

    // 根据字体大小估算所需高度的辅助函数
    const getEstimatedHeight = (fs: number): number => {
      if (typeof joke === 'object' && joke !== null && 'q' in joke && 'a' in joke) {
        const qPrefix = "Q. ";
        const aPrefix = "A. ";
        
        const qLines = estimateLines(qPrefix + joke.q, fs, contentWidth);
        const aLines = estimateLines(aPrefix + joke.a, fs, contentWidth);
        
        let height = PADDING + (qLines * fs * LINE_HEIGHT) + GAP + (aLines * fs * LINE_HEIGHT);
  
        if ('q_zh' in joke) {
          const qZhLines = estimateLines("问：" + joke.q_zh!, fs * 0.9, contentWidth);
          height += (qZhLines * fs * 0.9 * LINE_HEIGHT) + ZH_GAP;
        }
        if ('a_zh' in joke) {
          const aZhLines = estimateLines("答：" + joke.a_zh!, fs * 0.9, contentWidth);
          height += (aZhLines * fs * 0.9 * LINE_HEIGHT) + ZH_GAP;
        }
        return height;
      } else {
        let text = '';
        let textZh = '';
        if (typeof joke === 'object' && joke !== null && 'text' in joke) {
          text = joke.text;
          textZh = 'text_zh' in joke ? joke.text_zh! : '';
        } else {
          text = typeof joke === 'string' ? joke : JSON.stringify(joke);
        }
        
        const lines = estimateLines(text, fs, contentWidth);
        let height = PADDING + (lines * fs * LINE_HEIGHT);
        
        if (textZh) {
          const zhLines = estimateLines(textZh, fs * 0.9, contentWidth);
          height += (zhLines * fs * 0.9 * LINE_HEIGHT) + ZH_GAP;
        }
        return height;
      }
    };

    // 动态计算最佳字体大小
    let fontSize = DEFAULT_FONT_SIZE;
    let estimatedHeight = getEstimatedHeight(fontSize);

    // 如果指定了高度，且初始字体大小时内容溢出，则逐步缩小字体大小（最小缩至 MIN_FONT_SIZE）
    if (requestedHeight) {
      while (estimatedHeight > requestedHeight && fontSize > MIN_FONT_SIZE) {
        fontSize -= 0.5;
        estimatedHeight = getEstimatedHeight(fontSize);
      }
    }

    // 确定最终宽高
    // 如果没有指定 height，使用估算高度（最小 100）
    // 如果指定了 height 但在最小字体下内容依然超出，则自适应增高防止截断
    const minHeight = 100;
    const finalHeight = requestedHeight 
      ? Math.max(requestedHeight, Math.ceil(estimatedHeight))
      : Math.max(minHeight, Math.ceil(estimatedHeight));

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
        fontSize,
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
        fontSize,
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
        fontSize,
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


