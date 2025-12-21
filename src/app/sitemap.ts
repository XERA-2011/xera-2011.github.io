import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {


  // 定义所有公开页面
  const routes = [
    // 主页
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },

    // 工具页面
    { url: '/tools', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/tools/base64', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/tools/coze', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/tools/gemini', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/tools/info-create', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/tools/life-calendar', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/tools/asset-allocation', priority: 0.7, changeFrequency: 'monthly' as const },

    // 生成工具页面
    { url: '/generate', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/generate/news', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/generate/pet-essays', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/generate/security-audit', priority: 0.7, changeFrequency: 'weekly' as const },

    // GitHub 相关页面
    { url: '/github', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/github/countdown', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/github/crypto-coin', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/github/icons', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/github/joke-card', priority: 0.6, changeFrequency: 'monthly' as const },

    // 法律文档
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  return routes.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
