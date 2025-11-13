"use client";

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initLenis, getLenis } from '@/utils/lenis';

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();

  useEffect(() => {
    initLenis();
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return <>{children}</>;
}
