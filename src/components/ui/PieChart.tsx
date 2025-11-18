"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { div } from 'framer-motion/client';

interface Asset {
  id: string;
  name: string;
  amount: number;
}

interface PieChartProps {
  assets: Asset[];
  totalAmount: number;
}

export default function PieChart({ assets, totalAmount }: PieChartProps) {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [isHoveringChart, setIsHoveringChart] = useState(false);
  // 固定的白灰黑渐变色（10个颜色）
  const FIXED_COLORS = [
    '#FFFFFF', // 白色
    '#E0E0E0', // 浅灰1
    '#C0C0C0', // 浅灰2
    '#A0A0A0', // 浅灰3
    '#808080', // 中灰
    '#606060', // 深灰1
    '#484848', // 深灰2
    '#303030', // 深灰3
    '#181818', // 深灰4
    '#000000', // 纯黑色
  ];

  // 根据索引获取颜色
  const getColorByIndex = (index: number) => {
    return FIXED_COLORS[index % FIXED_COLORS.length];
  };

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
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
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
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
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

  // 反转颜色函数
  const invertColor = (hex: string) => {
    // 移除 # 号
    const cleanHex = hex.replace('#', '');

    // 转换为 RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // 反转 RGB 值
    const invertedR = 255 - r;
    const invertedG = 255 - g;
    const invertedB = 255 - b;

    // 转换回十六进制
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(invertedR)}${toHex(invertedG)}${toHex(invertedB)}`;
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
              className="cursor-can-hover"
              onMouseEnter={() => setIsHoveringChart(true)}
              onMouseLeave={() => setIsHoveringChart(false)}
            >
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
                    className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-2xl max-w-[200px]"
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
                ) : null}
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
            // 当鼠标在饼图上时，反转图例颜色
            const invertedColor = isHoveringChart ? invertColor(color) : color;
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
                        ? 'border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                        : 'border border-white/30'
                      }`}
                    style={{ backgroundColor: invertedColor }}
                  />
                  <span className={`text-white transition-all duration-200 ${isHovered ? 'font-semibold' : ''
                    }`}>
                    {asset.name}
                  </span>
                </div>
                <span className={`text-white/70 transition-all duration-200 ${isHovered ? 'text-white font-semibold' : ''
                  }`}>
                  {formatPercentage(getPercentage(asset.amount))}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
