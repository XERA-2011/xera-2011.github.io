"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Time from '@/components/ui/Time';
import { getApiUrl } from '@/utils/api';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 根据环境选择 SVG 源
  const [snakeSvgSrc, setSnakeSvgSrc] = useState('');

  useEffect(() => {
    setSnakeSvgSrc(getApiUrl('/api/github-snake'));
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-30" />

      {/* 时间显示（包含时钟） */}
      <Time />

      {snakeSvgSrc && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-2"
        >
          <Image
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
