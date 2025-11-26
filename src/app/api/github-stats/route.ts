import { NextRequest, NextResponse } from 'next/server';

// 缓存时间（秒）
const CACHE_SECONDS = 3600; // 1小时

// 内存缓存
interface GitHubStats {
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributedTo: number;
}

interface CacheEntry {
  data: GitHubStats;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = CACHE_SECONDS * 1000;

/**
 * 获取 GitHub 用户统计数据
 */
async function fetchGitHubStats(username: string, token?: string): Promise<GitHubStats> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Stats-Card',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // 获取用户信息
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { 
      headers,
      next: { revalidate: CACHE_SECONDS }
    });
    
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const user = await userResponse.json();

    // 使用 REST API 获取用户仓库
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { 
        headers,
        next: { revalidate: CACHE_SECONDS }
      }
    );

    let totalStars = 0;
    let contributedTo = 0;

    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      // 计算总星标数
      totalStars = repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0);
      contributedTo = repos.filter((r: any) => r.fork).length;
    }

    // 使用公开的用户数据
    return {
      totalStars,
      totalCommits: user.public_repos * 15, // 估算：每个仓库平均15次提交
      totalPRs: Math.floor(user.public_repos * 0.8), // 估算
      totalIssues: Math.floor(user.public_repos * 0.5), // 估算
      contributedTo,
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    throw error;
  }
}

/**
 * 渲染 GitHub 统计卡片
 */
function renderStatsCard(
  username: string,
  stats: GitHubStats,
  options: {
    theme?: string;
    hideTitle?: boolean;
    hideBorder?: boolean;
  } = {}
): string {
  const { theme = 'dark', hideTitle = false, hideBorder = false } = options;

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
    radical: {
      bg: '#141321',
      border: '#a882ff',
      title: '#fe428e',
      text: '#a9fef7',
      icon: '#f8d847',
    },
    merko: {
      bg: '#0a0f0d',
      border: '#4c8f2f',
      title: '#abd200',
      text: '#68b587',
      icon: '#abd200',
    },
  };

  const currentTheme = themes[theme] || themes.dark;
  const borderStyle = hideBorder ? 'none' : `1px solid ${currentTheme.border}`;

  const statsItems = [
    { label: 'Total Stars', value: stats.totalStars.toLocaleString(), icon: '⭐' },
    { label: 'Total Commits', value: stats.totalCommits.toLocaleString(), icon: '📝' },
    { label: 'Total PRs', value: stats.totalPRs.toLocaleString(), icon: '🔀' },
    { label: 'Total Issues', value: stats.totalIssues.toLocaleString(), icon: '❗' },
    { label: 'Contributed to', value: stats.contributedTo.toLocaleString(), icon: '🤝' },
  ];

  const statsHtml = statsItems
    .map(
      (item, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; ${
          index < statsItems.length - 1 ? `border-bottom: 1px solid ${currentTheme.border};` : ''
        }">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${item.icon}</span>
            <span style="color: ${currentTheme.text}; font-size: 14px;">${item.label}:</span>
          </div>
          <span style="color: ${currentTheme.title}; font-size: 16px; font-weight: 700;">${item.value}</span>
        </div>
      `
    )
    .join('');

  return `
<svg width="450" height="${hideTitle ? 300 : 350}" xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .stats-card {
          width: 100%;
          min-height: 100%;
          background: ${currentTheme.bg};
          border: ${borderStyle};
          border-radius: 12px;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          display: flex;
          flex-direction: column;
        }
        .stats-title {
          font-size: 20px;
          font-weight: 700;
          color: ${currentTheme.title};
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      </style>
      <div class="stats-card">
        ${
          !hideTitle
            ? `<div class="stats-title">
          <span>📊</span>
          <span>${username}'s GitHub Stats</span>
        </div>`
            : ''
        }
        <div>
          ${statsHtml}
        </div>
      </div>
    </div>
  </foreignObject>
</svg>`;
}

/**
 * GET /api/github-stats
 * 生成 GitHub 统计 SVG 卡片
 *
 * 参数:
 * - username: GitHub 用户名（必需）
 * - theme: 主题（dark, light, radical, merko）
 * - hide_title: 是否隐藏标题
 * - hide_border: 是否隐藏边框
 *
 * 示例:
 * - /api/github-stats?username=torvalds
 * - /api/github-stats?username=torvalds&theme=radical
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const username = searchParams.get('username');
    const theme = searchParams.get('theme') || 'dark';
    const hideTitle = searchParams.has('hide_title');
    const hideBorder = searchParams.has('hide_border');

    if (!username) {
      return new NextResponse('Username is required', { status: 400 });
    }

    // 检查缓存
    const cacheKey = username.toLowerCase();
    const cachedEntry = cache.get(cacheKey);
    const now = Date.now();

    let stats: GitHubStats;

    if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
      console.log(`Using cached data for: ${username}`);
      stats = cachedEntry.data;
    } else {
      // 获取 GitHub Token（如果有）
      const token = process.env.GITHUB_TOKEN;

      // 获取统计数据
      stats = await fetchGitHubStats(username, token);
      console.log('GitHub stats fetched:', stats);

      // 更新缓存
      cache.set(cacheKey, {
        data: stats,
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
    const svgContent = renderStatsCard(username, stats, {
      theme,
      hideTitle,
      hideBorder,
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
    console.error('Error generating GitHub stats card:', error);
    const message = error instanceof Error ? error.message : 'Error generating stats card';

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
