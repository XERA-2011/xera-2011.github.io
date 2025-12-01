"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// 可用图标列表 - 按类别分组
const ICON_CATEGORIES = {
  '前端框架': ['react', 'vue', 'angular', 'svelte', 'solidjs', 'next', 'nuxt', 'gatsby', 'astro', 'remix'],
  '编程语言': ['js', 'ts', 'python', 'java', 'go', 'rust', 'cpp', 'cs', 'php', 'ruby', 'swift', 'kotlin'],
  '开发工具': ['vscode', 'idea', 'webstorm', 'pycharm', 'vim', 'neovim', 'sublime', 'atom'],
  '构建工具': ['vite', 'webpack', 'rollup', 'gulp', 'npm', 'yarn', 'pnpm', 'bun'],
  '设计工具': ['ps', 'ai', 'xd', 'figma', 'sketch'],
  '版本控制': ['git', 'github', 'gitlab', 'bitbucket'],
  '后端技术': ['nodejs', 'express', 'nest', 'django', 'flask', 'spring', 'dotnet', 'rails'],
  '数据库': ['mysql', 'postgres', 'mongodb', 'redis', 'sqlite'],
  '云服务': ['aws', 'gcp', 'azure', 'vercel', 'netlify', 'cloudflare'],
  '其他': ['docker', 'kubernetes', 'linux', 'discord', 'tailwind', 'sass', 'css', 'html']
};

// 扁平化的所有图标列表
const AVAILABLE_ICONS = Object.values(ICON_CATEGORIES).flat();

export default function IconsPage() {
  usePageTitle('图标卡片');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedIcons, setSelectedIcons] = useState<string>('ps,react,vue,vite,vscode,idea,git,discord');
  const [previewIcons, setPreviewIcons] = useState<string[]>(['ps', 'react', 'vue', 'vite', 'vscode', 'idea', 'git', 'discord']);
  const [showAllIcons, setShowAllIcons] = useState<boolean>(false);
  const [iconTheme, setIconTheme] = useState<'auto' | 'dark' | 'light'>('auto');

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleIcon = (icon: string) => {
    const currentIcons = selectedIcons.split(',').map(i => i.trim()).filter(Boolean);
    if (currentIcons.includes(icon)) {
      const newIcons = currentIcons.filter(i => i !== icon);
      setSelectedIcons(newIcons.join(','));
    } else {
      setSelectedIcons([...currentIcons, icon].join(','));
    }
  };

  // 根据主题设置应用图标主题后缀
  const applyIconTheme = (icons: string, theme: 'auto' | 'dark' | 'light'): string => {
    if (theme === 'auto') return icons;

    return icons.split(',').map(icon => {
      const trimmedIcon = icon.trim();
      // 如果已经有主题后缀，先移除
      const cleanIcon = trimmedIcon.replace(/-dark$/i, '').replace(/-light$/i, '');
      // 添加新的主题后缀
      return `${cleanIcon}-${theme}`;
    }).join(',');
  };

  const baseUrl = 'https://xera-2011.vercel.app';

  // 当选中图标变化时更新预览
  useEffect(() => {
    const icons = selectedIcons.split(',').map(icon => icon.trim()).filter(Boolean);
    setPreviewIcons(icons);
  }, [selectedIcons]);

  const themedIcons = applyIconTheme(selectedIcons, iconTheme);
  const currentPreview = `/api/github/icons?i=${themedIcons}`;

  const examples = [
    {
      title: '技术栈图标',
      code: `<img alt="Icons" src="${baseUrl}/api/github/icons?i=${themedIcons}" />`,
      preview: currentPreview
    }
  ];

  return (
    <div className="relative w-full min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            图标卡片
          </h2>
          <p className="text-muted-foreground">生成精美的 SVG 图标卡片，展示各种技术栈和品牌图标</p>
        </motion.div>

        {/* Interactive Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-6 sm:p-8 mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">实时预览</h3>

            <div className="space-y-6">
              {/* 主题选择 */}
              <div>
                <Label className="text-muted-foreground">图标主题</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={iconTheme === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIconTheme('auto')}
                    className="flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    自动
                  </Button>
                  <Button
                    variant={iconTheme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIconTheme('dark')}
                    className="flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    深色
                  </Button>
                  <Button
                    variant={iconTheme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIconTheme('light')}
                    className="flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    浅色
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {iconTheme === 'auto' ? '根据图标自动选择主题（推荐）' : `强制使用 ${iconTheme === 'dark' ? '深色' : '浅色'} 主题图标`}
                </p>
              </div>

              <div>
                {/* 图标分类选择器 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      共 {AVAILABLE_ICONS.length} 个可用图标，已选择 {previewIcons.length} 个
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllIcons(!showAllIcons)}
                    >
                      {showAllIcons ? '收起' : '展开全部图标'}
                    </Button>
                  </div>

                  {showAllIcons && (
                    <div className="border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                      {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-semibold text-foreground mb-2">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {icons.map((icon) => {
                              const isSelected = previewIcons.includes(icon);
                              return (
                                <button
                                  key={icon}
                                  onClick={() => toggleIcon(icon)}
                                  className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-secondary text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                                  }`}
                                >
                                  {icon}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 预览区域 */}
              <div className="flex justify-center bg-secondary border border-border rounded-lg p-8">
                {previewIcons.length > 0 ? (
                  <Image
                    src={currentPreview}
                    alt="Icons Preview"
                    key={themedIcons}
                    className="w-full max-w-full"
                    width={previewIcons.length * 48}
                    height={48}
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="text-muted-foreground">请点击下方按钮选择图标</div>
                )}
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* API Documentation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6"
        >
          <GlowCard className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">使用方法</h2>

            <div className="space-y-8">
              {examples.map((example, index) => (
                <div key={index} className="space-y-3">
                  {/* Code Block with Copy Button */}
                  <div className="relative">
                    <pre className="bg-secondary border border-border rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-foreground">{example.code}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(example.code, index)}
                      className="absolute top-2 right-2"
                    >
                      {copiedIndex === index ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 002 2v8a2 2 0 002 2z" />
                          </svg>
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <h3 className="text-lg font-semibold text-foreground">API 参数说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-foreground font-medium">i</span>
                    <span className="text-muted-foreground ml-2">(必填) 图标列表</span>
                  </div>
                  <div className="text-muted-foreground text-xs pl-4">
                    多个图标用逗号分隔，例如：ps,react,vue<br />
                    支持主题后缀：react-dark,vue-light
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-foreground font-medium">s</span>
                    <span className="text-muted-foreground ml-2">(可选) 图标尺寸</span>
                  </div>
                  <div className="text-muted-foreground text-xs pl-4">
                    默认 48px，例如：?s=64
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>• 显示格式：水平排列的图标组合</p>
                <p>• 背景：完全透明</p>
                <p>• 尺寸：根据图标数量自动调整</p>
                <p>• 主题支持：可指定 -dark/-light 后缀（如 react-dark）或让 API 自动匹配</p>
                <p>• 支持别名：ps(Photoshop), ai(Illustrator), vue(VueJS), js(JavaScript), ts(TypeScript) 等</p>
                <details className="mt-2">
                  <summary className="cursor-pointer hover:text-foreground">
                    查看所有 {AVAILABLE_ICONS.length} 个可用图标
                  </summary>
                  <div className="mt-2 pl-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                      <div key={category}>
                        <p className="font-semibold text-foreground mb-1">{category}</p>
                        <p className="text-xs">{icons.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
