"use client";

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * SmoothScroll Component
 * 
 * 核心功能 / Core Functions:
 * 1. 启用平滑滚动 (Lenis Initialization): 接管原生滚动，提供惯性滚动体验。
 * 2. 处理页面切换 (Route Change Handling): 监听 pathname 变化，自动重置滚动到顶部。
 * 3. 布局重算 (Layout Recalculation): 路由切换时强制调用 lenis.resize()，防止出现白屏或高度计算错误。
 * 4. 生命周期管理 (Lifecycle Management): 使用 useRef 隔离实例，避免 React Strict Mode 下的重复创建冲突。
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    // RAF loop
    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    const lenis = lenisRef.current;
    if (lenis) {
      // Immediate scroll reset
      lenis.scrollTo(0, { immediate: true });

      // Force resize to ensure layout is updated
      const raf = requestAnimationFrame(() => {
        lenis.resize();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [pathname]);

  return <>{children}</>;
}
