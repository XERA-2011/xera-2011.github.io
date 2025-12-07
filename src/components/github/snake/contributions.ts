// components/github/snake/contributions.ts
import { GitHubContributionDay, GitHubContributionResponseData } from './types';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

// 定义 GraphQL 错误类型
type GraphQLError = {
  message: string;
  type?: string;
  path?: string[];
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

/**
 * 获取 GitHub 用户贡献数据
 */
export async function fetchGitHubContributions(username: string): Promise<GitHubContributionDay[]> {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN 环境变量未设置');
  }

  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                date
                weekday
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { login: username }
    }),
    next: { revalidate: 3600 } // 缓存1小时
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API 请求失败: ${response.status} - ${errorText}`);
  }

  const result: GraphQLResponse<GitHubContributionResponseData> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const error = result.errors[0];
    if (error.type === 'NOT_FOUND') {
      throw new Error(`用户 '${username}' 不存在`);
    }
    throw new Error(error.message || '获取 GitHub 贡献数据时出错');
  }

  // 处理贡献数据，将其转换为网格格式
  const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

  return weeks.flatMap((week, x) =>
    week.contributionDays.map(day => ({
      x,
      y: day.weekday,
      date: day.date,
      count: day.contributionCount,
      level:
        (day.contributionLevel === "FOURTH_QUARTILE" && 4) ||
        (day.contributionLevel === "THIRD_QUARTILE" && 3) ||
        (day.contributionLevel === "SECOND_QUARTILE" && 2) ||
        (day.contributionLevel === "FIRST_QUARTILE" && 1) ||
        0,
    }))
  );
}