"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

/**
 * 扩展 React 的 CSSProperties 以支持自定义 CSS 变量
 */
interface SolarSystemCSSProperties extends React.CSSProperties {
  "--clock-size"?: string | number;
  "--deg"?: string | number;
}

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}

export interface ClockSolarProps {
  className?: string;
  /** 自定义容器大小，默认 300px */
  size?: string | number;
}

export default function ClockSolar({ className, size = "300px" }: ClockSolarProps) {
  const { setIsMenuActive } = useApp();
  const [mounted, setMounted] = React.useState(false);

  // 使用 Ref 获取 DOM 元素
  const hourHandRef = React.useRef<HTMLDivElement>(null);
  const minHandRef = React.useRef<HTMLDivElement>(null);
  const secHandRef = React.useRef<HTMLDivElement>(null);
  const timeTextRef = React.useRef<HTMLDivElement>(null);
  const dateTextRef = React.useRef<HTMLDivElement>(null);

  // 动画状态保持 (闭包变量)
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
      const year = now.getFullYear();

      // --- 动画角度计算逻辑 ---
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

      const finalSecDeg = currentSecDeg + state.secLoop * 360;
      const finalMinDeg = currentMinDeg + state.minLoop * 360;
      const finalHourDeg = currentHourDeg + state.hourLoop * 360;

      // --- 直接更新 DOM 样式 ---
      if (secHandRef.current) secHandRef.current.style.setProperty("--deg", `${finalSecDeg}deg`);
      if (minHandRef.current) minHandRef.current.style.setProperty("--deg", `${finalMinDeg}deg`);
      if (hourHandRef.current) hourHandRef.current.style.setProperty("--deg", `${finalHourDeg}deg`);

      // --- 更新文字 ---
      if (timeTextRef.current) {
        timeTextRef.current.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      }
      if (dateTextRef.current) {
        dateTextRef.current.textContent = `${year}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;
      }

      frameId = requestAnimationFrame(updateClock);
    };

    frameId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex h-[300px] w-[300px] items-center justify-center overflow-hidden", className)}>
        <div className="h-[200px] w-[200px] rounded-full border border-white/20" />
      </div>
    );
  }

  // 定义核心尺寸变量
  const cssVariables: SolarSystemCSSProperties = {
    "--clock-size": size,
  };

  // 生成行星样式的辅助函数
  const getPlanetStyle = (radiusFactor: number): SolarSystemCSSProperties => ({
    transform: `translate(-50%, -50%) rotate(var(--deg)) translateY(calc(var(--clock-size) * ${radiusFactor})) rotate(calc(var(--deg) * -1))`,
    "--deg": "0deg", // 初始值，防止TS报错，实际由JS接管
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className={cn(
        "relative flex items-center justify-center rounded-full select-none overflow-hidden transition-colors duration-300 cursor-pointer",
        className
      )}
      style={{
        width: size,
        height: size,
        // 移除了 maxWidth/maxHeight 限制
      }}
      onClick={() => setIsMenuActive(true)}
    >
      {/* 太阳系容器 */}
      <div
        className="relative flex items-center justify-center"
        style={{
          ...cssVariables,
          width: "var(--clock-size)",
          height: "var(--clock-size)",
        }}
      >
        {/* ================= 中心：太阳 (容器) ================= */}
        <div
          className="absolute z-10 flex flex-col items-center justify-center rounded-full bg-[#ff9800] text-white shadow-[0_0_20px_rgba(255,152,0,0.5)] dark:shadow-[0_0_20px_rgba(255,152,0,0.9)] leading-[1.2]"
          style={{
            width: "calc(var(--clock-size) * 0.24)", // 约 72px
            height: "calc(var(--clock-size) * 0.24)"
          } as SolarSystemCSSProperties}
        >
          {/* 时间文字: 固定 16px */}
          <div
            ref={timeTextRef}
            className="mb-0.5 font-bold tabular-nums text-[16px] font-mono drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          >
            --:--:--
          </div>
          {/* 日期文字: 固定 10px */}
          <div
            ref={dateTextRef}
            className="opacity-90 tabular-nums text-[10px] font-mono drop-shadow-[0_0_5px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          >
            ----/--/--
          </div>
        </div>

        {/* ================= 轨道线 ================= */}
        {/* 内轨 (秒针) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/30 dark:border-white/30 w-[42%] h-[42%]" />
        {/* 中轨 (分针) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/30 dark:border-white/30 w-[66%] h-[66%]" />
        {/* 外轨 (时针) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/30 dark:border-white/30 w-[90%] h-[90%]" />

        {/* ================= 行星 (指针) ================= */}

        {/* 时针 (火星 - 最外圈) */}
        <div
          ref={hourHandRef}
          className="absolute top-1/2 left-1/2 z-30 rounded-full bg-[#ff5722] drop-shadow-[0_0_8px_rgba(255,87,34,0.7)] dark:drop-shadow-[0_0_8px_rgba(255,87,34,0.9)]"
          style={{
            ...getPlanetStyle(-0.45),
            width: "calc(var(--clock-size) * 0.045)", // 约 13.5px
            height: "calc(var(--clock-size) * 0.045)",
          }}
        />

        {/* 分针 (地球 - 中圈) */}
        <div
          ref={minHandRef}
          className="absolute top-1/2 left-1/2 z-31 rounded-full bg-[#2196f3] drop-shadow-[0_0_8px_rgba(33,150,243,0.7)] dark:drop-shadow-[0_0_8px_rgba(33,150,243,0.9)]"
          style={{
            ...getPlanetStyle(-0.33),
            width: "calc(var(--clock-size) * 0.055)", // 约 16.5px
            height: "calc(var(--clock-size) * 0.055)",
          }}
        />

        {/* 秒针 (水星 - 内圈) */}
        <div
          ref={secHandRef}
          className="absolute top-1/2 left-1/2 z-32 rounded-full bg-[#bdbdbd] drop-shadow-[0_0_8px_rgba(189,189,189,0.7)] dark:drop-shadow-[0_0_8px_rgba(189,189,189,0.9)]"
          style={{
            ...getPlanetStyle(-0.21),
            width: "calc(var(--clock-size) * 0.032)", // 约 9.6px
            height: "calc(var(--clock-size) * 0.032)",
          }}
        />
      </div>
    </motion.div>
  );
}
