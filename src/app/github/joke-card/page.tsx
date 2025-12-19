"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import JokeCard from './_components/joke-card';
import GlowCard from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { BASE_URL } from '@/lib/constants';

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

  const examples = [
    {
      title: '基础用法',
      code: `<img alt="Joke Card" src="${BASE_URL}/api/github/joke" />`,
    },
    {
      title: '自定义尺寸',
      code: `<img alt="Joke Card" src="${BASE_URL}/api/github/joke?width=600&height=250" />`,
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
            编程笑话卡片
          </h2>
        </motion.div>

        {/* Joke Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlowCard className="p-4 sm:p-8">
            <div className="flex justify-center">
              <JokeCard showControls={true} className="w-full max-w-2xl" />
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
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}


