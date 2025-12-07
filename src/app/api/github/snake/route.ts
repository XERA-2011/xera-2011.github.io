import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubContributions } from '@/components/github/snake/contributions';
import { userContributionToGrid } from '@/lib/snake/utils';
import { getBestRoute } from '@/lib/snake/solver/getBestRoute';
import { getPathToPose } from '@/lib/snake/solver/getPathToPose';
import { createSvg } from '@/lib/snake/svg-creator/create-svg';
import { createSnakeFromCells } from '@/lib/snake/types/snake';
import { Color } from '@/lib/snake/types/grid';

// --- 配置常量 ---
const CACHE_SECONDS = 3600;

// --- 类型定义 ---
type ThemeName = 'dark' | 'light';

const PALETTES = {
  light: {
    colorDots: {
      1: "#9be9a8",
      2: "#40c463",
      3: "#30a14e",
      4: "#216e39",
    } as Record<Color, string>,
    colorEmpty: "#ebedf0",
    colorDotBorder: "#1b1f230a",
    colorSnake: "purple",
    sizeCell: 16,
    sizeDot: 12,
    sizeDotBorderRadius: 2,
  },
  dark: {
    colorDots: {
      1: "#01311f",
      2: "#034525",
      3: "#0f6d31",
      4: "#00c647",
    } as Record<Color, string>,
    colorEmpty: "#161b22",
    colorDotBorder: "#1b1f230a",
    colorSnake: "purple",
    sizeCell: 16,
    sizeDot: 12,
    sizeDotBorderRadius: 2,
  }
};

// --- 主 API 路由处理函数 ---
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get('username');
  const themeName = (searchParams.get('theme') || 'dark') as ThemeName;

  if (!username) {
    const errorSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
        <rect width="400" height="100" fill="${themeName === 'dark' ? '#0d1117' : '#ffffff'}" />
        <text x="200" y="55" font-family="Arial" font-size="14" fill="${themeName === 'dark' ? '#ff7b72' : '#d73a49'}" text-anchor="middle">
          错误: 用户名是必需的
        </text>
      </svg>
    `;
    return new NextResponse(errorSvg, {
      status: 400,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }

  try {
    // 获取 GitHub 贡献数据
    const contributions = await fetchGitHubContributions(username);

    // 转换为网格
    const grid = userContributionToGrid(contributions);

    // 初始蛇的位置
    const snake = createSnakeFromCells([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);

    // 计算最佳路径
    const chain = getBestRoute(grid, snake)!;
    
    // 回到起点 (闭环)
    const returnPath = getPathToPose(chain.slice(-1)[0], snake);
    if (returnPath) {
        chain.push(...returnPath);
    }

    // 生成 SVG
    // 根据 theme 参数决定配色
    // 如果指定了 theme，则强制使用该主题（不包含媒体查询）
    // 这样可以确保在页面上切换主题时，SVG 会随之变化
    const options = {
        ...(themeName === 'dark' ? PALETTES.dark : PALETTES.light),
        // 如果需要支持系统自动切换，可以取消注释下面这行，但在当前需求下，用户显式选择了主题
        // dark: themeName === 'dark' ? undefined : PALETTES.dark 
    };

    const svgContent = createSvg(grid, contributions, chain, options, { stepDurationMs: 100 });

    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error(`Error for user ${username}:`, error);
    const message = error instanceof Error ? error.message : '生成贪吃蛇动画时出错';
    const status = message.includes('not found') ? 404 : 500;

    const errorSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100" viewBox="0 0 400 100">
        <rect width="400" height="100" fill="${themeName === 'dark' ? '#0d1117' : '#ffffff'}" />
        <text x="200" y="55" font-family="Arial" font-size="14" fill="${themeName === 'dark' ? '#ff7b72' : '#d73a49'}" text-anchor="middle">
          错误: ${message}
        </text>
      </svg>
    `;

    return new NextResponse(errorSvg, {
      status,
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' }
    });
  }
}