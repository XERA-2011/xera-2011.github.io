"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Image from 'next/image';
import Logo from '@/components/ui/Logo';
import { useApp } from '@/contexts/AppContext';

interface CurrentTime {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HeroSection() {
  const logoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState<CurrentTime>({
    year: 0,
    month: 0,
    day: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const { setIsMenuActive } = useApp();

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      logoRef.current,
      { scale: 0, rotation: -45 },
      { scale: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" }
    );
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();

      setCurrentTime({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
      });
    };

    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-30" />

      {/* Logo Section */}
      <div className="mb-8 hover:scale-105 transition-transform duration-300 transition-all duration-300 backdrop-blur-md">
        <motion.div
          ref={logoRef}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          onClick={() => setIsMenuActive(true)}
          className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full cursor-pointer"
        >
          {/* Background container */}
          <div className="absolute inset-0 rounded-full">
            {/* Initial state */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, transparent 60%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0.3) 80%, transparent 90%)',
                boxShadow: '0 0 40px rgba(255,255,255,0.2), inset 0 0 40px rgba(255,255,255,0.05)'
              }}
              animate={{ opacity: isHovered ? 0 : 1 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
            {/* Hover state */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, white 60%, rgba(255,255,255,0.7) 75%, transparent 90%)',
                boxShadow: '0 0 50px rgba(255,255,255,0.3)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          {/* X logo */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: isHovered ? 1.6 : 1 }}
            transition={{ duration: 0.8 }}
          >
            <Logo
              className={`w-1/2 h-1/2 ${isHovered ? 'text-black' : 'text-white'}`}
              variant={isHovered ? 'black' : 'white'}
              animate={true}
              animationDelay={0.5}
              strokeWidth={12}
              isHovered={isHovered}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* 时间显示 */}
      <div className="space-y-8">
        {/* 日期 */}
        <motion.div
          className="text-white/80 text-2xl sm:text-3xl lg:text-4xl font-light tracking-wider"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {currentTime.year}.{formatNumber(currentTime.month)}.{formatNumber(currentTime.day)}
        </motion.div>

        {/* 时间 - 重点显示 */}
        <motion.div
          className="flex justify-center items-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* 小时 */}
            <div className="relative">
              <motion.span
                className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent tabular-nums"
                key={`hours-${currentTime.hours}`}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatNumber(currentTime.hours)}
              </motion.span>
            </div>

            {/* 分隔符 */}
            <motion.span
              className="text-5xl sm:text-6xl lg:text-7xl text-white/60"
            >
              :
            </motion.span>

            {/* 分钟 */}
            <div className="relative">
              <motion.span
                className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent tabular-nums"
                key={`minutes-${currentTime.minutes}`}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {formatNumber(currentTime.minutes)}
              </motion.span>
            </div>

            {/* 分隔符 */}
            <motion.span
              className="text-5xl sm:text-6xl lg:text-7xl text-white/60"
            >
              :
            </motion.span>

            {/* 秒 */}
            <div className="relative">
              <motion.span
                className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-transparent tabular-nums"
                key={`seconds-${currentTime.seconds}`}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {formatNumber(currentTime.seconds)}
              </motion.span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12"
        >
          <Image
            alt="github-snake"
            src="/api/github-snake"
            width={800}
            height={200}
            style={{ width: "auto", height: "auto" }}
            priority
            unoptimized
          />
        </motion.div>
      </div>
    </section>
  );
}
