"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/GlowCard';
import { Button } from '@/components/ui/button';

export default function CoinPage() {
  usePageTitle('Crypto Prices');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [layout, setLayout] = useState('grid');
  const [theme, setTheme] = useState('dark');

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
  const coins = 'btc,eth,sol,bnb';

  // 布局选项
  const layoutOptions = [
    { value: 'grid', label: '常规网格布局' },
    { value: 'horizontal', label: '紧凑水平布局' }
  ];

  const examples = [
    {
      title: '单币种卡片',
      code: `<img alt="BTC Price" src="${baseUrl}/api/github/crypto-coin?coin=btc" />`,
      preview: `/api/github/crypto-coin?coin=btc`,
    },
    {
      title: '多币种卡片 (网格布局)',
      code: `<img alt="Crypto Prices" src="${baseUrl}/api/github/crypto-coin?coin=${coins}&mode=multi" />`,
      preview: `/api/github/crypto-coin?coin=${coins}&mode=multi`,
    },
    {
      title: '多币种卡片 (紧凑水平布局)',
      code: `<img alt="Crypto Prices" src="${baseUrl}/api/github/crypto-coin?coin=${coins}&mode=multi&layout=horizontal&theme=${theme}" />`,
      preview: `/api/github/crypto-coin?coin=${coins}&mode=multi&layout=horizontal&theme=${theme}`,
    },
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
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Crypto Coin Prices
          </h2>
        </motion.div>

        {/* Interactive Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-6 sm:p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">实时预览</h3>

            <div className="space-y-6">
              {/* 布局选择 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  布局类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {layoutOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLayout(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-all ${layout === option.value
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/20 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 主题选择 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  主题
                </label>
                <div className="flex gap-2">
                  {['dark', 'light'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2 rounded-lg border transition-all ${theme === t
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/20 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 预览区域 */}
              <div className="flex justify-center bg-black/20 border border-white/10 rounded-lg p-8 mt-6" style={{ minHeight: '250px' }}>
                <Image
                  src={`/api/github/crypto-coin?coin=${coins}&mode=multi&layout=${layout}&theme=${theme}`}
                  alt="Crypto Prices Preview"
                  key={`${layout}-${theme}`}
                  width={layout === 'horizontal' ? 600 : 400}
                  height={layout === 'horizontal' ? 150 : 300}
                  style={{ width: "auto", height: "auto" }}
                  priority
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
            <h2 className="text-2xl font-bold text-white mb-6">使用方法</h2>

            <div className="space-y-8">
              {examples.map((example, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">{example.title}</h3>

                  {/* Code Block with Copy Button */}
                  <div className="relative">
                    <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-white/90">{example.code}</code>
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

                  {/* Preview */}
                  <div className="flex justify-center bg-black/20 border border-white/10 rounded-lg p-4">
                    <Image
                      src={example.preview}
                      alt={example.title}
                      className="max-w-full"
                      width={900}
                      height={600}
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-white/60">
                <strong className="text-white/80">支持的币种:</strong> BTC、ETH、ETC、BNB、SOL、USDT、XRP、ADA、DOGE、TRX
              </p>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
