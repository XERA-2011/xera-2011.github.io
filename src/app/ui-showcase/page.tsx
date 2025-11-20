"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function UIShowcase() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">shadcn/ui 黑白主题展示</h1>
            <p className="text-muted-foreground">纯黑白风格的 UI 组件库</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>按钮组件</CardTitle>
            <CardDescription>不同变体的按钮样式</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>默认按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="destructive">危险按钮</Button>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>卡片标题 1</CardTitle>
              <CardDescription>这是卡片的描述文字</CardDescription>
            </CardHeader>
            <CardContent>
              <p>卡片内容区域，展示主要信息。</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">操作</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>卡片标题 2</CardTitle>
              <CardDescription>这是卡片的描述文字</CardDescription>
            </CardHeader>
            <CardContent>
              <p>卡片内容区域，展示主要信息。</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">操作</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>卡片标题 3</CardTitle>
              <CardDescription>这是卡片的描述文字</CardDescription>
            </CardHeader>
            <CardContent>
              <p>卡片内容区域，展示主要信息。</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">操作</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>表单组件</CardTitle>
            <CardDescription>输入框和表单元素</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">用户名</label>
              <Input placeholder="请输入用户名" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱</label>
              <Input type="email" placeholder="请输入邮箱" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">密码</label>
              <Input type="password" placeholder="请输入密码" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">提交</Button>
          </CardFooter>
        </Card>

        {/* Dialog Section */}
        <Card>
          <CardHeader>
            <CardTitle>对话框组件</CardTitle>
            <CardDescription>模态框和弹窗</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>对话框标题</DialogTitle>
                  <DialogDescription>
                    这是一个对话框的描述文字，用于说明对话框的用途。
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">名称</label>
                    <Input placeholder="请输入名称" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">描述</label>
                    <Input placeholder="请输入描述" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">取消</Button>
                  <Button>确认</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>颜色系统</CardTitle>
            <CardDescription>黑白主题色板</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-md bg-background border" />
                <p className="text-sm font-medium">Background</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-md bg-foreground" />
                <p className="text-sm font-medium">Foreground</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-md bg-primary" />
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-md bg-secondary" />
                <p className="text-sm font-medium">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-md bg-muted" />
                <p className="text-sm font-medium">Muted</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-md bg-accent" />
                <p className="text-sm font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-md bg-card border" />
                <p className="text-sm font-medium">Card</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-md border border-border" />
                <p className="text-sm font-medium">Border</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
