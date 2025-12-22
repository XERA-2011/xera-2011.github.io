import { Metadata, Viewport } from "next";
import { BASE_URL } from "@/lib/constants";

export const siteViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "XERA-2011 - Pocket Universe",
    template: "%s | XERA-2011",
  },
  description: "Pocket Universe - 探索工具、实验项目和创意项目的个人空间",
  keywords: ["XERA-2011", "开发工具", "在线工具", "实验项目", "Web开发", "个人网站"],
  authors: [{ name: "XERA" }],
  creator: "XERA",
  publisher: "XERA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: ['en_US'],
    url: BASE_URL,
    siteName: 'XERA-2011',
    title: 'XERA-2011 - Pocket Universe',
    description: 'Pocket Universe - 探索工具、实验项目和创意项目的个人空间',
    images: [
      {
        url: '/favicon.ico',
        width: 48,
        height: 48,
        alt: 'XERA-2011 Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XERA-2011 - Pocket Universe',
    description: 'Pocket Universe - 探索工具、实验项目和创意项目的个人空间',
    creator: '@XERA',
    images: ['/favicon.ico'],
  },
  verification: {
    google: '7fda4c6923f8758a',
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
};
