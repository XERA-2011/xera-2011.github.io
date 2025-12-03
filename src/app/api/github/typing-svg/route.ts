import { NextRequest, NextResponse } from 'next/server';

// 缓存时间（秒）
const CACHE_SECONDS = 3600;

// 默认配置
const DEFAULTS = {
  font: 'monospace',
  weight: 'bold',
  color: '',
  background: '#00000000',
  size: '24',
  center: 'false',
  vCenter: 'true',
  width: '600',
  height: '100',
  multiline: 'false',
  duration: '5000',
  pause: '1000',
  repeat: 'true',
  separator: ';',
  letterSpacing: 'normal',
};

/**
 * 验证并返回布尔值
 */
function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

/**
 * 验证并返回正整数
 */
function parsePositiveInt(value: string, fieldName: string): number {
  const num = parseInt(value.replace(/[^0-9-]/g, ''), 10);
  if (num <= 0 || isNaN(num)) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return num;
}

/**
 * 验证并返回非负整数
 */
function parseNonNegativeInt(value: string, fieldName: string): number {
  const num = parseInt(value.replace(/[^0-9-]/g, ''), 10);
  if (num < 0 || isNaN(num)) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return num;
}

/**
 * 验证并返回颜色值
 */
function parseColor(value: string, defaultValue: string): string {
  const sanitized = value.replace(/[^0-9A-Fa-f]/g, '');
  if (![3, 4, 6, 8].includes(sanitized.length)) {
    return defaultValue;
  }
  return `#${sanitized}`;
}

/**
 * 验证并返回字体名称
 */
function parseFont(value: string): string {
  return value.replace(/[^0-9A-Za-z\- ]/g, '');
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 生成打字机效果的 SVG
 */
function generateTypingSVG(params: {
  lines: string[];
  font: string;
  weight: string;
  color?: string;
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
  speed?: number;
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
    speed,
  } = params;

  const lastLineIndex = lines.length - 1;

  // 如果没有提供颜色，使用 CSS 变量实现自适应颜色
  const cssStyle = !color ? `
    <style>
      .text-content { fill: #000000; }
      @media (prefers-color-scheme: dark) {
        .text-content { fill: #ffffff; }
      }
    </style>` : '';

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

  // 估算文字宽度 (Monospace 字体约为 0.6em 宽，这里给稍微宽裕一点 0.7)
  // 如果是多行模式，width 可能是容器宽度，我们需要让 path 适应文字宽度
  const charWidth = size * 0.7; 
  const estimatedTextWidth = line.length * charWidth;
  // 限制最大宽度不超过容器宽度，且至少保留 1 个字符宽度
  const textWidth = Math.max(size, Math.min(estimatedTextWidth, width));
  
  // 计算 path 的起始 X 坐标
  // 如果居中，path 起点 = (容器宽度 - 文字宽度) / 2
  // 如果不居中，path 起点 = 0
  const pathX = center ? (width - textWidth) / 2 : 0;

  const freeze = !repeat && i === lastLineIndex;
  const yOffset = height / 2;
  const emptyLine = `m${pathX},${yOffset} h0`;
  const fullLine = `m${pathX},${yOffset} h${textWidth}`;

  const values = [
    emptyLine,
    fullLine,
    fullLine,
    freeze ? fullLine : emptyLine,
  ].join(' ; ');

  // 计算当前行的打字时长
  // 如果有 speed 参数，则根据字符数计算时长
  // 否则使用固定的 duration
  const currentTypingDuration = speed 
    ? line.length * speed 
    : duration * 0.8; // 旧逻辑：duration 包含打字和删除，打字占 80%

  // 计算删除时长
  // 如果有 speed 参数，删除速度设为打字速度的一半（即快一倍），且不超过 1000ms
  // 否则使用旧逻辑：duration * 0.2
  const currentDeleteDuration = speed
    ? Math.min(currentTypingDuration * 0.5, 1000)
    : duration * 0.2;

  const totalDuration = currentTypingDuration + pause + currentDeleteDuration;
  
  const keyTimes = [
    '0',
    (currentTypingDuration / totalDuration).toFixed(4),
    ((currentTypingDuration + pause) / totalDuration).toFixed(4),
    '1',
  ].join(';');

  animationContent = `
  <path id='path${i}'>
    <animate id='d${i}' attributeName='d' begin='${begin}'
      dur='${totalDuration}ms' fill='${freeze ? 'freeze' : 'remove'}'
      values='${values}' keyTimes='${keyTimes}' />
  </path>
        <text font-family='"${font}", monospace' ${color ? `fill='${color}'` : 'class="text-content"'} font-size='${size}'
          dominant-baseline='${vCenter ? 'middle' : 'auto'}'
          x='0' text-anchor='start'
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
        
        // 同样应用宽度估算逻辑
        const charWidth = size * 0.7; 
        const estimatedTextWidth = line.length * charWidth;
        const textWidth = Math.max(size, Math.min(estimatedTextWidth, width));
        const pathX = center ? (width - textWidth) / 2 : 0;

        const emptyLine = `m${pathX},${yOffset} h0`;
        const fullLine = `m${pathX},${yOffset} h${textWidth}`;

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
        <text font-family='"${font}", monospace' ${color ? `fill='${color}'` : 'class="text-content"'} font-size='${size}'
          dominant-baseline='${vCenter ? 'middle' : 'auto'}'
          x='0' text-anchor='start'
          letter-spacing='${letterSpacing}' font-weight='${weight}'>
          <textPath xlink:href='#path${i}'>
            ${escapeHtml(line)}
          </textPath>
        </text>`;
      }

      return animationContent;
    })
    .join('\n');

  return `<!-- https://xera-2011.vercel.app/github/typing-svg -->
<svg xmlns='http://www.w3.org/2000/svg'
    xmlns:xlink='http://www.w3.org/1999/xlink'
    viewBox='0 0 ${width} ${height}'
    style='background-color: ${background};'
    width='${width}px' height='${height}px'>
    ${cssStyle}
    ${linesContent}
</svg>`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // 解析参数
    const linesParam = searchParams.get('lines') || '';
    const separator = searchParams.get('separator') || DEFAULTS.separator;

    // 验证 lines 参数
    if (!linesParam) {
      return new NextResponse('Lines parameter is required', { status: 400 });
    }

    // 分割并清理行
    const lines = linesParam.split(separator).map((line) => line.trim());

    // 解析其他参数
    const font = parseFont(searchParams.get('font') || DEFAULTS.font);
    const weight = searchParams.get('weight') || DEFAULTS.weight;
    const color = parseColor(
      searchParams.get('color') || '',
      ''
    ) || undefined;
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
    const height = parsePositiveInt(
      searchParams.get('height') || DEFAULTS.height,
      'Height'
    );
    const multiline = parseBoolean(
      searchParams.get('multiline') || DEFAULTS.multiline
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
    
    // 解析 speed 参数 (可选)
    const speedParam = searchParams.get('speed');
    const speed = speedParam ? parsePositiveInt(speedParam, 'Speed') : undefined;

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
      speed,
    });

    // 返回 SVG 响应
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error('Error generating typing SVG:', error);
    const message = error instanceof Error ? error.message : 'Error generating typing SVG';
    return new NextResponse(message, { status: 500 });
  }
}
