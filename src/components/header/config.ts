export interface Link {
  title: string;
  href: string;
  target?: string;
  id?: string;       // 对应的 section id（用于首页锚点）
  offset?: number;   // 滚动触发位置（0-1 之间的百分比）
}

/**
 * 主导航链接（用于 Header 菜单）
 */
export const links: Link[] = [
  {
    title: 'Home',
    href: '/',
    id: 'hero',
    offset: 0.3,
  },
  {
    title: 'Games',
    href: '/games',
  },
  {
    title: 'Tools',
    href: '/tools',
  },
  {
    title: 'Generate',
    href: '/generate',
  },
];

/**
 * 获取首页 section 配置（用于滚动监听）
 */
export const getHomeSections = () =>
  links
    .filter(link => link.id)
    .map(({ id, offset }) => ({ id: id!, offset: offset || 0.3 }));

