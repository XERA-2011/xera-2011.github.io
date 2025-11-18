"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTitle } from '@/hooks/use-page-title';
import PieChart from '@/components/ui/PieChart';
import GlowCard from '@/components/ui/GlowCard';
import Button from '@/components/ui/Button';
import { getLocalStorage, setLocalStorage } from '@/utils/storage';
import { formatCurrency, formatPercentage } from '@/utils/format';

interface Asset {
  id: string;
  name: string;
  amount: number;
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

export default function AssetAllocationPage() {
  usePageTitle('资产配置占比');

  // 用户资产配置
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [myAssetsUpdatedAt, setMyAssetsUpdatedAt] = useState<string>('');

  // 名人持仓数据
  const [celebrityPortfolios, setCelebrityPortfolios] = useState<Portfolio[]>([]);
  const [isLoadingCelebrity, setIsLoadingCelebrity] = useState(true);

  // 当前查看的组合 ID（'my' 或名人模板 ID）
  const [currentViewId, setCurrentViewId] = useState<string>('my');

  // 表单状态
  const [assetName, setAssetName] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [error, setError] = useState('');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // UI 状态
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCelebrityDropdown, setShowCelebrityDropdown] = useState(false);

  // 当前查看的资产列表
  const isViewingMy = currentViewId === 'my';
  const currentCelebrity = celebrityPortfolios.find(p => p.id === currentViewId);
  const assets = isViewingMy ? myAssets : (currentCelebrity?.assets || []);
  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const isReadOnly = !isViewingMy;

  // 初始化：从 localStorage 加载用户数据
  useEffect(() => {
    const data = getLocalStorage(STORAGE_KEY, { myAssets: [], myAssetsUpdatedAt: '' });
    setMyAssets(data.myAssets);
    setMyAssetsUpdatedAt(data.myAssetsUpdatedAt);
  }, []);

  // 初始化：从 API 加载名人持仓数据
  useEffect(() => {
    const fetchCelebrityPortfolios = async () => {
      try {
        setIsLoadingCelebrity(true);
        const response = await fetch('/api/asset-allocation?type=celebrity');
        const result = await response.json();

        if (result.success && result.data) {
          setCelebrityPortfolios(result.data);
        }
      } catch (err) {
        console.error('加载名人持仓数据失败:', err);
      } finally {
        setIsLoadingCelebrity(false);
      }
    };

    fetchCelebrityPortfolios();
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    setLocalStorage(STORAGE_KEY, {
      myAssets,
      myAssetsUpdatedAt,
    });
  }, [myAssets, myAssetsUpdatedAt]);


  const handleAddAsset = () => {
    setError('');

    // 检查是否已达到最大数量限制
    if (myAssets.length >= 15) {
      setError('最多只能配置15个资产');
      return;
    }

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
      `总资产：${formatCurrency(totalAmount)}`,
      '',
      ...assets.map((asset) => {
        const percentage = formatPercentage(getPercentage(asset.amount));
        const amount = formatCurrency(asset.amount, { showSymbol: false });
        return `${asset.name}：¥${amount} (${percentage})`;
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
                    {isLoadingCelebrity ? (
                      <div className="px-4 py-8 text-center text-white/50 text-sm">
                        加载中...
                      </div>
                    ) : celebrityPortfolios.length === 0 ? (
                      <div className="px-4 py-8 text-center text-white/50 text-sm">
                        暂无数据
                      </div>
                    ) : (
                      celebrityPortfolios.map((portfolio) => (
                        <button
                          key={portfolio.id}
                          onClick={() => {
                            setCurrentViewId(portfolio.id);
                            setShowCelebrityDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/15 transition-colors border-b border-white/10 last:border-b-0 ${currentViewId === portfolio.id ? 'bg-white/20 text-white' : 'text-white/80'
                            }`}
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
                      ))
                    )}
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

                {/* 名人饼图 */}
                <PieChart
                  assets={assets}
                  totalAmount={totalAmount}
                />
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
                    资产列表 {assets.length > 0 && `(${assets.length}/15)`}
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
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium truncate">
                                {asset.name}
                              </div>
                              <div className="text-white/60 text-sm">
                                {formatCurrency(asset.amount)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">
                                {formatPercentage(getPercentage(asset.amount))}
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
                    {/* 我的饼图 */}
                    <PieChart
                      assets={myAssets}
                      totalAmount={myAssets.reduce((sum, asset) => sum + asset.amount, 0)}
                    />
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
                {/* 饼图 */}
                <PieChart
                  assets={assets}
                  totalAmount={totalAmount}
                />
              </div>
            )}
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}
