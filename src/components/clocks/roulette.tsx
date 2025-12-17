"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 格式化数字，补零
 */
function pad(num: number) {
  return num.toString().padStart(2, "0");
}

// --- 核心修复 ---
// 容器尺寸: 300px (半径 150px)
// 边框宽度: 15px
// 轨道中心半径 = 150 - (15 / 2) = 142.5px
const RADIUS = 142.5;

interface ClockRouletteProps {
  className?: string;
  /** 
   * 静态展示模式的时间。
   * 格式: "10:10:30" 或 Date 对象。
   * 如果传入此值，动画将被禁用。
   */
  staticTime?: string | Date;
}

export default function ClockRoulette({ className, staticTime }: ClockRouletteProps) {
  const [mounted, setMounted] = React.useState(false);

  // 动态状态
  const [dynamicTime, setDynamicTime] = React.useState({
    time: "--:--:--",
    date: "---- 年 -- 月 -- 日",
  });

  // Refs (仅动态模式使用)
  const hourHandRef = React.useRef<HTMLDivElement>(null);
  const minHandRef = React.useRef<HTMLDivElement>(null);
  const secHandRef = React.useRef<HTMLDivElement>(null);

  // 记录圈数的 ref (解决 359->0 度的跳跃问题)
  const stateRef = React.useRef({
    secLoop: 0, minLoop: 0, hourLoop: 0,
    lastSecDeg: -1, lastMinDeg: -1, lastHourDeg: -1,
  });

  // 1. 静态数据计算
  const staticData = React.useMemo(() => {
    if (!staticTime) return null;
    const date = typeof staticTime === 'string' ? new Date(`2000-01-01T${staticTime}`) : staticTime;
    const s = date.getSeconds();
    const m = date.getMinutes();
    const h = date.getHours();

    const timeStr = `${pad(h)}:${pad(m)}:${pad(s)}`;
    // 静态模式日期如果不重要，可以固定显示或自定义，这里简单处理
    const dateStr = "STATIC MODE";

    // 计算角度 (静态不需要考虑 ms 和 平滑过渡圈数)
    const secDeg = s * 6;
    const minDeg = (m + s / 60) * 6;
    const hourDeg = ((h % 12) + m / 60) * 30;

    return {
      time: timeStr,
      date: dateStr,
      secDeg, minDeg, hourDeg
    };
  }, [staticTime]);

  // 2. 动态逻辑
  React.useEffect(() => {
    setMounted(true);
    if (staticTime) return; // 静态模式直接跳过

    let frameId: number;
    const updateClock = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();

      // 计算角度
      const currentSecDeg = (seconds + ms / 1000) * 6;
      const currentMinDeg = (minutes + seconds / 60 + ms / 60000) * 6;
      const currentHourDeg = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

      const state = stateRef.current;

      // 循环处理 (防止反转)
      if (state.lastSecDeg !== -1 && currentSecDeg < state.lastSecDeg - 180) state.secLoop++;
      state.lastSecDeg = currentSecDeg;
      if (state.lastMinDeg !== -1 && currentMinDeg < state.lastMinDeg - 180) state.minLoop++;
      state.lastMinDeg = currentMinDeg;
      if (state.lastHourDeg !== -1 && currentHourDeg < state.lastHourDeg - 180) state.hourLoop++;
      state.lastHourDeg = currentHourDeg;

      const finalSecDeg = currentSecDeg + state.secLoop * 360;
      const finalMinDeg = currentMinDeg + state.minLoop * 360;
      const finalHourDeg = currentHourDeg + state.hourLoop * 360;

      // 应用样式 (直接操作 DOM)
      if (secHandRef.current) secHandRef.current.style.transform = `translate(-50%, -50%) rotate(${finalSecDeg}deg) translateY(-${RADIUS}px)`;
      if (minHandRef.current) minHandRef.current.style.transform = `translate(-50%, -50%) rotate(${finalMinDeg}deg) translateY(-${RADIUS}px)`;
      if (hourHandRef.current) hourHandRef.current.style.transform = `translate(-50%, -50%) rotate(${finalHourDeg}deg) translateY(-${RADIUS}px)`;

      setDynamicTime({
        time: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
        date: `${now.getFullYear()} 年 ${pad(now.getMonth() + 1)} 月 ${pad(now.getDate())} 日`,
      });

      frameId = requestAnimationFrame(updateClock);
    };

    frameId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(frameId);
  }, [staticTime]);

  // 生成刻度 (静态资源，一次生成)
  const ticks = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const deg = i * 30;
      return (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 h-3.5 w-0.5 bg-foreground/40 z-5 rounded-full"
          style={{
            transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${RADIUS}px)`,
          }}
        />
      );
    });
  }, []);

  if (!mounted) {
    return (
      <div className={cn("relative mx-auto h-[300px] w-[300px] flex items-center justify-center bg-card rounded-full", className)}>
        <div className="h-full w-full rounded-full border-15 border-muted/10" />
      </div>
    );
  }

  // 决定显示的数据
  const displayTimeText = staticData ? staticData.time : dynamicTime.time;
  const displayDateText = staticData ? staticData.date : dynamicTime.date;

  // 辅助函数：获取指针样式
  const getHandStyle = (type: 'h' | 'm' | 's') => {
    if (!staticData) return {}; // 动态模式：样式由 JS 直接写 DOM，这里留空

    let deg = 0;
    if (type === 'h') deg = staticData.hourDeg;
    if (type === 'm') deg = staticData.minDeg;
    if (type === 's') deg = staticData.secDeg;

    return {
      transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${RADIUS}px)`
    };
  };

  return (
    <div
      className={cn(
        "relative mx-auto flex items-center justify-center font-sans overflow-hidden select-none",
        className
      )}
      style={{
        width: "300px",
        height: "300px"
      }}
    >
      {/* 光环容器 (圆环背景) */}
      <div className="relative box-border flex h-full w-full items-center justify-center rounded-full border-15 border-foreground/10 bg-transparent">

        {/* 中心文字 */}
        <div className="z-1 text-center pointer-events-none flex flex-col items-center">
          <div className="mb-1 text-[28px] font-bold tracking-[2px] text-foreground tabular-nums leading-none bg-background/60 px-2 py-1 rounded-md backdrop-blur-sm">
            {displayTimeText}
          </div>
          <div className="text-[10px] font-normal text-muted-foreground bg-background/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {displayDateText}
          </div>
        </div>

        {/* 刻度 */}
        {ticks}

        {/* 指针区域 */}

        {/* 时针球 (最大) */}
        <div
          ref={hourHandRef}
          className="absolute top-1/2 left-1/2 z-20 h-5 w-5 rounded-full bg-foreground shadow-[0_0_4px_rgba(0,0,0,0.6)]"
          style={getHandStyle('h')}
        />

        {/* 分针球 (中等) */}
        <div
          ref={minHandRef}
          className="absolute top-1/2 left-1/2 z-21 h-3.5 w-3.5 rounded-full bg-muted-foreground shadow-[0_0_4px_rgba(0,0,0,0.6)]"
          style={getHandStyle('m')}
        />

        {/* 秒针球 (最小，高亮) */}
        <div
          ref={secHandRef}
          className="absolute top-1/2 left-1/2 z-22 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_4px_rgba(0,0,0,0.6)]"
          style={getHandStyle('s')}
        />
      </div>
    </div>
  );
}
