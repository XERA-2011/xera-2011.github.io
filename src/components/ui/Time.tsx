"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';

interface CurrentTime {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export default function Time() {
  const clockRef = useRef<HTMLDivElement>(null);
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minHandRef = useRef<HTMLDivElement>(null);
  const secHandRef = useRef<HTMLDivElement>(null);
  const { setIsMenuActive } = useApp();

  const [currentTime, setCurrentTime] = useState<CurrentTime>({
    year: 0,
    month: 0,
    day: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });

  useEffect(() => {
    // 动态生成刻度
    const clock = clockRef.current;
    if (clock) {
      for (let i = 0; i < 60; i++) {
        const marker = document.createElement('div');
        marker.className = 'absolute w-full h-full';
        marker.style.transform = `rotate(${i * 6}deg)`;
        marker.style.padding = '10px';
        marker.style.textAlign = 'center';

        const span = document.createElement('span');
        span.className = `block mx-auto ${i % 5 === 0 ? 'w-[1.5px] h-[4%] bg-white' : 'w-[1px] h-[3%] bg-[#444444]'}`;

        marker.appendChild(span);
        clock.appendChild(marker);
      }
    }

    // 统一的时间更新逻辑
    function updateTime() {
      const now = new Date();

      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();
      const milliseconds = now.getMilliseconds();

      // 更新状态（用于数字显示）
      setCurrentTime({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hours,
        minutes,
        seconds,
        milliseconds
      });

      // 更新时钟指针
      const secDeg = (seconds + milliseconds / 1000) * 6;
      const minDeg = (minutes + seconds / 60) * 6;
      const hourDeg = ((hours % 12) + minutes / 60) * 30;

      if (secHandRef.current) {
        secHandRef.current.style.transform = `rotate(${secDeg}deg)`;
      }
      if (minHandRef.current) {
        minHandRef.current.style.transform = `rotate(${minDeg}deg)`;
      }
      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hourDeg}deg)`;
      }
    }

    // 使用 requestAnimationFrame 实现平滑动画
    let animationId: number;
    function animate() {
      updateTime();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="space-y-8">
      {/* 时钟 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex justify-center"
      >
        <div
          className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => setIsMenuActive(true)}
        >
          <div className="relative w-full h-full flex items-center justify-center cursor-can-hover">
            {/* 时钟表盘 */}
            <div
              ref={clockRef}
              className="relative w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center"
              style={{
                boxShadow: `
                  0 0 20px rgba(255, 255, 255, 0.15),
                  0 0 40px rgba(255, 255, 255, 0.1),
                  0 0 60px rgba(255, 255, 255, 0.05),
                  inset 0 0 10px rgba(0, 0, 0, 0.8),
                  inset 0 0 20px rgba(255, 255, 255, 0.05)
                `
              }}
            >
              {/* 日期 */}
              <div className="absolute top-[58%] left-1/2 -translate-x-1/2 z-[5]">
                <span className="text-white/70 text-[8px] sm:text-[10px] font-light tracking-tight whitespace-nowrap">
                  {currentTime.year}.{formatNumber(currentTime.month)}.{formatNumber(currentTime.day)}
                </span>
              </div>

              {/* 中心圆点 */}
              <div
                className="absolute w-[4%] h-[4%] bg-white rounded-full z-[13]"
                style={{
                  boxShadow: '0 0 4px rgba(255, 255, 255, 0.4)'
                }}
              />

              {/* 时针 */}
              <div
                ref={hourHandRef}
                className="absolute bottom-1/2 left-1/2 w-[3px] h-[23%] bg-white z-10"
                style={{
                  transformOrigin: 'bottom center',
                  marginLeft: '-1.5px'
                }}
              />

              {/* 分针 */}
              <div
                ref={minHandRef}
                className="absolute bottom-1/2 left-1/2 w-[2px] h-[31%] bg-white z-[11]"
                style={{
                  transformOrigin: 'bottom center',
                  marginLeft: '-1px'
                }}
              />

              {/* 秒针 */}
              <div
                ref={secHandRef}
                className="absolute bottom-1/2 left-1/2 w-[1px] h-[37%] bg-[#aaaaaa] z-[12]"
                style={{
                  transformOrigin: 'bottom center',
                  marginLeft: '-0.5px'
                }}
              >
                <div className="absolute bottom-[-6%] left-[-1.5px] w-[4px] h-[6%] bg-[#aaaaaa]" />
              </div>
            </div>
          </div>
        </div>
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
          <motion.span className="text-5xl sm:text-6xl lg:text-7xl text-white/60">
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
          <motion.span className="text-5xl sm:text-6xl lg:text-7xl text-white/60">
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
    </div>
  );
}
