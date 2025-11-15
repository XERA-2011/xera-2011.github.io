import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnLogin = nextUrl.pathname.startsWith('/login')
      
      // 如果访问 dashboard，必须登录
      if (isOnDashboard) {
        return isLoggedIn
      }
      
      // 如果已登录且访问登录页，重定向到 dashboard
      if (isOnLogin && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      
      // 其他页面都允许访问
      return true
    },
  },
  providers: [], // 在 middleware 中不需要 providers
} satisfies NextAuthConfig
