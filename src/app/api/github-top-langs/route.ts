import { NextRequest, NextResponse } from 'next/server';
import {
  LanguageItem,
  renderVerticalLayout, 
  renderHorizontalLayout, 
  renderDonutLayout, 
  renderCloudLayout, 
  renderErrorCard 
} from '@/components/github-top-langs';

// --- 配置常量 ---
const CACHE_SECONDS = 3600;
const LANGS_COUNT = 6; // 固定语言数量为6，不再接受URL参数

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  Go: '#00ADD8', Rust: '#dea584', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
  PHP: '#4F5D95', Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', Shell: '#89e051', 'Objective-C': '#438eff',
  Scala: '#c22d40',
};

const THEME_CONFIG = {
  dark: { bg: '#0d1117', border: '#30363d', title: '#58a6ff', text: '#c9d1d9', progressBg: '#21262d' },
  light: { bg: '#ffffff', border: '#e1e4e8', title: '#24292e', text: '#586069', progressBg: '#eaecef' },
};

// --- 类型定义 ---
type LanguageStats = Record<string, number>;
type ThemeName = keyof typeof THEME_CONFIG;


// --- 核心数据获取函数 ---
async function fetchLanguageStats(username: string): Promise<LanguageStats> {
  const headers: HeadersInit = {
    'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const query = `
    query userInfo($login: String!) {
      user(login: $login) {
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          nodes {
            name
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges { size, node { color, name } }
            }
          }
        }
      }
    }
  `;
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers, body: JSON.stringify({ query, variables: { login: username } }),
    next: { revalidate: CACHE_SECONDS },
  });
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
  const result = await response.json();
  if (result.errors) {
    const error = result.errors[0];
    if (error.type === 'NOT_FOUND') throw new Error(`User '${username}' not found`);
    throw new Error(error.message || 'Error fetching from GitHub GraphQL API');
  }
  const languageStats: LanguageStats = {};
  const repos = result.data?.user?.repositories?.nodes;
  if (!repos) return {};
  for (const repo of repos) {
    if (!repo.languages?.edges) continue;
    for (const edge of repo.languages.edges) {
      const lang = edge.node.name;
      if (!LANGUAGE_COLORS[lang]) {
        LANGUAGE_COLORS[lang] = edge.node.color || '#858585';
      }
      languageStats[lang] = (languageStats[lang] || 0) + edge.size;
    }
  }
  return languageStats;
}

// --- 数据处理与SVG渲染函数 ---
function prepareLanguageData(stats: LanguageStats): LanguageItem[] {
  const total = Object.values(stats).reduce((s, b) => s + b, 0);
  if (total === 0) return [];
  return Object.entries(stats).sort(([, a], [, b]) => b - a).slice(0, LANGS_COUNT)
    .map(([lang, bytes]) => ({
      name: lang, bytes, percentage: ((bytes / total) * 100).toFixed(1),
      color: LANGUAGE_COLORS[lang] || '#858585',
    }));
}

// --- 主 API 路由处理函数 ---
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get('username');
  const themeName = (searchParams.get('theme') || 'dark') as ThemeName;
  const hideBorder = searchParams.has('hide_border');
  const layout = searchParams.get('layout') || 'vertical';
  const theme = THEME_CONFIG[themeName] || THEME_CONFIG.dark;
  
  if (!username) {
    const svg = renderErrorCard('Username is required', theme);
    return new NextResponse(svg, { status: 400, headers: { 'Content-Type': 'image/svg+xml' } });
  }

  try {
    const languageStats = await fetchLanguageStats(username);
    const languages = prepareLanguageData(languageStats);

    if (languages.length === 0) {
      const svg = renderErrorCard('No language data available for this user', theme);
      return new NextResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
    }

    let svgContent: string;
    switch (layout) {
      case 'horizontal': svgContent = renderHorizontalLayout(languages, theme, hideBorder); break;
      case 'donut': svgContent = renderDonutLayout(languages, theme, hideBorder); break;
      case 'cloud': svgContent = renderCloudLayout(languages, theme, hideBorder); break;
      default: svgContent = renderVerticalLayout(languages, theme, hideBorder); break;
    }

    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error(`Error for user ${username}:`, error);
    const message = error instanceof Error ? error.message : 'Error generating card';
    const status = message.includes('not found') ? 404 : 500;
    const svg = renderErrorCard(message, theme);
    return new NextResponse(svg, { status, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' } });
  }
}
