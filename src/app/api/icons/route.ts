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
  } catch (error: any) {
    // 只在非文件不存在的错误时记录日志
    if (error.code !== 'ENOENT') {
      console.error(`Error reading icon ${iconName}:`, error);
    }
    return null;
  }
}

// 预定义的默认图标，当文件不存在时使用
const DEFAULT_ICONS: Record<string, string> = {
  ps: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
  react: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>`,
  vue: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.77.77-.77.77a5.4 5.4 0 0 0 7.65 7.65l.78-.77.78.77a5.4 5.4 0 0 0 7.65-7.65l-.77-.77.77-.77a5.4 5.4 0 0 0 0-7.65z"/><path d="M9.3 14.7l4.4-4.4"/><path d="M14.7 14.7l-4.4-4.4"/></svg>`,
  vite: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  vscode: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2m0 0H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2m0 0h4"/><path d="M12 18V6"/></svg>`,
  idea: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10c0 1.66-1.34 3-3 3h-2a3 3 0 0 1-3-3v-2a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v2a3 3 0 0 1-3 3A10 10 0 0 0 12 2z"/><path d="M12 12v8"/><path d="M12 8h.01"/></svg>`,
  git: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 14 6.9a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  discord: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.317 4.36a10.434 10.434 0 0 0-3.29-3.314A10.792 10.792 0 0 0 12 2a10.792 10.792 0 0 0-5.027 1.046A10.434 10.434 0 0 0 3.683 4.36C1.493 7.894 0 12.01 0 16.227c0 4.217 1.493 8.333 3.683 11.863a10.434 10.434 0 0 0 3.29 3.314A10.792 10.792 0 0 0 12 22a10.792 10.792 0 0 0 5.027-1.046 10.434 10.434 0 0 0 3.29-3.314C22.507 24.333 24 20.217 24 16.227c0-4.217-1.493-8.333-3.683-11.863z"/><path d="M9.545 15.027c-2.12 0-3.836-1.716-3.836-3.836 0-2.12 1.716-3.836 3.836-3.836 2.12 0 3.836 1.716 3.836 3.836 0 2.12-1.716 3.836-3.836 3.836z"/><path d="M14.455 15.027c-2.12 0-3.836-1.716-3.836-3.836 0-2.12 1.716-3.836 3.836-3.836 2.12 0 3.836 1.716 3.836 3.836 0 2.12-1.716 3.836-3.836 3.836z"/><path d="M12 19.273c-3.314 0-6-1.716-6-3.836 0-2.12 2.686-3.836 6-3.836 3.314 0 6 1.716 6 3.836 0 2.12-2.686 3.836-6 3.836z"/></svg>`,
};

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
      let svgContent = await readIcon(name);
      
      // 如果文件不存在，使用默认图标
      if (!svgContent) {
        svgContent = DEFAULT_ICONS[name] || DEFAULT_ICONS.git; // 默认使用 git 图标
      }
      
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
      const cleanedSvg = icon.svg.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/g, '$1');
      
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
  } catch (error) {
    console.error('Error generating icons:', error);
    return new NextResponse('Error generating icons', { status: 500 });
  }
}
