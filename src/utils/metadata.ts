import { Metadata } from 'next'

/**
 * 生成页面 metadata 的工具函数（服务端组件使用）
 * @param title - 页面标题
 * @param description - 页面描述（可选）
 */
export function createMetadata(title: string, description?: string): Metadata {
  return {
    title: `${title} - XERA-2011`,
    description: description || 'Pocket Universe',
  }
}
