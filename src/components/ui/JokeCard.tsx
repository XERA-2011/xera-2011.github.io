"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface JokeCardProps {
  theme?: string;
  className?: string;
  showControls?: boolean;
}

/**
 * 笑话卡片组件
 * 显示来自 API 的随机编程笑话
 */
export default function JokeCard({
  theme = 'default',
  className,
  showControls = true,
}: JokeCardProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 确保只在客户端挂载后渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 可用主题列表
  const themes = [
    'default', 'random', 'radical', 'merko', 'gruvbox', 'tokyonight', 'onedark',
    'cobalt', 'synthwave', 'dracula', 'monokai', 'react', 'vue-dark', 'nightowl',
  ];

  // 刷新笑话
  const refreshJoke = useCallback(() => {
    setIsLoading(true);
    setRefreshKey((prev) => prev + 1);
    // 模拟加载延迟
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  // 获取笑话图片 URL
  const getJokeUrl = useCallback(() => {
    if (!isMounted) return '';
    const params = new URLSearchParams({
      theme: currentTheme,
    });
    // 添加刷新 key 来强制刷新
    return `/api/joke?${params.toString()}&r=${refreshKey}`;
  }, [currentTheme, refreshKey, isMounted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col gap-4', className)}
    >
      {/* 控制面板 */}
      {showControls && (
        <div className="flex flex-wrap items-center gap-3">
          {/* 主题选择器 */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="theme-select"
              className="text-sm font-medium text-theme-white"
            >
              主题:
            </label>
            <select
              id="theme-select"
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="rounded-md border border-theme-white/20 bg-theme-black/50 px-3 py-1.5 text-sm text-theme-white backdrop-blur-sm transition-colors hover:border-theme-white/40 focus:border-theme-white/60 focus:outline-none"
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* 刷新按钮 */}
          <button
            type="button"
            onClick={refreshJoke}
            disabled={isLoading}
            className={cn(
              'rounded-md border border-theme-white/20 bg-theme-black/50 px-4 py-1.5 text-sm font-medium text-theme-white backdrop-blur-sm transition-all hover:border-theme-white/40 hover:bg-theme-white/10',
              isLoading && 'cursor-not-allowed opacity-50'
            )}
          >
            {isLoading ? '刷新中...' : '🔄 刷新笑话'}
          </button>
        </div>
      )}

      {/* 笑话卡片 */}
      <motion.div
        key={refreshKey}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-lg border border-theme-white/10 bg-theme-black/30 p-4 backdrop-blur-sm"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-theme-black/50 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-white/20 border-t-theme-white" />
          </div>
        )}

        {/* SVG 图片 */}
        {isMounted && (
          <Image
            src={getJokeUrl()}
            alt="Programming Joke"
            className="w-full max-w-full"
            width={800}
            height={400}
            unoptimized
          />
        )}
        {!isMounted && (
          <div className="w-full h-40 flex items-center justify-center bg-theme-white/5 rounded-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-white/20 border-t-theme-white" />
          </div>
        )}
      </motion.div>

      {/* 说明文本 */}
      <p className="text-center text-xs text-theme-white/50">
        每次刷新或更改主题将显示新的编程笑话 😄
      </p>
    </motion.div>
  );
}
