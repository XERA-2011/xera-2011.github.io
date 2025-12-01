import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// --- 配置 ---
const ICONS_DIR = path.join(process.cwd(), 'src', 'assets', 'icons');
const CACHE_SECONDS = 3600; // 1小时
const DEFAULT_ICON_SIZE = 48;
const ICON_SPACING = 8;

// --- 缓存模块 ---
interface CacheEntry {
  svg: string;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();

// --- 文件系统模块 ---
let iconFileMap: Map<string, string> | null = null;

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
 * 将多个 SVG 图标组合成一个水平排列的 SVG 雪碧图。
 * @param svgs - 包含名称和 SVG 内容的对象数组。
 * @param iconSize - 每个图标的尺寸。
 * @returns 组合后的 SVG 字符串。
 */
function combineSvgs(svgs: { name: string; svg: string }[], iconSize: number): string {
  const totalIcons = svgs.length;
  if (totalIcons === 0) return '';

  const totalWidth = totalIcons * iconSize + (totalIcons - 1) * ICON_SPACING;

  const svgElements = svgs.map((item, index) => {
    if (!item.svg) return '';

    const parsed = parseSvgWithRegex(item.svg);
    if (!parsed) {
      console.error(`Error parsing SVG for icon "${item.name}" with regex.`);
      return '';
    }

    const { viewBox, innerContent } = parsed;
    const x = index * (iconSize + ICON_SPACING);

    // 使用 <svg> 嵌套，以利用其独立的 viewBox 和 preserveAspectRatio 属性，实现更好的缩放
    return `<svg x="${x}" y="0" width="${iconSize}" height="${iconSize}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${innerContent}</svg>`;
  }).join('');

  return `<svg width="${totalWidth}" height="${iconSize}" viewBox="0 0 ${totalWidth} ${iconSize}" xmlns="http://www.w3.org/2000/svg">${svgElements}</svg>`;
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
    
    const actualFileName = iconFileMap!.get(lowerCaseName);
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

    const iconNames = decodeURIComponent(iconsParam).split(',').map(name => name.trim()).filter(Boolean);

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
