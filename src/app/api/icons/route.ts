import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 图标目录路径
const ICONS_DIR = path.join(process.cwd(), 'src', 'assets', 'icons');

// 缓存设置
// 1小时缓存
const CACHE_SECONDS = 3600;
const cache = new Map<string, { svg: string; timestamp: number }>();

// 读取单个图标文件
async function readIcon(iconName: string): Promise<string | null> {
  const cacheKey = iconName;
  const now = Date.now();
  
  // 检查缓存
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_SECONDS * 1000) {
      return cached.svg;
    }
  }
  
  try {
    // 尝试读取 SVG 文件
    const svgPath = path.join(ICONS_DIR, `${iconName}.svg`);
    const svgContent = await fs.readFile(svgPath, 'utf-8');
    
    // 更新缓存
    cache.set(cacheKey, { svg: svgContent, timestamp: now });
    
    return svgContent;
  } catch (error: unknown) {
    // 只在非文件不存在的错误时记录日志
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string };
      if (err.code !== 'ENOENT') {
        console.error(`Error reading icon ${iconName}:`, err);
      }
    } else {
      // 不是标准的 ErrnoException，仍然记录日志以便排查
      console.error(`Error reading icon ${iconName}:`, error);
    }
    return null;
  }
}

// GET 请求处理函数
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const iconsParam = searchParams.get('i') || '';
    
    // 解析图标列表
    const iconNames = iconsParam.split(',').map(name => name.trim()).filter(Boolean);
    
    if (iconNames.length === 0) {
      return new NextResponse('No icons specified', { status: 400 });
    }
    
    // 读取所有图标
    const iconPromises = iconNames.map(async (name) => {
      // 先尝试从文件系统读取
      const svgContent = await readIcon(name);
      
      
      return { name, svg: svgContent };
    });
    
    const icons = await Promise.all(iconPromises);
    
    // 生成 SVG 响应
    // 示例：水平排列所有图标
    const svgWidth = icons.length * 32; // 每个图标32px宽度
    const svgHeight = 32; // 高度32px
    
    // 处理图标 SVG，确保它们正确显示
    const iconsSvg = icons.map((icon, index) => {
      const x = index * 32;
      
      // 直接使用图标内容，不嵌套额外的 g 标签
      // 移除外部 svg 标签，只保留内部内容
      const cleanedSvg = icon.svg?.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/g, '$1');
      
      return `<g transform="translate(${x}, 0) scale(0.8) translate(4, 4)">
        ${cleanedSvg}
      </g>`;
    }).join('');
    
    // 设置默认样式，确保图标可见
    // 使用具体颜色而不是 currentColor，因为 currentColor 在 img 标签中无法继承
    const svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconsSvg}
    </svg>`;
    
    // 返回 SVG 响应
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating icons:', error);
    return new NextResponse('Error generating icons', { status: 500 });
  }
}
