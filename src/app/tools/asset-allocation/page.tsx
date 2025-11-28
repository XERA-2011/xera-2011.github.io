"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { usePageTitle } from '@/hooks/use-page-title';
import PieChart from '@/components/ui/pie-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getLocalStorage, setLocalStorage } from '@/utils/storage';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { TrendingUp, Copy, Check, Edit, X, ChevronDown, Lock, User, Calendar } from 'lucide-react';

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

  // 获取用户登录状态
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // 当前查看的资产列表
  const isViewingMy = currentViewId === 'my';
  const currentCelebrity = celebrityPortfolios.find(p => p.id === currentViewId);
  const assets = isViewingMy ? myAssets : (currentCelebrity?.assets || []);
  const totalAmount = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const isReadOnly = !isViewingMy;

  // 初始化：从数据库或 localStorage 加载用户数据
  useEffect(() => {
    const loadUserAssets = async () => {
      if (isLoggedIn) {
        // 如果已登录，从数据库加载
        try {
          const response = await fetch('/api/asset-allocation?type=user');
          const result = await response.json();

          if (result.success && result.data) {
            setMyAssets(result.data);
            setMyAssetsUpdatedAt(new Date().toISOString().split('T')[0]);
          }
        } catch (err) {
          console.error('加载用户资产配置失败:', err);
          // 如果加载失败，从 localStorage 加载
          const data = getLocalStorage(STORAGE_KEY, { myAssets: [], myAssetsUpdatedAt: '' });
          setMyAssets(data.myAssets);
          setMyAssetsUpdatedAt(data.myAssetsUpdatedAt);
        }
      } else {
        // 如果未登录，从 localStorage 加载
        const data = getLocalStorage(STORAGE_KEY, { myAssets: [], myAssetsUpdatedAt: '' });
        setMyAssets(data.myAssets);
        setMyAssetsUpdatedAt(data.myAssetsUpdatedAt);
      }
    };

    if (status !== 'loading') {
      loadUserAssets();
    }
  }, [isLoggedIn, status]);

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

  // 手动保存到 localStorage 和数据库
  const saveAssets = async (assets: Asset[], updatedAt: string) => {
    // 保存到 localStorage
    setLocalStorage(STORAGE_KEY, {
      myAssets: assets,
      myAssetsUpdatedAt: updatedAt,
    });

    // 如果已登录，同步到数据库
    if (isLoggedIn && assets.length >= 0) {
      try {
        setSyncStatus('syncing');
        await fetch('/api/asset-allocation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assets: assets.map(asset => ({
              name: asset.name,
              amount: asset.amount,
            })),
          }),
        });
        setSyncStatus('synced');
        // 2秒后重置状态
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (err) {
        console.error('同步到数据库失败:', err);
        setSyncStatus('idle');
      }
    }
  };


  const handleAddAsset = async () => {
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

    const updatedAssets = [...myAssets, newAsset];
    const updatedAt = new Date().toISOString().split('T')[0];

    setMyAssets(updatedAssets);
    setMyAssetsUpdatedAt(updatedAt);
    setAssetName('');
    setAssetAmount('');

    // 保存数据
    await saveAssets(updatedAssets, updatedAt);
  };

  const handleRemoveAsset = async (id: string) => {
    const updatedAssets = myAssets.filter(asset => asset.id !== id);
    const updatedAt = new Date().toISOString().split('T')[0];

    setMyAssets(updatedAssets);
    setMyAssetsUpdatedAt(updatedAt);

    // 保存数据
    await saveAssets(updatedAssets, updatedAt);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetAmount(asset.amount.toString());
  };

  const handleUpdateAsset = async () => {
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

    const updatedAssets = myAssets.map(asset =>
      asset.id === editingAsset.id
        ? { ...asset, name: assetName.trim(), amount }
        : asset
    );
    const updatedAt = new Date().toISOString().split('T')[0];

    setMyAssets(updatedAssets);
    setMyAssetsUpdatedAt(updatedAt);

    setEditingAsset(null);
    setAssetName('');
    setAssetAmount('');

    // 保存数据
    await saveAssets(updatedAssets, updatedAt);
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              资产配置占比
            </h2>
          </div>
          {isLoggedIn && syncStatus !== 'idle' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {syncStatus === 'syncing' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>正在同步到云端...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  <span>已同步到云端</span>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* 视图切换器 */}
        <motion.div
          className="mb-8 flex items-center justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* 我的配置按钮 */}
          <Button
            onClick={() => setCurrentViewId('my')}
            variant={isViewingMy ? 'default' : 'outline'}
            className="gap-2"
          >
            <User className="w-4 h-4" />
            我的资产配置
          </Button>

          {/* 分隔线 */}
          <Separator orientation="vertical" className="h-8" />

          {/* 名人持仓下拉选择器 */}
          <div className="relative">
            <Button
              onClick={() => setShowCelebrityDropdown(!showCelebrityDropdown)}
              variant="outline"
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>名人持仓参考</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCelebrityDropdown ? 'rotate-180' : ''}`} />
            </Button>

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
                    className="absolute top-full mt-2 left-0 min-w-[280px] bg-card border border-border rounded-lg shadow-2xl z-5 overflow-hidden"
                  >
                    {isLoadingCelebrity ? (
                      <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                        加载中...
                      </div>
                    ) : celebrityPortfolios.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground text-sm">
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
                          className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 ${currentViewId === portfolio.id ? 'bg-accent' : ''
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{portfolio.name}</div>
                            {portfolio.createdAt && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {portfolio.createdAt}
                              </Badge>
                            )}
                          </div>
                          {portfolio.description && (
                            <div className="text-xs text-muted-foreground mt-1">{portfolio.description}</div>
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
          <Card>
            {isReadOnly ? (
              /* 对比模式：显示名人持仓饼图 */
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {currentCelebrity?.name}
                  </CardTitle>
                  {currentCelebrity?.description && (
                    <CardDescription>{currentCelebrity.description}</CardDescription>
                  )}
                  {currentCelebrity?.createdAt && (
                    <div className="text-muted-foreground text-xs flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3" />
                      录入时间：{currentCelebrity.createdAt}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {/* 名人饼图 */}
                  <PieChart
                    assets={assets}
                    totalAmount={totalAmount}
                  />
                </CardContent>
              </>
            ) : (
              /* 编辑模式：显示输入表单 */
              <CardContent className="p-8">
                {/* 输入表单 */}
                <div className="space-y-4 mb-6">
                  {editingAsset && (
                    <div className="bg-accent border border-border rounded-lg p-3 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">正在编辑资产</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="assetName">资产名称</Label>
                    <Input
                      id="assetName"
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="例如：股票、债券、现金..."
                      onKeyDown={(e) => e.key === 'Enter' && (editingAsset ? handleUpdateAsset() : handleAddAsset())}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assetAmount">金额</Label>
                    <Input
                      id="assetAmount"
                      type="number"
                      value={assetAmount}
                      onChange={(e) => setAssetAmount(e.target.value)}
                      placeholder="请输入金额"
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
                    className="mb-4 p-3 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-4 mb-8">
                  <Button
                    onClick={editingAsset ? handleUpdateAsset : handleAddAsset}
                    className="flex-1"
                  >
                    {editingAsset ? '更新资产' : '添加资产'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCopyData}
                    disabled={assets.length === 0}
                  >
                    {copySuccess ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        已复制
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        复制
                      </span>
                    )}
                  </Button>
                </div>

                {/* 资产列表 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
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
                          className={`bg-secondary rounded-lg p-4 border transition-all ${editingAsset?.id === asset.id
                            ? 'border-primary bg-accent'
                            : 'border-border'
                            } flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {asset.name}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {formatCurrency(asset.amount)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {formatPercentage(getPercentage(asset.amount))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAsset(asset)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAsset(asset.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {assets.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        暂无资产，请添加
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 右侧：我的配置饼图 */}
          <Card>
            {isReadOnly ? (
              /* 对比模式：显示我的配置饼图 */
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    我的资产配置
                  </CardTitle>
                  <CardDescription>我的个人资产配置</CardDescription>
                  {myAssetsUpdatedAt && (
                    <div className="text-muted-foreground text-xs flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3" />
                      录入时间：{myAssetsUpdatedAt}
                    </div>
                  )}
                </CardHeader>
                <CardContent>

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
                    <div className="text-center py-20">
                      <TrendingUp className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground text-base mb-5">你还没有配置资产</p>
                      <Button
                        size="sm"
                        onClick={() => setCurrentViewId('my')}
                      >
                        去添加资产
                      </Button>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              /* 编辑模式：显示当前配置的饼图 */
              <CardContent>
                {/* 饼图 */}
                <PieChart
                  assets={assets}
                  totalAmount={totalAmount}
                />
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
