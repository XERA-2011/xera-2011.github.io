"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function NameEditDialog({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && session?.user?.name) {
      setNewName(session.user.name)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        await update({ name: newName })
        setIsOpen(false)
      } else {
        const data = await response.json()
        alert(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存用户名失败', error)
      alert('保存失败，请稍后重试')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改昵称</DialogTitle>
          <DialogDescription>
            请输入新的昵称，长度 2-20 个字符。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="name">昵称</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新昵称"
            />
            <p className="text-xs text-muted-foreground">
              支持中文、字母、数字、下划线和减号。
            </p>
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
