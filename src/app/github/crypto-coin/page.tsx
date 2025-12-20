"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePageTitle } from '@/hooks/use-page-title';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { BASE_URL } from '@/lib/constants';
import { useTheme } from 'next-themes';

export default function CoinPage() {
  usePageTitle('Crypto Prices');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const coins = 'btc,eth,sol,bnb';
  const currentTheme = isMounted && resolvedTheme === 'dark' ? 'dark' : 'light';

  const examples = [
    {
      title: '基础用法',
      code: `<img alt="Crypto Prices" src="${BASE_URL}/api/github/crypto-coin?coin=${coins}" />`,
    },
    {
      title: '自定义尺寸',
      code: `<img alt="Crypto Prices" src="${BASE_URL}/api/github/crypto-coin?coin=${coins}&width=800" />`,
    },
    {
      title: '自适应主题',
      code: `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${BASE_URL}/api/github/crypto-coin?coin=${coins}&theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="${BASE_URL}/api/github/crypto-coin?coin=${coins}&theme=light" />
  <img alt="Crypto Prices" src="${BASE_URL}/api/github/crypto-coin?coin=${coins}&theme=dark" />
</picture>`,
    },
  ];

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Crypto Coin Prices
          </h2>
        </motion.div>

        {/* Crypto Coin Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-4 sm:p-8">
            <div className="flex justify-center">
              {isMounted ? (
                <div className="relative overflow-hidden rounded-xl bg-secondary/10 p-4 border border-border/50">
                  <Image
                    src={`/api/github/crypto-coin?coin=${coins}&theme=${currentTheme}`}
                    alt="Crypto Prices Preview"
                    key={`preview-${currentTheme}`}
                    width={600}
                    height={150}
                    style={{ width: "auto", height: "auto" }}
                    priority
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-[150px] w-[600px] flex items-center justify-center text-muted-foreground animate-pulse rounded-xl bg-secondary/10">
                  Loading...
                </div>
              )}
            </div>
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

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">支持的币种:</strong> BTC、ETH、ETC、BNB、SOL、USDT、XRP、ADA、DOGE、TRX
                <br />
                <span className="text-xs mt-2 block">支持暗黑模式和浅色模式自适应，背景透明。</span>
              </p>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
