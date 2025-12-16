"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 格式化数字，补零
 */
function pad(num: number) {
  return num.toString().padStart(2, "0");
}

export default function ClockRoulette({ className }: { className?: string }) {
  // 用于解决 Next.js 服务端渲染与客户端渲染的时间不一致问题 (Hydration Mismatch)
  const [mounted, setMounted] = React.useState(false);

  // 时间文字状态
  const [displayTime, setDisplayTime] = React.useState({
    time: "--:--:--",
    date: "---- 年 -- 月 -- 日",
  });

  // 使用 ref 直接操作 DOM 样式，避免每秒 60 帧的 React 重渲染，保证性能
  const hourHandRef = React.useRef<HTMLDivElement>(null);
  const minHandRef = React.useRef<HTMLDivElement>(null);
  const secHandRef = React.useRef<HTMLDivElement>(null);

  // 动画状态引用，用于在闭包中保持状态
  const stateRef = React.useRef({
    secLoop: 0,
    minLoop: 0,
    hourLoop: 0,
    lastSecDeg: -1,
    lastMinDeg: -1,
    lastHourDeg: -1,
  });

  React.useEffect(() => {
    setMounted(true);

    let frameId: number;

    const updateClock = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();

      // 计算带毫秒精度的角度
      const currentSecDeg = (seconds + ms / 1000) * 6;
      const currentMinDeg = (minutes + seconds / 60 + ms / 60000) * 6;
      const currentHourDeg = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

      const state = stateRef.current;

      // 检测并处理跨越 0 度时的循环计数
      if (state.lastSecDeg !== -1 && currentSecDeg < state.lastSecDeg - 180) state.secLoop++;
      state.lastSecDeg = currentSecDeg;

      if (state.lastMinDeg !== -1 && currentMinDeg < state.lastMinDeg - 180) state.minLoop++;
      state.lastMinDeg = currentMinDeg;

      if (state.lastHourDeg !== -1 && currentHourDeg < state.lastHourDeg - 180) state.hourLoop++;
      state.lastHourDeg = currentHourDeg;

      // 计算最终累计角度
      const finalSecDeg = currentSecDeg + state.secLoop * 360;
      const finalMinDeg = currentMinDeg + state.minLoop * 360;
      const finalHourDeg = currentHourDeg + state.hourLoop * 360;

      // 直接更新 CSS 变量或 transform，性能最优
      if (secHandRef.current) {
        secHandRef.current.style.transform = `translate(-50%, -50%) rotate(${finalSecDeg}deg) translateY(-150px)`;
      }
      if (minHandRef.current) {
        minHandRef.current.style.transform = `translate(-50%, -50%) rotate(${finalMinDeg}deg) translateY(-150px)`;
      }
      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `translate(-50%, -50%) rotate(${finalHourDeg}deg) translateY(-150px)`;
      }

      // 更新文字显示
      setDisplayTime({
        time: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
        date: `${now.getFullYear()} 年 ${pad(now.getMonth() + 1)} 月 ${pad(now.getDate())} 日`,
      });

      frameId = requestAnimationFrame(updateClock);
    };

    // 启动动画循环
    frameId = requestAnimationFrame(updateClock);

    // 清理函数
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  // 生成12个刻度
  const ticks = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const deg = i * 30;
      return (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 h-5 w-0.5 bg-foreground z-5"
          style={{
            transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-150px)`,
          }}
        />
      );
    });
  }, []);

  // 防止服务端渲染不一致
  if (!mounted) {
    return (
      <div className={cn("flex h-screen w-full items-center justify-center", className)}>
        <div className="h-80 w-[320px] rounded-full border-20" />
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen w-full items-center justify-center font-sans overflow-hidden", className)}>
      {/* 光环容器 */}
      <div className="relative box-border flex h-80 w-[320px] items-center justify-center rounded-full border-20 border-foreground/20 bg-transparent">

        {/* 中心文字显示 */}
        <div className="z-1 text-center pointer-events-none select-none">
          <div className="mb-[5px] text-[3em] font-bold tracking-[2px] text-foreground tabular-nums leading-none bg-background/60 px-3 py-1 rounded-md">
            {displayTime.time}
          </div>
          <div className="text-[1.1em] font-normal text-muted-foreground bg-background/40 px-3 py-0.5 rounded-md">
            {displayTime.date}
          </div>
        </div>

        {/* 刻度 */}
        {ticks}

        {/* 指针区域 */}

        {/* 时针球 */}
        <div
          ref={hourHandRef}
          className="absolute top-1/2 left-1/2 z-20 h-5 w-5 rounded-full bg-foreground shadow-[0_0_4px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        />

        {/* 分针球 */}
        <div
          ref={minHandRef}
          className="absolute top-1/2 left-1/2 z-21 h-3.5 w-3.5 rounded-full bg-muted-foreground shadow-[0_0_4px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        />

        {/* 秒针球 */}
        <div
          ref={secHandRef}
          className="absolute top-1/2 left-1/2 z-22 h-2 w-2 rounded-full bg-primary shadow-[0_0_4px_rgba(0,0,0,0.6)]"
        />
      </div>
    </div>
  );
}
