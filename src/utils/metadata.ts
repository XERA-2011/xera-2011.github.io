import { Metadata } from 'next'

interface MetadataOptions {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

const baseUrl = 'https://xera-2011.vercel.app'
const defaultDescription = 'Pocket Universe - 探索工具、游戏和创意项目的个人空间'

/**
 * 生成页面 metadata 的工具函数（服务端组件使用）
 * @param options - metadata 配置选项
 * @returns Metadata 对象
 */
export function createMetadata(options: MetadataOptions | string): Metadata {
  // 兼容旧的函数签名
  if (typeof options === 'string') {
    options = { title: options }
  }

  const {
    title,
    description = defaultDescription,
    keywords = [],
    image = '/favicon.ico',
    url = '',
    type = 'website',
    noIndex = false,
  } = options

  const fullTitle = `${title} | XERA-2011`
  const fullUrl = `${baseUrl}${url}`
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return {
    title: fullTitle,
    description,
    keywords: ['XERA-2011', ...keywords],
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'XERA-2011',
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
      locale: 'zh_CN',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@XERA',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  }
}

