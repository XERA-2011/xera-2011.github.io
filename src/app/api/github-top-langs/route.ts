import { NextRequest, NextResponse } from 'next/server';

// 缓存时间（秒）
const CACHE_SECONDS = 3600; // 1小时

// 内存缓存
interface LanguageStats {
  [language: string]: number;
}

interface CacheEntry {
  data: LanguageStats;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = CACHE_SECONDS * 1000;

/**
 * 获取 GitHub 用户的语言统计
 */
async function fetchLanguageStats(username: string, token?: string): Promise<LanguageStats> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Top-Langs-Card',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // 获取用户仓库
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { 
        headers,
        next: { revalidate: CACHE_SECONDS }
      }
    );

    if (!reposResponse.ok) {
      if (reposResponse.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`GitHub API error: ${reposResponse.status}`);
    }

    const repos = await reposResponse.json();

    // 统计语言使用情况
    const languageStats: LanguageStats = {};

    for (const repo of repos) {
      if (repo.fork) continue; // 跳过 fork 的仓库

      // 获取仓库的语言统计
      const langResponse = await fetch(repo.languages_url, { headers });
      
      if (langResponse.ok) {
        const languages = await langResponse.json();
        
        for (const [lang, bytes] of Object.entries(languages)) {
          languageStats[lang] = (languageStats[lang] || 0) + (bytes as number);
        }
      }
    }

    return languageStats;
  } catch (error) {
    throw error;
  }
}

/**
 * 渲染语言统计卡片
 */
function renderLanguageCard(
  languageStats: LanguageStats,
  options: {
    theme?: string;
    hideBorder?: boolean;
    langs_count?: number;
  } = {}
): string {
  const { 
    theme = 'dark', 
    hideBorder = false,
    langs_count = 5
  } = options;

  // 主题配置
  const themes: Record<string, { bg: string; border: string; title: string; text: string; icon: string }> = {
    dark: {
      bg: '#0d1117',
      border: '#30363d',
      title: '#58a6ff',
      text: '#c9d1d9',
      icon: '#58a6ff',
    },
    light: {
      bg: '#ffffff',
      border: '#d0d7de',
      title: '#0969da',
      text: '#24292f',
      icon: '#0969da',
    },
  };

  const currentTheme = themes[theme] || themes.dark;
  const borderStyle = hideBorder ? 'none' : `1px solid ${currentTheme.border}`;

  // 语言颜色映射
  const languageColors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Shell: '#89e051',
    'Objective-C': '#438eff',
    'Scala': '#c22d40',
  };

  // 计算总字节数和百分比
  const totalBytes = Object.values(languageStats).reduce((sum, bytes) => sum + bytes, 0);
  
  // 如果没有数据，返回提示
  if (totalBytes === 0 || Object.keys(languageStats).length === 0) {
    return `
<svg width="400" height="280" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="280" fill="${currentTheme.bg}" rx="12" ${hideBorder ? '' : `stroke="${currentTheme.border}" stroke-width="1"`}/>
  <text x="200" y="140" font-family="Arial, sans-serif" font-size="14" fill="${currentTheme.text}" text-anchor="middle">No language data available</text>
</svg>`;
  }
  
  // 排序并取前 N 个语言
  const sortedLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, langs_count)
    .map(([lang, bytes]) => ({
      name: lang,
      bytes,
      percentage: ((bytes / totalBytes) * 100).toFixed(1),
      color: languageColors[lang] || '#858585',
    }));

  // 计算进度条的 x 位置
  let currentX = 0;
  const progressBars = sortedLanguages.map((lang) => {
    const width = (parseFloat(lang.percentage) / 100) * 360; // 360 是进度条的总宽度
    const bar = `<rect x="${currentX}" y="0" width="${width}" height="10" fill="${lang.color}" rx="0"/>`;
    currentX += width;
    return bar;
  }).join('');

  // 语言列表（两列布局）
  let yOffset = 80; // 标题 + 进度条 + 间距
  const languageItems = sortedLanguages.map((lang, index) => {
    const col = index % 2; // 0 或 1
    const row = Math.floor(index / 2);
    const x = col === 0 ? 20 : 210; // 左列或右列
    const y = yOffset + row * 30;

    return `
      <circle cx="${x}" cy="${y}" r="5" fill="${lang.color}"/>
      <text x="${x + 12}" y="${y + 4}" font-family="Arial, sans-serif" font-size="12" fill="${currentTheme.text}">${lang.name}</text>
      <text x="${x + 170}" y="${y + 4}" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="${currentTheme.text}" text-anchor="end">${lang.percentage}%</text>
    `;
  }).join('');

  return `
<svg width="400" height="170" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="400" height="170" fill="${currentTheme.bg}" rx="12" ${hideBorder ? '' : `stroke="${currentTheme.border}" stroke-width="1"`} />
  
  <!-- 标题 -->
  <text x="20" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${currentTheme.title}">Top Languages</text>
  
  <!-- 进度条背景 -->
  <rect x="20" y="50" width="360" height="10" fill="${currentTheme.border}" rx="5"/>
  
  <!-- 进度条 -->
  <g transform="translate(20, 50)">
    ${progressBars}
  </g>
  
  <!-- 语言列表 -->
  ${languageItems}
</svg>`;
}

/**
 * GET /api/github-top-langs
 * 生成 GitHub 语言统计 SVG 卡片
 *
 * 参数:
 * - username: GitHub 用户名（必需）
 * - theme: 主题（dark, light）
 * - langs_count: 显示语言数量（默认 6）
 * - hide_border: 是否隐藏边框
 *
 * 示例:
 * - /api/github-top-langs?username=XERA-2011
 * - /api/github-top-langs?username=XERA-2011&theme=light
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const username = searchParams.get('username');
    const theme = searchParams.get('theme') || 'dark';
    const langs_count = parseInt(searchParams.get('langs_count') || '6');
    const hideBorder = searchParams.has('hide_border');

    if (!username) {
      return new NextResponse('Username is required', { status: 400 });
    }

    // 检查缓存
    const cacheKey = username.toLowerCase();
    const cachedEntry = cache.get(cacheKey);
    const now = Date.now();

    let languageStats: LanguageStats;

    if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
      languageStats = cachedEntry.data;
    } else {
      // 获取 GitHub Token（如果有）
      const token = process.env.GITHUB_TOKEN;

      // 获取语言统计
      languageStats = await fetchLanguageStats(username, token);

      // 更新缓存
      cache.set(cacheKey, {
        data: languageStats,
        timestamp: now,
      });

      // 清理过期缓存
      for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION * 2) {
          cache.delete(key);
        }
      }
    }

    // 生成 SVG
    const svgContent = renderLanguageCard(languageStats, {
      theme,
      hideBorder,
      langs_count,
    });

    // 返回 SVG 响应
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generating language card';

    // 返回错误 SVG
    const errorSvg = `
<svg width="450" height="260" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d1117" rx="12"/>
  <text x="225" y="130" font-family="Arial" font-size="14" fill="#ef4444" text-anchor="middle">${message}</text>
</svg>`;

    return new NextResponse(errorSvg, {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
