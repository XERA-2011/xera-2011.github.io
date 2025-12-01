"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import JokeCard from '@/components/github/joke-card';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';

export default function JokeCardPage() {
  usePageTitle('编程笑话卡片');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const baseUrl = 'https://xera-2011.vercel.app';

  const examples = [
    {
      title: '基础用法',
      code: `<img alt="Joke Card" src="${baseUrl}/api/github/joke" />`,
    },
    {
      title: '指定主题',
      code: `<img alt="Joke Card" src="${baseUrl}/api/github/joke?theme=dracula" />`,
    },
    {
      title: '自定义尺寸',
      code: `<img alt="Joke Card" src="${baseUrl}/api/github/joke?width=600&height=250" />`,
    },
  ];

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            编程笑话卡片
          </h2>
        </motion.div>

        {/* Joke Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-8">
            <JokeCard showControls={true} />
          </GlowCard>
        </motion.div>

        {/* Usage Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8"
        >
          <GlowCard className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">使用方法</h2>

            <div className="space-y-6">
              {examples.map((example, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{example.title}</p>
                  <div className="relative">
                    <pre className="bg-secondary border border-border rounded-lg p-3 overflow-x-auto">
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <h3 className="text-lg font-semibold text-foreground">API 参数说明</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-foreground font-medium">theme</span>
                  <span className="text-muted-foreground ml-2">(可选) 主题名称</span>
                  <div className="text-muted-foreground text-xs pl-4 mt-1">
                    支持 40+ 种主题：default, dracula, tokyonight, monokai, gruvbox, radical, vue, react 等<br />
                    使用 <code className="bg-secondary px-1 rounded">theme=random</code> 随机选择主题
                  </div>
                </div>
                <div>
                  <span className="text-foreground font-medium">width / height</span>
                  <span className="text-muted-foreground ml-2">(可选) 卡片尺寸</span>
                  <div className="text-muted-foreground text-xs pl-4 mt-1">
                    自定义卡片宽度和高度（像素），例如：<code className="bg-secondary px-1 rounded">?width=600&height=250</code><br />
                    默认值：QnA 卡片 500×200，Quote 卡片 500×150
                  </div>
                </div>
                <div>
                  <span className="text-foreground font-medium">hideBorder</span>
                  <span className="text-muted-foreground ml-2">(可选) 隐藏边框</span>
                  <div className="text-muted-foreground text-xs pl-4 mt-1">
                    添加此参数隐藏卡片边框，例如：<code className="bg-secondary px-1 rounded">?hideBorder</code>
                  </div>
                </div>
                <div>
                  <span className="text-foreground font-medium">自定义颜色</span>
                  <span className="text-muted-foreground ml-2">(可选)</span>
                  <div className="text-muted-foreground text-xs pl-4 mt-1">
                    borderColor, bgColor, qColor, aColor, textColor, codeColor<br />
                    使用十六进制颜色值，例如：<code className="bg-secondary px-1 rounded">?bgColor=1a1b27&qColor=70a5fd</code>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>✨ <strong>双语支持：</strong>上英文下中文，保留技术梗的原汁原味</p>
                <p>• 190+ 条精选编程笑话，随机展示</p>
                <p>• 每次请求随机返回不同笑话</p>
                <p>• 缓存时间 10 秒，适合动态展示</p>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
