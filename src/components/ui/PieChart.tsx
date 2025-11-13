"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface Asset {
  id: string;
  name: string;
  amount: number;
  color: string;
}

interface PieChartProps {
  assets: Asset[];
  totalAmount: number;
  hoveredAsset: string | null;
  onAssetHover: (assetId: string | null) => void;
}

export default function PieChart({ assets, totalAmount, hoveredAsset, onAssetHover }: PieChartProps) {
  const getPercentage = (amount: number) => {
    if (totalAmount === 0) return 0;
    return (amount / totalAmount) * 100;
  };

  // 生成饼图的SVG路径
  const generatePieChart = () => {
    if (assets.length === 0) return null;

    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 10;
    let currentAngle = -90; // 从顶部开始

    return assets.map((asset, index) => {
      const percentage = getPercentage(asset.amount);
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle = endAngle;

      // 如果是完整的圆（100%），使用circle元素
      if (angle >= 359.99) {
        return (
          <g key={asset.id}>
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill={asset.color}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onMouseEnter={() => onAssetHover(asset.id)}
              onMouseLeave={() => onAssetHover(null)}
            />
          </g>
        );
      }

      // 转换为弧度
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // 计算路径点
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      return (
        <g key={asset.id}>
          <motion.path
            d={pathData}
            fill={asset.color}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            onMouseEnter={() => onAssetHover(asset.id)}
            onMouseLeave={() => onAssetHover(null)}
          />
        </g>
      );
    });
  };

  return (
    <div className="flex justify-center items-center relative">
      {assets.length > 0 ? (
        <>
          <svg width="300" height="300" viewBox="0 0 300 300">
            <AnimatePresence>
              {generatePieChart()}
            </AnimatePresence>
          </svg>
          {/* 中心悬停提示信息 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {hoveredAsset ? (
                <motion.div
                  key={hoveredAsset}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-2xl max-w-[200px]"
                >
                  {(() => {
                    const asset = assets.find(a => a.id === hoveredAsset);
                    if (!asset) return null;
                    return (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: asset.color }}
                          />
                          <div className="text-white font-semibold text-base truncate">{asset.name}</div>
                        </div>
                        <div className="text-white/70 text-xs mb-1">
                          ¥{asset.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-white text-xl font-bold">
                          {getPercentage(asset.amount).toFixed(2)}%
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white/40 text-sm"
                >
                  悬停查看详情
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="text-center text-white/50 py-20">
          <svg className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p>添加资产后将显示饼图</p>
        </div>
      )}
    </div>
  );
}
