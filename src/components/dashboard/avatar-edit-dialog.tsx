"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"

export function AvatarEditDialog({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [avatarSeed, setAvatarSeed] = useState('')
  const [avatarStyle, setAvatarStyle] = useState('identicon')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const avatarStyles = [
    { value: 'initials', label: '首字母 (简洁)' },
    { value: 'avataaars', label: '卡通人物 (个性)' },
    { value: 'bottts', label: '机器人 (可爱)' },
    { value: 'identicon', label: '几何图形 (抽象)' },
    { value: 'micah', label: '手绘风格 (艺术)' },
    { value: 'notionists', label: 'Notion 风格 (简约)' },
  ]

  const previewUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`

  // 监听头像参数变化，设置加载状态
  useEffect(() => {
    setIsLoadingPreview(true)
  }, [avatarSeed, avatarStyle])

  // 初始化 seed 和 style
  useEffect(() => {
    if (isOpen && session?.user?.image?.startsWith('https://api.dicebear.com/')) {
      try {
        const url = new URL(session.user.image)
        const pathParts = url.pathname.split('/')
        // URL 结构: /7.x/{style}/svg
        const style = pathParts[2]
        const seed = url.searchParams.get('seed')

        if (style && seed) {
          setAvatarStyle(style)
          setAvatarSeed(seed)
          return
        }
      } catch (e) {
        console.error('解析头像 URL 失败', e)
      }
    }

    if (isOpen && session?.user?.email) {
      setAvatarSeed(session.user.email)
    }
  }, [isOpen, session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: previewUrl }),
      })

      if (response.ok) {
        await update({ image: previewUrl })
        setIsOpen(false)
      }
    } catch (error) {
      console.error('保存头像失败', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改头像</DialogTitle>
          <DialogDescription>
            选择你喜欢的头像风格，或者输入字符生成独一无二的头像。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex justify-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              {isLoadingPreview && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <Image
                src={previewUrl}
                alt="预览"
                fill
                className="object-cover"
                unoptimized
                onLoad={() => setIsLoadingPreview(false)}
                onError={() => setIsLoadingPreview(false)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>头像风格</Label>
              <Select value={avatarStyle} onValueChange={setAvatarStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {avatarStyles.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>随机种子 (输入任意字符改变头像)</Label>
              <div className="flex gap-2">
                <Input
                  value={avatarSeed}
                  onChange={(e) => setAvatarSeed(e.target.value)}
                  placeholder="输入字符生成头像..."
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                  title="随机生成"
                  disabled={isLoadingPreview}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingPreview ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>取消</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
