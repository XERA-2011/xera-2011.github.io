"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import PieChart from '@/components/ui/PieChart';
import GlowCard from '@/components/ui/GlowCard';
import Button from '@/components/ui/Button';
import { getLocalStorage, setLocalStorage } from '@/utils/storage';

interface Asset {
  id: string;
  name: string;
  amount: number;
  color: string;
}

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
  isReadOnly?: boolean;
}

const STORAGE_KEY = 'asset-portfolios';

// 名人持仓模板（只读）
const CELEBRITY_PORTFOLIOS: Portfolio[] = [
  {
    id: 'buffett',
    name: '巴菲特持仓参考',
    description: '基于伯克希尔·哈撒韦公开持仓（2024Q3）',
    assets: [
      { id: '1', name: '苹果 (AAPL)', amount: 69.9, color: 'hsl(210, 45%, 60%)' },
      { id: '2', name: '美国银行 (BAC)', amount: 10.1, color: 'hsl(150, 45%, 60%)' },
      { id: '3', name: '美国运通 (AXP)', amount: 8.8, color: 'hsl(30, 45%, 60%)' },
      { id: '4', name: '可口可乐 (KO)', amount: 7.5, color: 'hsl(0, 45%, 60%)' },
      { id: '5', name: '雪佛龙 (CVX)', amount: 3.7, color: 'hsl(270, 45%, 60%)' },
    ],
    createdAt: '2024-09-30',
    updatedAt: '2024-09-30',
    isReadOnly: true,
  },
  {
    id: 'duan',
    name: '段永平持仓参考',
    description: '基于公开信息整理的大致配置',
    assets: [
      { id: '1', name: '苹果 (AAPL)', amount: 40, color: 'hsl(210, 45%, 60%)' },
      { id: '2', name: '茅台', amount: 25, color: 'hsl(0, 45%, 60%)' },
      { id: '3', name: '腾讯', amount: 15, color: 'hsl(180, 45%, 60%)' },
      { id: '4', name: '拼多多 (PDD)', amount: 10, color: 'hsl(280, 45%, 60%)' },
      { id: '5', name: '现金及其他', amount: 10, color: 'hsl(120, 45%, 60%)' },
    ],
    createdAt: '2024-06-30',
    updatedAt: '2024-06-30',
    isReadOnly: true,
  },
  {
    id: 'cathie',
    name: '木头姐持仓参考',
    description: '基于 ARK Innovation ETF (ARKK) 主要持仓',
    assets: [
      { id: '1', name: 'Coinbase (COIN)', amount: 9.8, color: 'hsl(30, 45%, 60%)' },
      { id: '2', name: 'Roku (ROKU)', amount: 8.5, color: 'hsl(270, 45%, 60%)' },
      { id: '3', name: 'Tesla (TSLA)', amount: 7.2, color: 'hsl(0, 45%, 60%)' },
      { id: '4', name: 'Block (SQ)', amount: 6.9, color: 'hsl(210, 45%, 60%)' },
      { id: '5', name: 'UiPath (PATH)', amount: 5.8, color: 'hsl(150, 45%, 60%)' },
      { id: '6', name: '其他科技股', amount: 61.8, color: 'hsl(180, 45%, 60%)' },
    ],
    createdAt: '2024-10-31',
    updatedAt: '2024-10-31',
    isReadOnly: true,
  },
  {
    id: 'dalio',
    name: '达里奥全天候策略',
    description: '桥水基金全天候投资组合参考',
    assets: [
      { id: '1', name: '股票', amount: 30, color: 'hsl(210, 45%, 60%)' },
      { id: '2', name: '长期国债', amount: 40, color: 'hsl(150, 45%, 60%)' },
      { id: '3', name: '中期国债', amount: 15, color: 'hsl(120, 45%, 60%)' },
      { id: '4', name: '大宗商品', amount: 7.5, color: 'hsl(30, 45%, 60%)' },
      { id: '5', name: '黄金', amount: 7.5, color: 'hsl(45, 45%, 60%)' },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isReadOnly: true,
  },
];

export default function AssetAllocationPage() {
  usePageTitle('资产配置占比');

  // 用户资产配置
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [myAssetsUpdatedAt, setMyAssetsUpdatedAt] = useState<string>('');

  // 当前查看的组合 ID（'my' 或名人模板 ID）
  const [currentViewId, setCurrentViewId] = useState<string>('my');

  // 表单状态
  const [assetName, setAssetName] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [error, setError] = useState('');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // UI 状态
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCelebrityDropdown, setShowCelebrityDropdown] = useState(false);

  // 当前查看的资产列表
  const isViewingMy = currentViewId === 'my';
  const currentCelebrity = CELEBRITY_PORTFOLIOS.find(p => p.id === currentViewId);
  const assets = isViewingMy ? myAssets : (currentCelebrity?.assets || []);
  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const isReadOnly = !isViewingMy;

  // 初始化：从 localStorage 加载数据
  useEffect(() => {
    const data = getLocalStorage(STORAGE_KEY, { myAssets: [], myAssetsUpdatedAt: '' });
    setMyAssets(data.myAssets);
    setMyAssetsUpdatedAt(data.myAssetsUpdatedAt);
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    setLocalStorage(STORAGE_KEY, {
      myAssets,
      myAssetsUpdatedAt,
    });
  }, [myAssets, myAssetsUpdatedAt]);

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

    setMyAssets(prev => [...prev, newAsset]);
    setMyAssetsUpdatedAt(new Date().toISOString().split('T')[0]);
    setAssetName('');
    setAssetAmount('');
  };

  const handleRemoveAsset = (id: string) => {
    setMyAssets(prev => prev.filter(asset => asset.id !== id));
    setMyAssetsUpdatedAt(new Date().toISOString().split('T')[0]);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetAmount(asset.amount.toString());
  };

  const handleUpdateAsset = () => {
    if (!editingAsset) return;

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

    setMyAssets(prev => prev.map(asset =>
      asset.id === editingAsset.id
        ? { ...asset, name: assetName.trim(), amount }
        : asset
    ));
    setMyAssetsUpdatedAt(new Date().toISOString().split('T')[0]);

    setEditingAsset(null);
    setAssetName('');
    setAssetAmount('');
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
    setAssetName('');
    setAssetAmount('');
    setError('');
  };

  const handleClear = () => {
    if (!confirm('确定要清空所有资产吗？')) {
      return;
    }
    setMyAssets([]);
    setMyAssetsUpdatedAt('');
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
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            资产配置占比
          </h2>
        </motion.div>

        {/* 视图切换器 */}
        <motion.div
          className="mb-8 flex items-center justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* 我的配置按钮 */}
          <button
            onClick={() => setCurrentViewId('my')}
            className={`px-4 py-2 rounded-lg transition-all ${isViewingMy
              ? 'bg-white/20 text-white border-2 border-white/40'
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
              }`}
          >
            我的资产配置
          </button>

          {/* 分隔线 */}
          <div className="h-8 w-px bg-white/20"></div>

          {/* 名人持仓下拉选择器 */}
          <div className="relative z-50">
            <button
              onClick={() => setShowCelebrityDropdown(!showCelebrityDropdown)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/15 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>名人持仓参考</span>
              <svg className={`w-4 h-4 transition-transform ${showCelebrityDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 下拉菜单 */}
            <AnimatePresence>
              {showCelebrityDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCelebrityDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 min-w-[280px] bg-gray-900 border border-white/30 rounded-lg shadow-2xl z-50 overflow-hidden"
                  >
                    {CELEBRITY_PORTFOLIOS.map((portfolio, index) => (
                      <button
                        key={portfolio.id}
                        onClick={() => {
                          setCurrentViewId(portfolio.id);
                          setShowCelebrityDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-white/15 transition-colors ${currentViewId === portfolio.id ? 'bg-white/20 text-white' : 'text-white/80'
                          } ${index !== CELEBRITY_PORTFOLIOS.length - 1 ? 'border-b border-white/10' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{portfolio.name}</div>
                          {portfolio.createdAt && (
                            <div className="text-xs text-white/40">{portfolio.createdAt}</div>
                          )}
                        </div>
                        {portfolio.description && (
                          <div className="text-xs text-white/50 mt-1">{portfolio.description}</div>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* 左侧：名人持仓或我的配置编辑 */}
          <GlowCard className="p-8">
            {isReadOnly ? (
              /* 对比模式：显示名人持仓饼图 */
              <div>
                <div className="mb-4 pb-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {currentCelebrity?.name}
                  </h3>
                  {currentCelebrity?.description && (
                    <p className="text-white/60 text-sm mt-2">{currentCelebrity.description}</p>
                  )}
                  {currentCelebrity?.createdAt && (
                    <p className="text-white/50 text-xs mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      录入时间：{currentCelebrity.createdAt}
                    </p>
                  )}
                </div>

                {/* 名人总资产 */}
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

                {/* 名人饼图 */}
                <PieChart
                  assets={assets}
                  totalAmount={totalAmount}
                  hoveredAsset={hoveredAsset}
                  onAssetHover={setHoveredAsset}
                />

                {/* 名人图例 */}
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
            ) : (
              /* 编辑模式：显示输入表单 */
              <div>
                {/* 输入表单 */}
                <div className="space-y-4 mb-6">
                  {editingAsset && (
                    <div className="bg-white/10 border border-white/30 rounded-lg p-3 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">正在编辑资产</span>
                        <button
                          onClick={handleCancelEdit}
                          className="text-white/70 hover:text-white text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}
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
                      onKeyDown={(e) => e.key === 'Enter' && (editingAsset ? handleUpdateAsset() : handleAddAsset())}
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
                      onKeyDown={(e) => e.key === 'Enter' && (editingAsset ? handleUpdateAsset() : handleAddAsset())}
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
                  <Button
                    variant="primary"
                    size="md"
                    onClick={editingAsset ? handleUpdateAsset : handleAddAsset}
                    className="flex-1"
                  >
                    {editingAsset ? '更新资产' : '添加资产'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleCopyData}
                    disabled={assets.length === 0}
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
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleClear}
                  >
                    清空
                  </Button>
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
                          className={`bg-white/5 rounded-lg p-4 border transition-all ${editingAsset?.id === asset.id
                            ? 'border-white/50 bg-white/10'
                            : 'border-white/10'
                            } flex items-center justify-between`}
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
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="text-white/60 hover:text-white transition-colors cursor-can-hover"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRemoveAsset(asset.id)}
                              className="text-white/60 hover:text-white transition-colors cursor-can-hover"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
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
            )}
          </GlowCard>

          {/* 右侧：我的配置饼图 */}
          <GlowCard className="p-8">
            {isReadOnly ? (
              /* 对比模式：显示我的配置饼图 */
              <div>
                <div className="mb-4 pb-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    我的资产配置
                  </h3>
                  <p className="text-white/60 text-sm mt-2">我的个人资产配置</p>
                  {myAssetsUpdatedAt && (
                    <p className="text-white/50 text-xs mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      录入时间：{myAssetsUpdatedAt}
                    </p>
                  )}
                </div>

                {/* 我的总资产 */}
                {myAssets.length > 0 ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 rounded-lg p-4 mb-6 text-center"
                    >
                      <div className="text-white/70 text-sm mb-1">总资产</div>
                      <div className="text-white text-3xl font-bold">
                        ¥{myAssets.reduce((sum, asset) => sum + asset.amount, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </motion.div>

                    {/* 我的饼图 */}
                    <PieChart
                      assets={myAssets}
                      totalAmount={myAssets.reduce((sum, asset) => sum + asset.amount, 0)}
                      hoveredAsset={hoveredAsset}
                      onAssetHover={setHoveredAsset}
                    />

                    {/* 我的图例 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-8 space-y-2"
                    >
                      <h3 className="text-sm font-semibold text-white/70 mb-3">图例</h3>
                      {myAssets.map((asset) => {
                        const myTotal = myAssets.reduce((sum, a) => sum + a.amount, 0);
                        const percentage = myTotal > 0 ? (asset.amount / myTotal) * 100 : 0;
                        return (
                          <div key={asset.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: asset.color }}
                              />
                              <span className="text-white">{asset.name}</span>
                            </div>
                            <span className="text-white/70">
                              {percentage.toFixed(2)}%
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-white/50 text-sm mb-4">你还没有配置资产</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentViewId('my')}
                    >
                      去添加资产
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* 编辑模式：显示当前配置的饼图 */
              <div>
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
            )}
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
