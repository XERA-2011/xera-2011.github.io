"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CountdownPage() {
  usePageTitle('倒计时卡片');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [textColor, setTextColor] = useState('');
  const [targetDate, setTargetDate] = useState('2038-01-19');

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

  const colorParam = textColor === 'white' ? `&color=${textColor}` : '';

  const examples = [
    {
      title: '世界末日倒计时',
      code: `<img alt="Countdown" src="${baseUrl}/api/github/countdown?target=${encodeURIComponent(targetDate)}${colorParam}" />`,
      preview: `/api/github/countdown?target=${encodeURIComponent(targetDate)}${colorParam}`
    }
  ];

  const currentPreview = `/api/github/countdown?target=${encodeURIComponent(targetDate)}${colorParam}`;

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
            倒计时卡片
          </h2>
          <p className="text-muted-foreground">生成精美的 SVG 倒计时卡片，展示到任何目标时间的剩余时间</p>
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
              {/* 自定义设置 */}
              <div>
                <Label htmlFor="targetDate" className="text-muted-foreground">目标日期</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  placeholder="例如：2038-01-19"
                />
              </div>

              {/* 字体颜色选择 */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  字体颜色
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTextColor('')}
                    className={`px-4 py-2 rounded-lg border transition-all duration-300 ${textColor === ''
                      ? 'bg-accent border-ring text-accent-foreground'
                      : 'bg-secondary border-border text-muted-foreground hover:border-ring'
                      }`}
                  >
                    黑色
                  </button>
                  <button
                    onClick={() => setTextColor('white')}
                    className={`px-4 py-2 rounded-lg border transition-all duration-300 ${textColor === 'white'
                      ? 'bg-accent border-ring text-accent-foreground'
                      : 'bg-secondary border-border text-muted-foreground hover:border-ring'
                      }`}
                  >
                    白色
                  </button>
                </div>
              </div>

              {/* 预览区域 */}
              <div
                className="flex justify-center bg-secondary border border-border rounded-lg p-8 mt-6"
                style={{
                  minHeight: '100px',
                  backgroundImage: textColor === 'white'
                    ? 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a)'
                    : 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px'
                }}
              >
                <Image
                  src={currentPreview}
                  alt="Countdown Preview"
                  key={`${targetDate}-${textColor}`}
                  className="w-full max-w-full"
                  width={250}
                  height={40}
                  unoptimized
                />
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
                    <span className="text-foreground font-medium">target</span>
                    <span className="text-muted-foreground ml-2">(必填) 目标日期</span>
                  </div>
                  <div className="text-muted-foreground text-xs pl-4">
                    支持格式: YYYY-MM-DD, YYYY/MM/DD, 时间戳
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-foreground font-medium">color</span>
                    <span className="text-muted-foreground ml-2">(可选) 字体颜色</span>
                  </div>
                  <div className="text-muted-foreground text-xs pl-4">
                    black (默认) 或 white
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>• 显示格式：Countdown: XXX days</p>
                <p>• 背景：完全透明</p>
                <p>• 尺寸：根据文字内容自动调整</p>
                <p>• 默认黑色字体，不需要传 color 参数</p>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}