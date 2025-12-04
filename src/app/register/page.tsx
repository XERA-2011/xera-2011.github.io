"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaUrl, setCaptchaUrl] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    captchaCode: '',
  })
  const [error, setError] = useState('')

  // 加载验证码
  const loadCaptcha = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/captcha', {
        headers: {
          'Cache-Control': 'no-cache'
        },
        signal
      })
      const id = response.headers.get('X-Captcha-Id')
      const svg = await response.text()

      if (id && svg) {
        // 先释放旧的 URL（在更新前）
        setCaptchaUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl)
          }
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          return URL.createObjectURL(blob)
        })
        setCaptchaId(id)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return
      }
      console.error('加载验证码失败:', err)
      setError('加载验证码失败，请刷新重试')
    }
  }, [])

  // 组件挂载时加载验证码
  useEffect(() => {
    const controller = new AbortController()
    loadCaptcha(controller.signal)

    // 组件卸载时清理
    return () => {
      controller.abort()
      setCaptchaUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl)
        }
        return ''
      })
    }
  }, [loadCaptcha])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/login?registered=true')
      } else {
        setError(data.message || '注册失败，请重试')
        loadCaptcha() // 重新加载验证码
      }
    } catch (err) {
      console.error('注册失败:', err)
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">注册账号</CardTitle>
          <CardDescription>创建一个新账号开始使用</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">昵称（可选）</Label>
              <Input
                id="name"
                type="text"
                placeholder="输入你的昵称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="至少6位密码"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha">验证码 *</Label>
              <div className="flex gap-2">
                <Input
                  id="captcha"
                  type="text"
                  placeholder="输入验证码"
                  value={formData.captchaCode}
                  onChange={(e) => setFormData({ ...formData, captchaCode: e.target.value })}
                  required
                  disabled={loading}
                  className="flex-1"
                />
                <div className="relative flex items-center gap-2">
                  {captchaUrl && (
                    <Image
                      src={captchaUrl}
                      alt="验证码"
                      width={120}
                      height={40}
                      unoptimized
                      className="h-10 rounded border border-gray-300 dark:border-gray-700"
                    />
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => loadCaptcha()}
                    disabled={loading}
                    title="刷新验证码"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              已有账号？{' '}
              <Link href="/login" className="text-primary hover:underline">
                立即登录
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
