/**
 * API 工具函数
 * 处理不同环境下的 API 地址
 */

/**
 * 判断是否在 GitHub Pages 环境
 */
export const isGitHubPages = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.github.io');
};

/**
 * 获取 API 的完整 URL
 * @param endpoint - API 端点路径（如 '/api/joke'）
 * @param fallbackDomain - GitHub Pages 环境下的备用域名（默认为 'https://xera-2011.vercel.app'）
 * @returns 完整的 API URL
 */
export const getApiUrl = (
  endpoint: string,
  fallbackDomain: string = 'https://xera-2011.vercel.app'
): string => {
  if (isGitHubPages()) {
    return `${fallbackDomain}${endpoint}`;
  }
  return endpoint;
};
