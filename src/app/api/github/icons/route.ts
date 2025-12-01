import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// --- 配置 ---
const ICONS_DIR = path.join(process.cwd(), 'src', 'assets', 'icons');
const CACHE_SECONDS = 3600; // 1小时
const DEFAULT_ICON_SIZE = 48;
const ICON_SPACING = 8;
const ICONS_PER_ROW = 10; // 每行显示的图标数量

// --- 缓存模块 ---
interface CacheEntry {
  svg: string;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();

// --- 文件系统模块 ---
let iconFileMap: Map<string, string> | null = null;

// 图标别名映射 - 支持简短名称
const ICON_ALIASES: Record<string, string> = {
  // Adobe 系列
  'ps': 'photoshop',
  'ai': 'illustrator',
  'pr': 'premiere',
  'ae': 'aftereffects',
  // 编程语言
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'go': 'golang',
  'c++': 'cpp',
  'c#': 'cs',
  'rs': 'rust',
  // 前端框架 & 库
  'vue': 'vuejs',
  'reactjs': 'react',
  'next': 'nextjs',
  'nuxt': 'nuxtjs',
  'solid': 'solidjs',
  'angularjs': 'angular',
  'three': 'threejs',
  'mui': 'materialui',
  'styled': 'styledcomponents',
  'tailwind': 'tailwindcss',
  // Node.js 生态
  'node': 'nodejs',
  'express': 'expressjs',
  'nest': 'nestjs',
  'discord.js': 'discordjs',
  // 数据库
  'postgres': 'postgresql',
  'mongo': 'mongodb',
  // 开发工具
  'vs': 'visualstudio',
  'as': 'androidstudio',
  'nvim': 'neovim',
  // 云服务 & 运维
  'k8s': 'kubernetes',
  'kube': 'kubernetes',
  // 其他
  'tf': 'tensorflow',
  'sklearn': 'scikitlearn',
  'gh': 'github',
  'fb': 'firebase',
  'so': 'stackoverflow',
};

async function initializeIconFileMap() {
  if (iconFileMap) return;
  try {
    const files = await fs.readdir(ICONS_DIR);
    iconFileMap = new Map();
    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.svg') {
        const iconName = path.basename(file, '.svg').toLowerCase();
        iconFileMap.set(iconName, file);
      }
    }
  } catch (error) {
    console.error('Failed to initialize icon file map:', error);
    iconFileMap = new Map();
  }
}

initializeIconFileMap();

// --- SVG 处理模块 ---

/**
 * 使用正则表达式提取 SVG 的 viewBox 和内部内容。
 * @param svgString - 完整的 SVG 字符串。
 * @returns 包含 viewBox 和 innerContent 的对象，如果解析失败则返回 null。
 */
function parseSvgWithRegex(svgString: string): { viewBox: string; innerContent: string } | null {
  // 1. 提取 <svg> 标签内的所有内容（非贪婪模式）
  const contentMatch = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  if (!contentMatch || typeof contentMatch[1] !== 'string') {
    return null; // 无法解析 SVG 内容
  }
  const innerContent = contentMatch[1];

  // 2. 从开头的 <svg> 标签中提取 viewBox 属性
  const viewBoxMatch = svgString.match(/<svg[^>]*viewBox="([^"]*)"/i);
  // 如果找不到 viewBox，则创建一个默认值，以确保图标可以显示
  const viewBox = viewBoxMatch && viewBoxMatch[1] ? viewBoxMatch[1] : `0 0 ${DEFAULT_ICON_SIZE} ${DEFAULT_ICON_SIZE}`;

  return { viewBox, innerContent };
}


/**
 * 将多个 SVG 图标组合成一个多行排列的 SVG 雪碧图。
 * @param svgs - 包含名称和 SVG 内容的对象数组。
 * @param iconSize - 每个图标的尺寸。
 * @returns 组合后的 SVG 字符串。
 */
function combineSvgs(svgs: { name: string; svg: string }[], iconSize: number): string {
  const totalIcons = svgs.length;
  if (totalIcons === 0) return '';

  // 计算行数和列数
  const iconsPerRow = Math.min(ICONS_PER_ROW, totalIcons);
  const rows = Math.ceil(totalIcons / iconsPerRow);

  // 计算总宽度和总高度
  const totalWidth = iconsPerRow * iconSize + (iconsPerRow - 1) * ICON_SPACING;
  const totalHeight = rows * iconSize + (rows - 1) * ICON_SPACING;

  const svgElements = svgs.map((item, index) => {
    if (!item.svg) return '';

    const parsed = parseSvgWithRegex(item.svg);
    if (!parsed) {
      console.error(`Error parsing SVG for icon "${item.name}" with regex.`);
      return '';
    }

    const { viewBox, innerContent } = parsed;
    
    // 计算当前图标在网格中的位置
    const row = Math.floor(index / iconsPerRow);
    const col = index % iconsPerRow;
    const x = col * (iconSize + ICON_SPACING);
    const y = row * (iconSize + ICON_SPACING);

    // 使用 <svg> 嵌套，以利用其独立的 viewBox 和 preserveAspectRatio 属性，实现更好的缩放
    return `<svg x="${x}" y="${y}" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${innerContent}</svg>`;
  }).join('');

  return `<svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">${svgElements}</svg>`;
}

/**
 * 智能查找图标文件
 * 支持别名、自动忽略 -Dark/-Light 后缀
 */
function findIconFile(iconName: string): string | null {
  if (!iconFileMap) return null;

  let searchName = iconName.toLowerCase();

  // 1. 尝试移除 -dark/-light 后缀 (兼容旧 API 调用)
  searchName = searchName.replace(/-dark$/i, '').replace(/-light$/i, '');

  // 2. 检查别名
  if (ICON_ALIASES[searchName]) {
    searchName = ICON_ALIASES[searchName];
  }

  // 3. 精确匹配
  if (iconFileMap.has(searchName)) {
    return iconFileMap.get(searchName)!;
  }

  // 4. 模糊匹配：查找包含该名称的图标
  for (const [key, fileName] of iconFileMap.entries()) {
    if (key.startsWith(searchName)) {
      return fileName;
    }
  }

  return null;
}

async function readIcon(iconName: string): Promise<string | null> {
    const lowerCaseName = iconName.toLowerCase();
    const now = Date.now();

    const cached = cache.get(lowerCaseName);
    if (cached && now - cached.timestamp < CACHE_SECONDS * 1000) {
      return cached.svg;
    }

    if (!iconFileMap) {
      await initializeIconFileMap();
    }

    const actualFileName = findIconFile(iconName);
    if (!actualFileName) {
      console.warn(`Icon not found: ${iconName}`);
      return null;
    }

    try {
      const svgPath = path.join(ICONS_DIR, actualFileName);
      const svgContent = await fs.readFile(svgPath, 'utf-8');

      cache.set(lowerCaseName, { svg: svgContent, timestamp: now });

      return svgContent;
    } catch (error) {
      console.error(`Error reading icon file ${actualFileName}:`, error);
      return null;
    }
}

// --- API 路由处理 ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const iconsParam = searchParams.get('i') || '';
    const iconSize = parseInt(searchParams.get('s') || `${DEFAULT_ICON_SIZE}`, 10);

    const iconNames = iconsParam.split(',').map(name => name.trim()).filter(Boolean);

    if (iconNames.length === 0) {
      return new NextResponse('No icons specified. Use the "i" query parameter (e.g., ?i=react,vue).', { status: 400 });
    }

    const icons = await Promise.all(
      iconNames.map(async (name) => ({
        name,
        svg: await readIcon(name),
      }))
    );

    const validIcons = icons.filter((icon): icon is { name: string; svg: string } => icon.svg !== null);

    if (validIcons.length === 0) {
      return new NextResponse(`None of the specified icons could be found: ${iconNames.join(', ')}`, { status: 404 });
    }

    const combinedSvg = combineSvgs(validIcons, iconSize);

    return new NextResponse(combinedSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error('Unexpected error in icons API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
