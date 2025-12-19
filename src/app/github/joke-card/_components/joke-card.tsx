"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';

interface JokeCardProps {
  className?: string;
  showControls?: boolean;
}

/**
 * 笑话卡片组件
 * 显示来自 API 的随机编程笑话
 */
export default function JokeCard({
  className,
  showControls = true,
}: JokeCardProps) {
  const { resolvedTheme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 确保只在客户端挂载后渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    // 只支持 width / height 传参，此处为了预览暂不传宽高，只传刷新 key
    return `/api/github/joke?r=${refreshKey}`;
  }, [refreshKey, isMounted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col gap-4', className)}
    >
      {/* 控制面板 */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* 刷新按钮 */}
          <button
            type="button"
            onClick={refreshJoke}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-secondary hover:border-ring/50',
              isLoading && 'cursor-not-allowed opacity-50'
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            {isLoading ? '刷新中...' : '刷新笑话'}
          </button>
        </div>
      )}

      {/* 笑话卡片 */}
      <motion.div
        key={refreshKey}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-lg bg-card/30 p-4 backdrop-blur-sm"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
          <div className="w-full h-40 flex items-center justify-center bg-secondary/10 rounded-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

