"use client";

// React的Suspense组件，用于处理加载状态并在内容加载时显示备用UI
import { Suspense } from 'react';
// 显示主要标题和介绍内容
import HeroSection from '@/components/sections/hero';

// Fallback components for when animations are loading
const FallbackSection = () => (
  <div className="animate-pulse bg-muted/50 rounded-xl h-40 w-full"></div>
);

export default function Home() {
  return (
    <Suspense fallback={<FallbackSection />}>
      <HeroSection />
    </Suspense>
  );
}
