import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/constants';
import { MOVIE_QUOTES } from '@/data/typing-svg/movie-quotes';
import { FAMOUS_QUOTES } from '@/data/typing-svg/famous-quotes';
import {
  parseBoolean,
  parsePositiveInt,
  parseNonNegativeInt,
  parseColor,
  parseFont,
  escapeHtml,
} from '@/utils/validators';

// 缓存时间（秒）
const CACHE_SECONDS = 3600;

// 默认配置
const DEFAULTS = {
  font: 'monospace',
  weight: '400',
  color: '#36BCF7',
  background: '#00000000',
  size: '20',
  center: 'false',
  vCenter: 'false',
  width: '400',
  height: '50',
  multiline: 'false',
  duration: '5000',
  pause: '0',
  repeat: 'true',
  separator: ';',
  letterSpacing: 'normal',
  bold: 'true',
};

/**
 * 估算文本宽度
 */
function estimateTextWidth(text: string, fontSize: number, letterSpacing: string): number {
  // 粗略估算：每个字符宽度约为 fontSize * 0.6
  // 加上 letterSpacing
  const spacing = parseFloat(letterSpacing) || 0;
  const charWidth = fontSize * 0.6 + spacing;
  
  // 考虑中文字符宽度较大
  let width = 0;
  for (const char of text) {
    // 判断是否为中文字符（简单判断）
    if (char.charCodeAt(0) > 255) {
      width += fontSize + spacing;
    } else {
      width += charWidth;
    }
  }
  return width;
}

/**
 * 自动换行
 */
function wordWrap(text: string, maxWidth: number, fontSize: number, letterSpacing: string): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = estimateTextWidth(currentLine + ' ' + word, fontSize, letterSpacing);
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * 生成打字机效果的 SVG
 */
function generateTypingSVG(params: {
  lines: string[];
  font: string;
  weight: string;
  color: string;
  background: string;
  size: number;
  center: boolean;
  vCenter: boolean;
  width: number;
  height: number;
  multiline: boolean;
  duration: number;
  pause: number;
  repeat: boolean;
  letterSpacing: string;
}): string {
  const {
    lines,
    font,
    weight,
    color,
    background,
    size,
    center,
    vCenter,
    width,
    height,
    multiline,
    duration,
    pause,
    repeat,
    letterSpacing,
  } = params;

  const lastLineIndex = lines.length - 1;

  // 生成每一行的动画和文本
  const linesContent = lines
    .map((line, i) => {
      let animationContent = '';

      if (!multiline) {
        // 单行模式：每行文本替换显示
        const begin =
          i === 0
            ? repeat
              ? `0s;d${lastLineIndex}.end`
              : '0s'
            : `d${i - 1}.end`;

        const freeze = !repeat && i === lastLineIndex;
        const yOffset = height / 2;
        const emptyLine = `m0,${yOffset} h0`;
        const fullLine = `m0,${yOffset} h${width}`;

        const values = [
          emptyLine,
          fullLine,
          fullLine,
          freeze ? fullLine : emptyLine,
        ].join(' ; ');

        const totalDuration = duration + pause;
        const keyTimes = [
          '0',
          (0.8 * duration) / totalDuration,
          (0.8 * duration + pause) / totalDuration,
          '1',
        ].join(';');

        animationContent = `
        <path id='path${i}'>
          <animate id='d${i}' attributeName='d' begin='${begin}'
            dur='${totalDuration}ms' fill='${freeze ? 'freeze' : 'remove'}'
            values='${values}' keyTimes='${keyTimes}' />
        </path>
        <text font-family='"${font}", monospace' fill='${color}' font-size='${size}'
          dominant-baseline='${vCenter ? 'middle' : 'auto'}'
          x='${center ? '50%' : '0%'}' text-anchor='${center ? 'middle' : 'start'}'
          letter-spacing='${letterSpacing}' font-weight='${weight}'>
          <textPath xlink:href='#path${i}'>
            ${escapeHtml(line)}
          </textPath>
        </text>`;
      } else {
        // 多行模式：文本逐行累加显示
        const nextIndex = i + 1;
        const lineHeight = size + 5;
        const lineDuration = (duration + pause) * nextIndex;
        const yOffset = nextIndex * lineHeight;
        const emptyLine = `m0,${yOffset} h0`;
        const fullLine = `m0,${yOffset} h${width}`;

        const values = [emptyLine, emptyLine, fullLine, fullLine].join(' ; ');
        const keyTimes = [
          '0',
          i / nextIndex,
          i / nextIndex + duration / lineDuration,
          '1',
        ].join(';');

        animationContent = `
        <path id='path${i}'>
          <animate id='d${i}' attributeName='d' begin='0s${repeat ? `;d${lastLineIndex}.end` : ''}'
            dur='${lineDuration}ms' fill="freeze"
            values='${values}' keyTimes='${keyTimes}' />
        </path>
        <text font-family='"${font}", monospace' fill='${color}' font-size='${size}'
          dominant-baseline='${vCenter ? 'middle' : 'auto'}'
          x='${center ? '50%' : '0%'}' text-anchor='${center ? 'middle' : 'start'}'
          letter-spacing='${letterSpacing}' font-weight='${weight}'>
          <textPath xlink:href='#path${i}'>
            ${escapeHtml(line)}
          </textPath>
        </text>`;
      }

      return animationContent;
    })
    .join('\n');

  return `<!-- ${BASE_URL}/github/typing-svg -->
<svg xmlns='http://www.w3.org/2000/svg'
    xmlns:xlink='http://www.w3.org/1999/xlink'
    viewBox='0 0 ${width} ${height}'
    style='background-color: ${background};'
    width='${width}px' height='${height}px'>
    ${linesContent}
</svg>`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 解析参数
    let linesParam = searchParams.get('lines') || '';
    const separator = searchParams.get('separator') || DEFAULTS.separator;
    const type = searchParams.get('type');

    // 如果指定了 type=movie-quotes，则随机获取一条电影台词
    if (type === 'movie-quotes') {
      const quote = MOVIE_QUOTES[Math.floor(Math.random() * MOVIE_QUOTES.length)];
      linesParam = [
        quote.english,
        quote.chinese
      ].join(separator);
    } else if (type === 'famous-quotes') {
      // 随机获取一条名人名言
      const quote = FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
      linesParam = [
        quote.english,
        quote.chinese
      ].join(separator);
    }

    // 验证 lines 参数
    if (!linesParam) {
      return new NextResponse('Lines parameter is required', { status: 400 });
    }

    // 解析其他参数
    const font = parseFont(searchParams.get('font') || DEFAULTS.font);
    const bold = parseBoolean(searchParams.get('bold') || DEFAULTS.bold);
    const weight = bold ? '700' : (searchParams.get('weight') || DEFAULTS.weight);
    const color = parseColor(
      searchParams.get('color') || DEFAULTS.color,
      DEFAULTS.color
    );
    const background = parseColor(
      searchParams.get('background') || DEFAULTS.background,
      DEFAULTS.background
    );
    const size = parsePositiveInt(
      searchParams.get('size') || DEFAULTS.size,
      'Font size'
    );
    const center = parseBoolean(
      searchParams.get('center') || DEFAULTS.center
    );
    const vCenter = parseBoolean(
      searchParams.get('vCenter') || DEFAULTS.vCenter
    );
    const width = parsePositiveInt(
      searchParams.get('width') || DEFAULTS.width,
      'Width'
    );
    let height = parsePositiveInt(
      searchParams.get('height') || DEFAULTS.height,
      'Height'
    );
    const multiline = parseBoolean(
      searchParams.get('multiline') || (type === 'movie-quotes' ? 'true' : DEFAULTS.multiline)
    );
    const duration = parsePositiveInt(
      searchParams.get('duration') || DEFAULTS.duration,
      'Duration'
    );
    const pause = parseNonNegativeInt(
      searchParams.get('pause') || DEFAULTS.pause,
      'Pause'
    );
    const repeat = parseBoolean(
      searchParams.get('repeat') || DEFAULTS.repeat
    );
    const letterSpacing = searchParams.get('letterSpacing') || DEFAULTS.letterSpacing;

    // 分割并清理行，并进行自动换行处理
    let lines = linesParam.split(separator).map((line) => line.trim());
    
    if (multiline) {
      const wrappedLines: string[] = [];
      lines.forEach(line => {
        // 预留一些边距，比如左右各 10px
        const maxWidth = width - 20;
        const wrapped = wordWrap(line, maxWidth, size, letterSpacing);
        wrappedLines.push(...wrapped);
      });
      lines = wrappedLines;

      // 动态调整高度：如果计算出的高度大于当前高度，则更新高度
      const requiredHeight = lines.length * (size + 5) + 10;
      if (requiredHeight > height) {
        height = requiredHeight;
      }
    }

    // 生成 SVG
    const svg = generateTypingSVG({
      lines,
      font,
      weight,
      color,
      background,
      size,
      center,
      vCenter,
      width,
      height,
      multiline,
      duration,
      pause,
      repeat,
      letterSpacing,
    });

    // 计算缓存时间：如果是随机台词，则不缓存；否则使用默认缓存时间
    const currentCacheSeconds = type === 'movie-quotes' ? 0 : CACHE_SECONDS;
    const cacheControl = currentCacheSeconds === 0
      ? 'no-store, max-age=0'
      : `public, max-age=${currentCacheSeconds}`;

    // 返回 SVG 响应
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    console.error('Error generating typing SVG:', error);
    const message = error instanceof Error ? error.message : 'Error generating typing SVG';
    return new NextResponse(message, { status: 500 });
  }
}
