"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import PieChart from '@/components/ui/PieChart';

interface Asset {
  id: string;
  name: string;
  amount: number;
  color: string;
}

export default function AssetAllocationPage() {
  usePageTitle('资产配置占比');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetName, setAssetName] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [error, setError] = useState('');
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);

  // 生成与现有颜色差异最大的颜色
  const generateDistinctColor = () => {
    if (assets.length === 0) {
      // 第一个颜色随机生成
      const hue = Math.floor(Math.random() * 360);
      return `hsl(${hue}, 45%, 60%)`;
    }

    // 提取现有颜色的色相值
    const existingHues = assets.map(asset => {
      const match = asset.color.match(/hsl\((\d+)/);
      return match ? parseInt(match[1]) : 0;
    }).sort((a, b) => a - b);

    let bestHue = 0;
    let maxMinDistance = 0;

    // 尝试多个候选色相，选择与所有现有颜色距离最大的
    for (let i = 0; i < 36; i++) {
      const candidateHue = i * 10; // 每10度一个候选

      // 计算该候选色相与所有现有色相的最小距离
      let minDistance = 360;
      for (const existingHue of existingHues) {
        // 计算色环上的最短距离
        const distance = Math.min(
          Math.abs(candidateHue - existingHue),
          360 - Math.abs(candidateHue - existingHue)
        );
        minDistance = Math.min(minDistance, distance);
      }

      // 选择最小距离最大的候选（即与所有现有颜色都尽可能远）
      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestHue = candidateHue;
      }
    }

    // 在最佳色相附近添加一些随机性，避免颜色过于规律
    const finalHue = (bestHue + Math.floor(Math.random() * 20 - 10) + 360) % 360;
    const saturation = 40 + Math.floor(Math.random() * 15); // 40-55% (降低饱和度)
    const lightness = 55 + Math.floor(Math.random() * 15); // 55-70% (提高亮度)

    return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
  };

  const handleAddAsset = () => {
    setError('');

    if (!assetName.trim()) {
      setError('请输入资产名称');
      return;
    }

    const amount = parseFloat(assetAmount);
    if (!assetAmount || isNaN(amount) || amount <= 0) {
      setError('请输入有效的金额（大于0）');
      return;
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      name: assetName.trim(),
      amount: amount,
      color: generateDistinctColor(),
    };

    setAssets([...assets, newAsset]);
    setAssetName('');
    setAssetAmount('');
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const handleClear = () => {
    setAssets([]);
    setAssetName('');
    setAssetAmount('');
    setError('');
  };

  const getPercentage = (amount: number) => {
    if (totalAmount === 0) return 0;
    return (amount / totalAmount) * 100;
  };

  const handleCopyData = async () => {
    if (assets.length === 0) return;

    const copyText = [
      `总资产：¥${totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      '',
      ...assets.map((asset) => {
        const percentage = getPercentage(asset.amount).toFixed(2);
        const amount = asset.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${asset.name}：¥${amount} (${percentage}%)`;
      }),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(copyText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            资产配置占比
          </h2>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* 左侧：输入区域 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            {/* 输入表单 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  资产名称
                </label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="例如：股票、债券、现金..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAsset()}
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  金额
                </label>
                <input
                  type="number"
                  value={assetAmount}
                  onChange={(e) => setAssetAmount(e.target.value)}
                  placeholder="请输入金额"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAsset()}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddAsset}
                className="flex-1 bg-white !text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-sm cursor-can-hover"
              >
                添加资产
              </button>
              <button
                onClick={handleCopyData}
                disabled={assets.length === 0}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 cursor-can-hover disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {copySuccess ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已复制
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    复制
                  </span>
                )}
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20 cursor-can-hover"
              >
                清空
              </button>
            </div>

            {/* 资产列表 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                资产列表 {assets.length > 0 && `(${assets.length})`}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {assets.map((asset) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: asset.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {asset.name}
                          </div>
                          <div className="text-white/60 text-sm">
                            ¥{asset.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {getPercentage(asset.amount).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="ml-4 text-red-400 hover:text-red-300 transition-colors cursor-can-hover"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {assets.length === 0 && (
                  <div className="text-center text-white/50 py-8">
                    暂无资产，请添加
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：可视化区域 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            {/* 总资产 */}
            {totalAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 rounded-lg p-4 mb-6 text-center"
              >
                <div className="text-white/70 text-sm mb-1">总资产</div>
                <div className="text-white text-3xl font-bold">
                  ¥{totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </motion.div>
            )}

            {/* 饼图 */}
            <PieChart
              assets={assets}
              totalAmount={totalAmount}
              hoveredAsset={hoveredAsset}
              onAssetHover={setHoveredAsset}
            />

            {/* 图例 */}
            {assets.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 space-y-2"
              >
                <h3 className="text-sm font-semibold text-white/70 mb-3">图例</h3>
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span className="text-white">{asset.name}</span>
                    </div>
                    <span className="text-white/70">
                      {getPercentage(asset.amount).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
