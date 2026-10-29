import { useEffect } from 'react'

/**
 * 客户端动态设置页面 title 的 hook
 * @param title - 页面标题
 * @param suffix - 标题后缀，默认为 "xerafun"
 */
export function usePageTitle(title: string, suffix = 'xerafun') {
  useEffect(() => {
    document.title = suffix ? `${title} ｜ ${suffix}` : title
  }, [title, suffix])
}
