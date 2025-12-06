"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Asset {
  id: string;
  name: string;
  amount?: number; // 用户资产：金额
  percentage?: number; // 名人持仓：百分比
}

interface PieChartProps {
  assets: Asset[];
  totalAmount?: number; // 用户资产需要传入总金额
  usePercentage?: boolean; // 是否使用百分比模式
  theme?: 'light' | 'dark'; // 主题：浅色或深色
}

export default function PieChart({ assets, totalAmount, usePercentage = false, theme = 'light' }: PieChartProps) {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [isHoveringChart, setIsHoveringChart] = useState(false);
  // 固定的白灰黑渐变色（15个颜色），已优化以避免纯白和纯黑
  const FIXED_COLORS = [
    '#F0F0F0', // 浅灰白
    '#E8E8E8', // 浅灰1
    '#D0D0D0', // 浅灰2
    '#B8B8B8', // 浅灰3
    '#A0A0A0', // 浅灰4
    '#888888', // 中灰1
    '#707070', // 中灰2
    '#585858', // 中灰3
    '#484848', // 深灰1
    '#383838', // 深灰2
    '#282828', // 深灰3
    '#202020', // 深灰4
    '#181818', // 深灰5
    '#101010', // 深灰6
    '#080808', // 深灰黑
  ];

  // 根据索引获取颜色
  const getColorByIndex = (index: number) => {
    return FIXED_COLORS[index % FIXED_COLORS.length];
  };

  const getPercentage = (asset: Asset) => {
    // 如果是百分比模式，直接返回百分比
    if (usePercentage && asset.percentage !== undefined) {
      return asset.percentage;
    }
    // 否则根据金额计算百分比
    if (asset.amount !== undefined && totalAmount && totalAmount > 0) {
      return (asset.amount / totalAmount) * 100;
    }
    return 0;
  };

  // 生成饼图的SVG路径
  const generatePieChart = () => {
    if (assets.length === 0) return null;

    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 10;
    let currentAngle = -90; // 从顶部开始

    return assets.map((asset, index) => {
      const percentage = getPercentage(asset);
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const color = getColorByIndex(index);

      currentAngle = endAngle;

      // 如果是完整的圆（100%），使用circle元素
      if (angle >= 359.99) {
        return (
          <g key={asset.id}>
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill={color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: hoveredAsset === asset.id ? 1.03 : 1
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: hoveredAsset === asset.id ? 0.25 : 0.5,
                delay: hoveredAsset === asset.id ? undefined : index * 0.1,
                ease: hoveredAsset === asset.id ? "easeInOut" : undefined
              }}
              className="cursor-pointer"
              filter={hoveredAsset === asset.id ? theme === 'dark' ? 'url(#pieShadowBlackTheme)' : 'url(#pieShadowWhiteTheme)' : undefined}
              onMouseEnter={() => setHoveredAsset(asset.id)}
              onMouseLeave={() => setHoveredAsset(null)}
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
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: hoveredAsset === asset.id ? 1.03 : 1
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: hoveredAsset === asset.id ? 0.25 : 0.5,
              delay: hoveredAsset === asset.id ? undefined : index * 0.1,
              ease: hoveredAsset === asset.id ? "easeInOut" : undefined
            }}
            className="cursor-pointer"
            filter={hoveredAsset === asset.id ? theme === 'dark' ? 'url(#pieShadowBlackTheme)' : 'url(#pieShadowWhiteTheme)' : undefined}
            onMouseEnter={() => setHoveredAsset(asset.id)}
            onMouseLeave={() => setHoveredAsset(null)}
          />
        </g>
      );
    });
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };


  // 计算颜色亮度（sRGB 线性化后计算相对亮度）
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const srgb = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

    const R = srgb(r);
    const G = srgb(g);
    const B = srgb(b);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  // 根据颜色返回合适的描边颜色（浅色使用暗描边，深色使用亮描边）
  const getStrokeByColor = (hex: string) => {
    const lum = getLuminance(hex);
    if (lum > 0.85) return 'rgba(0,0,0,0.12)';
    return 'rgba(255,255,255,0.16)';
  };

  return (
    <div>
      <div className="flex justify-center items-center relative" style={{ isolation: 'isolate', zIndex: 0 }}>
        {assets.length > 0 ? (
          <>
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              style={{ position: 'relative', zIndex: 1 }}
              onMouseEnter={() => setIsHoveringChart(true)}
              onMouseLeave={() => setIsHoveringChart(false)}
            >
              <defs>
                <filter id="pieShadowWhiteTheme" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="8" floodColor="#000" floodOpacity="0.4" />
                </filter>
                <filter id="pieShadowBlackTheme" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="8" floodColor="#FFF" floodOpacity="0.7" />
                </filter>
              </defs>
              <AnimatePresence>
                {generatePieChart()}
              </AnimatePresence>
            </svg>
            {/* 中心悬停提示信息 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
              <AnimatePresence mode="wait">
                {hoveredAsset ? (
                  <motion.div
                    key={hoveredAsset}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border shadow-2xl max-w-[200px]"
                  >
                    {(() => {
                      const assetIndex = assets.findIndex(a => a.id === hoveredAsset);
                      const asset = assets[assetIndex];
                      if (!asset) return null;
                      return (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getColorByIndex(assetIndex) }}
                            />
                            <div className="font-semibold text-base truncate">{asset.name}</div>
                          </div>
                          {!usePercentage && asset.amount !== undefined && (
                            <div className="text-muted-foreground text-xs mb-1">
                              ¥{asset.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                          <div className="text-xl font-bold">
                            {getPercentage(asset).toFixed(2)}%
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-20">
            <svg className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <p>添加资产后将显示饼图</p>
          </div>
        )}
      </div>

      {/* 图例 */}
      {assets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-2"
        >
          {assets.map((asset, index) => {
            const color = getColorByIndex(index);
            const isHovered = hoveredAsset === asset.id;

            return (
              <div
                key={asset.id}
                className={`flex items-center justify-between text-sm transition-all duration-200 ${isHovered ? 'scale-105' : ''
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${isHovered
                      ? 'border-2 border-primary shadow-[0_0_12px_rgba(128,128,128,0.5)]'
                      : 'border border-border'
                      }`}
                    style={{ backgroundColor: color }}
                  />
                  <span className={`transition-all duration-200 ${isHovered ? 'font-semibold' : ''
                    }`}>
                    {asset.name}
                  </span>
                </div>
                <span className={`text-muted-foreground transition-all duration-200 ${isHovered ? 'text-foreground font-semibold' : ''
                  }`}>
                  {formatPercentage(getPercentage(asset))}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
