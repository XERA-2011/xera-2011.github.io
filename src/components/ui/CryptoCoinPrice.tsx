"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CoinData {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  lastUpdated: number;
  change24h: number | null;
}

interface CoinPriceProps {
  coins?: string[];
  className?: string;
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // 秒
  displayMode?: 'svg' | 'html'; // SVG 卡片或 HTML 卡片
}

/**
 * 币价展示组件
 * 从 /crypto-coin 获取并显示加密货币价格
 */
export default function CoinPrice({
  coins = ['btc', 'eth', 'sol', 'bnb'],
  className,
  showControls = true,
  autoRefresh = true,
  refreshInterval = 30,
  displayMode = 'html',
}: CoinPriceProps) {
  const [coinData, setCoinData] = useState<Record<string, CoinData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  // 确保只在客户端挂载后渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 格式化价格
  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return price.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }
    return price.toLocaleString(undefined, { maximumSignificantDigits: 4 });
  };

  // 格式化变化百分比
  const formatChange = (change: number | null): string => {
    if (change === null) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // 获取 SVG 卡片 URL
  const getCoinCardUrl = useCallback((coin: string) => {
    if (!isMounted) return '';
    const params = new URLSearchParams({
      coin: coin.toLowerCase(),
      mode: 'single',
    });
    return `/api/crypto-coin?${params.toString()}&r=${refreshKey}`;
  }, [refreshKey, isMounted]);

  // 获取多币种 SVG 卡片 URL
  const getMultiCoinCardUrl = useCallback(() => {
    if (!isMounted) return '';
    const params = new URLSearchParams({
      coin: coins.join(','),
      mode: 'multi',
    });
    return `/api/crypto-coin?${params.toString()}&r=${refreshKey}`;
  }, [coins, refreshKey, isMounted]);

  // 获取价格数据
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    // 对于 SVG 模式，直接更新 refreshKey 来刷新图片
    if (displayMode === 'svg') {
      setRefreshKey(prev => prev + 1);
      setLastUpdate(new Date());
      // 模拟加载延迟
      setTimeout(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      }, 300);
      return;
    }

    try {
      const params = new URLSearchParams({
        coin: coins.join(','),
        vs: 'usd',
      });

      const response = await fetch(`/api/crypto-coin?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || 'Failed to fetch prices');
      }

      setCoinData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching coin prices:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prices';

      // 特殊处理 429 错误
      if (errorMessage.includes('429')) {
        setError('API 请求过于频繁，请稍后再试。CoinGecko 免费 API 有速率限制。');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [coins, displayMode]);

  // 初始加载
  useEffect(() => {
    if (isMounted) {
      fetchPrices();
    }
  }, [isMounted, fetchPrices]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !isMounted) return;

    const timer = setInterval(fetchPrices, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, fetchPrices, isMounted]);

  // 倒计时逻辑
  useEffect(() => {
    if (!autoRefresh || !isMounted) return;

    // 初始化倒计时
    setCountdown(refreshInterval);

    // 每秒更新倒计时
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [autoRefresh, refreshInterval, isMounted, lastUpdate]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-white/20 border-t-theme-white" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col gap-3', className)}
    >
      {/* 刷新时间信息 */}
      {showControls && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-theme-white/10 bg-theme-black/20 px-4 py-2 backdrop-blur-sm">
          {lastUpdate && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-white/50">⏰</span>
              <span className="font-medium text-white/90">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}
          {lastUpdate && autoRefresh && countdown > 0 && (
            <div className="h-3 w-px bg-theme-white/20" />
          )}
          {autoRefresh && countdown > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-white/50">⏳</span>
              <span className="font-medium text-white/90">
                {countdown} 秒
              </span>
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* SVG 模式 - 展示 SVG 卡片 */}
      {displayMode === 'svg' && (
        <motion.div
          key={refreshKey}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-lg border border-theme-white/10 bg-theme-black/30 p-3 backdrop-blur-sm"
        >
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-theme-black/50 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-white/20 border-t-theme-white" />
            </div>
          )}

          {/* SVG 图片 - 多币种网格 */}
          {isMounted && coins.length > 1 ? (
            <div className="flex justify-center">
              <Image
                src={getMultiCoinCardUrl()}
                alt="Cryptocurrency Prices"
                className="w-full max-w-full"
                width={900}
                height={600}
                unoptimized
                priority
              />
            </div>
          ) : (
            /* SVG 图片 - 单币种网格 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coins.map((coin, index) => (
                <motion.div
                  key={coin}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex justify-center"
                >
                  {isMounted && (
                    <Image
                      src={getCoinCardUrl(coin)}
                      alt={`${coin.toUpperCase()} Price`}
                      className="w-full max-w-full"
                      width={400}
                      height={240}
                      unoptimized
                      priority={index === 0}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* HTML 模式 - 币价卡片网格 */}
      {displayMode === 'html' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coins.map((coin, index) => {
            const data = coinData[coin.toLowerCase()];

            return (
              <motion.div
                key={coin}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  'relative overflow-hidden rounded-lg border border-theme-white/10 bg-theme-black/30 p-6 backdrop-blur-sm transition-all hover:border-theme-white/20',
                  isLoading && 'opacity-60'
                )}
              >
                {/* 加载动画 */}
                {isLoading && (
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-theme-white/5 to-transparent animate-pulse" />
                )}

                {/* 币种符号 */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {data?.symbol || coin.toUpperCase()}
                  </h3>
                  {data?.name && (
                    <p className="text-xs text-white/50 mb-4">{data.name}</p>
                  )}
                </div>

                {/* 价格 */}
                <div className="text-center mb-3">
                  {data ? (
                    <p className="text-2xl font-bold text-white">
                      ${formatPrice(data.price)}
                    </p>
                  ) : (
                    <p className="text-xl text-white/40">-</p>
                  )}
                </div>

                {/* 24小时变化 */}
                {data?.change24h !== null && data?.change24h !== undefined && (
                  <div className="text-center">
                    <span
                      className={cn(
                        'inline-block rounded-full px-3 py-1 text-xs font-medium',
                        data.change24h >= 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {formatChange(data.change24h)}
                    </span>
                  </div>
                )}

                {/* 货币单位 */}
                {data && (
                  <p className="text-center text-xs text-white/40 mt-2">
                    {data.currency}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 说明文本 */}
      <p className="text-center text-xs text-theme-white/40">
        数据来自 CoinGecko API · 每 {refreshInterval} 秒自动刷新
      </p>
    </motion.div>
  );
}
