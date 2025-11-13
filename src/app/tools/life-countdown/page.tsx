"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';

export default function LifeCountdownPage() {
  usePageTitle('人生倒计时');
  const [currentAge, setCurrentAge] = useState('');
  const [targetAge, setTargetAge] = useState('');
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [error, setError] = useState('');

  const calculateDays = () => {
    setError('');

    const current = parseFloat(currentAge);
    const target = parseFloat(targetAge);

    // 验证输入
    if (!currentAge || !targetAge) {
      setError('请输入当前年龄和目标年龄');
      return;
    }

    if (isNaN(current) || isNaN(target)) {
      setError('请输入有效的数字');
      return;
    }

    if (current < 0 || target < 0) {
      setError('年龄不能为负数');
      return;
    }

    if (current >= target) {
      setError('目标年龄必须大于当前年龄');
      return;
    }

    if (target > 150) {
      setError('目标年龄似乎不太现实');
      return;
    }

    // 计算剩余天数（1年 = 365.25天，考虑闰年）
    const yearsDiff = target - current;
    const days = Math.floor(yearsDiff * 365.25);

    setRemainingDays(days);
  };

  const handleClear = () => {
    setCurrentAge('');
    setTargetAge('');
    setRemainingDays(null);
    setError('');
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN');
  };

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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            人生倒计时
          </h2>
        </motion.div>

        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white font-medium mb-3">
                当前年龄
              </label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                placeholder="例如：25"
                step="0.1"
                min="0"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-3">
                目标年龄
              </label>
              <input
                type="number"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                placeholder="例如：80"
                step="0.1"
                min="0"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={calculateDays}
              className="flex-1 bg-white !text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-sm cursor-can-hover"
            >
              计算剩余天数
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 cursor-can-hover"
            >
              清空
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Result Display */}
          {remainingDays !== null && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/20 rounded-xl p-8 text-center"
            >
              <div className="mb-4">
                <p className="text-white/70 text-lg mb-2">剩余天数</p>
                <p className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {formatNumber(remainingDays)}
                </p>
                <p className="text-white/60 text-lg">天</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-white/60 text-sm mb-1">约</p>
                  <p className="text-2xl font-semibold text-white">
                    {formatNumber(Math.floor(remainingDays / 365.25))}
                  </p>
                  <p className="text-white/60 text-sm mt-1">年</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">约</p>
                  <p className="text-2xl font-semibold text-white">
                    {formatNumber(Math.floor(remainingDays / 30.44))}
                  </p>
                  <p className="text-white/60 text-sm mt-1">月</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">约</p>
                  <p className="text-2xl font-semibold text-white">
                    {formatNumber(Math.floor(remainingDays / 7))}
                  </p>
                  <p className="text-white/60 text-sm mt-1">周</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
