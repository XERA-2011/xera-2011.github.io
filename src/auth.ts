import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("邮箱和密码不能为空");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("邮箱或密码错误");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("邮箱或密码错误");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
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
    async signIn() {
      // 允许登录
      return true
    },
    async redirect({ url, baseUrl }) {
      // 如果 url 是相对路径，直接返回
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // 如果 url 是同域名的完整 URL，返回
      else if (new URL(url).origin === baseUrl) return url
      // 否则返回 baseUrl
      return baseUrl
    },
    async jwt({ token, user, trigger, session }) {
      // 首次登录时，将用户信息保存到 token
      if (user) {
        token.id = user.id
      }

      // 处理客户端更新 session
      if (trigger === "update" && session) {
        if (session.image) token.picture = session.image
        if (session.name) token.name = session.name
      }
      
      return token
    },
    async session({ session, token }) {
      // 将 token 中的用户 ID 添加到 session
      if (token && session.user) {
        session.user.id = token.id as string

        const adminsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || ""
        const adminList = adminsEnv
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)

        const email = session.user.email?.toLowerCase()
        session.user.isAdmin = !!email && adminList.includes(email)
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // 使用 JWT 以兼容 Edge Runtime middleware
  },
})
