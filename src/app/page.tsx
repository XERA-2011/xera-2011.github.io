"use client";

// React的Suspense组件，用于处理加载状态并在内容加载时显示备用UI
import { Suspense } from 'react';
// 显示主要标题和介绍内容
import HeroSection from '@/components/sections/hero';
// 提供页面平滑滚动行为的组件
import SmoothScroll from '@/components/SmoothScroll';

// Fallback components for when animations are loading
const FallbackSection = () => (
  <div className="animate-pulse bg-white/5 rounded-xl h-40 w-full"></div>
);

export default function Home() {

  return (
    <SmoothScroll>
      <Suspense fallback={<FallbackSection />}>
        <HeroSection />
      </Suspense>
    </SmoothScroll>
  );
}
