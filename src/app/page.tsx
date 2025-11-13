"use client";

// React的Suspense组件，用于处理加载状态并在内容加载时显示备用UI
import { Suspense } from 'react';
// 显示主要标题和介绍内容
import HeroSection from '@/components/sections/hero';
// 提供页面平滑滚动行为的组件
import SmoothScroll from '@/components/SmoothScroll';
// 处理页面之间导航时的过渡动画组件
import PageTransition from '@/components/PageTransition';
// 滚动时更新 URL hash
import { useScrollHash } from '@/hooks/use-scroll-hash';
// 导航配置
import { getHomeSections } from '@/components/header/config';

// Fallback components for when animations are loading
const FallbackSection = () => (
  <div className="animate-pulse bg-white/5 rounded-xl h-40 w-full"></div>
);

export default function Home() {
  // 使用 header 配置的 section 定义
  const sections = getHomeSections();

  // 使用滚动 hash 更新功能
  useScrollHash(sections);

  return (
    <SmoothScroll>
      <PageTransition>
        <Suspense fallback={<FallbackSection />}>
          <HeroSection />
        </Suspense>
      </PageTransition>
    </SmoothScroll>
  );
}
