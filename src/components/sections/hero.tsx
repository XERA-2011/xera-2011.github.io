"use client";

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useApp } from "@/contexts/AppContext";
import Clock from '@/components/clocks/jump';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const { setIsMenuActive } = useApp();
  const [mounted, setMounted] = useState(false);

  // 等待客户端挂载后再使用主题
  useEffect(() => {
    setMounted(true);
  }, []);

  // 根据主题获取对应的 SVG
  const currentTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark';
  const svgFile = currentTheme === 'light'
    ? 'snake-light.svg'
    : 'snake-dark.svg';
  const snakeSvgSrc = `/api/redirect?url=${encodeURIComponent(
    `https://cdn.jsdelivr.net/gh/XERA-2011/x-actions@output/${svgFile}`
  )}`;

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative flex-1 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pb-6"
    >
      <Clock onClick={() => setIsMenuActive(true)} className='cursor-can-hover' />

      {snakeSvgSrc && (
        <motion.div
          key={currentTheme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-2"
        >
          <Image
            key={currentTheme}
            alt="github-snake"
            src={snakeSvgSrc}
            width={800}
            height={200}
            style={{ width: "auto", height: "auto" }}
            priority
            unoptimized
          />
        </motion.div>
      )}
    </section>
  );
}
