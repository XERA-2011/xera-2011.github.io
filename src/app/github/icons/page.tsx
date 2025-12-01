"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';

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
  const [selectedIcons, setSelectedIcons] = useState<string[]>(['react', 'vue', 'next', 'nuxt', 'vite', 'vscode', 'idea', 'git', 'python', 'docker']);
  const [showAllIcons, setShowAllIcons] = useState<boolean>(true);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
    if (selectedIcons.includes(icon)) {
      setSelectedIcons(selectedIcons.filter(i => i !== icon));
    } else {
      setSelectedIcons([...selectedIcons, icon]);
    }
  };

  const baseUrl = 'https://xera-2011.vercel.app';

  // 将数组转换为字符串用于 API 调用
  const iconsParam = selectedIcons.join(',');
  const currentPreview = `/api/github/icons?i=${iconsParam}`;

  const examples = [
    {
      title: '技术栈图标',
      code: `<img alt="Icons" src="${baseUrl}/api/github/icons?i=${iconsParam}" />`,
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
              <div>
                {/* 图标分类选择器 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      共 {AVAILABLE_ICONS.length} 个可用图标，已选择 {selectedIcons.length} 个
                    </p>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllIcons(!showAllIcons)}
                    >
                      {showAllIcons ? '收起' : '展开全部图标'}
                    </Button>
                  </div>

                  {/* 已选择的图标 */}
                  {selectedIcons.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-accent/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-foreground">已选择的图标（可拖动排序）</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedIcons([])}
                        >
                          清空全部
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedIcons.map((icon, index) => (
                          <div
                            key={icon}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', index.toString());
                              setDraggingIndex(index);
                            }}
                            onDragEnd={() => {
                              setDraggingIndex(null);
                              setDragOverIndex(null);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              setDragOverIndex(index);
                            }}
                            onDragLeave={() => {
                              setDragOverIndex(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                              const toIndex = index;
                              if (fromIndex !== toIndex) {
                                const newIcons = [...selectedIcons];
                                const [movedIcon] = newIcons.splice(fromIndex, 1);
                                newIcons.splice(toIndex, 0, movedIcon);
                                setSelectedIcons(newIcons);
                              }
                              setDragOverIndex(null);
                              setDraggingIndex(null);
                            }}
                            className={`group relative px-3 py-1.5 text-xs rounded-md border cursor-move transition-all ${draggingIndex === index
                                ? 'opacity-50 scale-95 border-dashed'
                                : dragOverIndex === index
                                  ? 'border-primary bg-primary/30 text-primary scale-105 shadow-lg'
                                  : 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                          >
                            <span className="select-none">{icon}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleIcon(icon);
                              }}
                              className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
                              aria-label={`删除 ${icon}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showAllIcons && (
                    <div className="border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                      {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          <h4 className="text-sm font-semibold text-foreground mb-2">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {icons.map((icon) => {
                              const isSelected = selectedIcons.includes(icon);
                              return (
                                <button
                                  key={icon}
                                  onClick={() => toggleIcon(icon)}
                                  className={`px-3 py-1 text-xs rounded-md border transition-colors ${isSelected
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
                {selectedIcons.length > 0 ? (
                  <Image
                    src={currentPreview}
                    alt="Icons Preview"
                    key={iconsParam}
                    className="w-full max-w-full"
                    width={selectedIcons.length * 48}
                    height={48}
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="text-muted-foreground">请选择图标</div>
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
                    支持别名：ps, js, ts 等
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
                <p>• 支持别名：ps(Photoshop), ai(Illustrator), vue(VueJS), js(JavaScript), ts(TypeScript) 等</p>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
