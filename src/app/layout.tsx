import type { Metadata, Viewport } from "next/types";
import '../styles/globals.css';
import Background from "@/components/background/star";
import Footer from "@/components/footer";
import Header from "@/components/header";
import UserAuth from "@/components/header/user-auth";
import SmoothScroll from "@/components/smooth-scroll";
import ElasticCursor from "@/components/ui/elastic-cursor";
import { AppProvider } from "@/contexts/AppContext";
import SessionProvider from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://xera-2011.vercel.app'),
  title: {
    default: "XERA-2011 - Pocket Universe",
    template: "%s | XERA-2011",
  },
  description: "Pocket Universe - 探索工具、游戏和创意项目的个人空间",
  keywords: ["XERA-2011", "开发工具", "在线工具", "游戏", "Web开发", "个人网站"],
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
    url: 'https://xera-2011.vercel.app',
    siteName: 'XERA-2011',
    title: 'XERA-2011 - Pocket Universe',
    description: 'Pocket Universe - 探索工具、游戏和创意项目的个人空间',
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
    description: 'Pocket Universe - 探索工具、游戏和创意项目的个人空间',
    creator: '@XERA',
    images: ['/favicon.ico'],
  },
  verification: {
    google: '7fda4c6923f8758a',
  },
  alternates: {
    canonical: 'https://xera-2011.vercel.app',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-selection" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className="antialiased theme-scrollbar"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <AppProvider>
              <SmoothScroll>
                <Background />
                <Header userAuth={<UserAuth />} />
                {children}
                <Footer />
                <ElasticCursor />
              </SmoothScroll>
            </AppProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
