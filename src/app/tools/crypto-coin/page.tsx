"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import CryptoCoinPrice from '@/components/ui/CryptoCoinPrice';
import GlowCard from '@/components/ui/GlowCard';
import { Button } from '@/components/ui/button';

export default function CoinPage() {
  usePageTitle('Crypto Prices');
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

  const examples = [
    {
      title: '单币种卡片',
      code: '![BTC Price](https://xera-2011.vercel.app/api/crypto-coin?coin=btc)',
      preview: '/api/crypto-coin?coin=btc',
    },
    {
      title: '多币种卡片',
      code: '![Crypto Prices](https://xera-2011.vercel.app/api/crypto-coin?coin=btc,eth,sol,bnb&mode=multi)',
      preview: '/api/crypto-coin?coin=btc,eth,sol,bnb&mode=multi',
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

        {/* Coin Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-4 sm:p-6">
            <CryptoCoinPrice
              coins={['btc', 'eth', 'sol', 'bnb']}
              showControls={true}
              autoRefresh={true}
              refreshInterval={30}
              displayMode="svg"
            />
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
                    <img src={example.preview} alt={example.title} className="max-w-full" />
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
