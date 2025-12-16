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
  /** 
   * 静态模式时间，格式: "HH:MM:SS" 或 Date 对象。
   * 如果传入此值，组件将处于静态模式，不执行任何动画。
   */
  staticTime?: string | Date;
}

export default function ClockSolar({ className, size = "300px", staticTime }: ClockSolarProps) {
  const { setIsMenuActive } = useApp();
  const [mounted, setMounted] = React.useState(false);

  // 使用 Ref 获取 DOM 元素 (仅动态模式使用)
  const hourHandRef = React.useRef<HTMLDivElement>(null);
  const minHandRef = React.useRef<HTMLDivElement>(null);
  const secHandRef = React.useRef<HTMLDivElement>(null);
  const timeTextRef = React.useRef<HTMLDivElement>(null);
  const dateTextRef = React.useRef<HTMLDivElement>(null);

  // 动画状态保持 (动态模式使用)
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

    // 文字
    const timeStr = `${pad(h)}:${pad(m)}:${pad(s)}`;
    const dateStr = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;

    // 角度 (静态不需要考虑 ms 和 loop 累加)
    const secDeg = s * 6;
    const minDeg = (m + s / 60) * 6;
    const hourDeg = ((h % 12) + m / 60) * 30;

    return { timeStr, dateStr, secDeg, minDeg, hourDeg };
  }, [staticTime]);

  // 2. 动态逻辑
  React.useEffect(() => {
    setMounted(true);
    if (staticTime) return; // 静态模式直接跳过动画循环

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
      if (timeTextRef.current) timeTextRef.current.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      if (dateTextRef.current) dateTextRef.current.textContent = `${year}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`;

      frameId = requestAnimationFrame(updateClock);
    };

    frameId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(frameId);
  }, [staticTime]);

  if (!mounted && !staticTime) {
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
  const getPlanetStyle = (radiusFactor: number, type: 'h' | 'm' | 's'): SolarSystemCSSProperties => {
    let degStr = "0deg";

    // 如果是静态模式，直接写入 style
    if (staticData) {
      let deg = 0;
      if (type === 'h') deg = staticData.hourDeg;
      if (type === 'm') deg = staticData.minDeg;
      if (type === 's') deg = staticData.secDeg;
      degStr = `${deg}deg`;
    }

    return {
      // 关键：将 var(--deg) 替换为具体值(静态) 或 保留 CSS变量引用(动态)
      transform: `translate(-50%, -50%) rotate(${staticData ? degStr : 'var(--deg)'}) translateY(calc(var(--clock-size) * ${radiusFactor})) rotate(calc(${staticData ? degStr : 'var(--deg)'} * -1))`,
      "--deg": degStr, // 动态模式下这个值会被 JS 覆盖，静态模式下无所谓
    };
  };

  const Container = staticTime ? 'div' : motion.div;
  const containerProps = staticTime ? {} : {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay: 0.5, duration: 0.6 }
  };

  return (
    <Container
      {...containerProps}
      className={cn(
        "relative flex items-center justify-center rounded-full select-none overflow-hidden transition-colors duration-300 cursor-pointer",
        className
      )}
      style={{
        width: size,
        height: size,
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
            {staticData ? staticData.timeStr : "--:--:--"}
          </div>
          {/* 日期文字: 固定 10px */}
          <div
            ref={dateTextRef}
            className="opacity-90 tabular-nums text-[10px] font-mono drop-shadow-[0_0_5px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          >
            {staticData ? staticData.dateStr : "----/--/--"}
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
            ...getPlanetStyle(-0.45, 'h'),
            width: "calc(var(--clock-size) * 0.045)", // 约 13.5px
            height: "calc(var(--clock-size) * 0.045)",
          }}
        />

        {/* 分针 (地球 - 中圈) */}
        <div
          ref={minHandRef}
          className="absolute top-1/2 left-1/2 z-31 rounded-full bg-[#2196f3] drop-shadow-[0_0_8px_rgba(33,150,243,0.7)] dark:drop-shadow-[0_0_8px_rgba(33,150,243,0.9)]"
          style={{
            ...getPlanetStyle(-0.33, 'm'),
            width: "calc(var(--clock-size) * 0.055)", // 约 16.5px
            height: "calc(var(--clock-size) * 0.055)",
          }}
        />

        {/* 秒针 (水星 - 内圈) */}
        <div
          ref={secHandRef}
          className="absolute top-1/2 left-1/2 z-32 rounded-full bg-[#bdbdbd] drop-shadow-[0_0_8px_rgba(189,189,189,0.7)] dark:drop-shadow-[0_0_8px_rgba(189,189,189,0.9)]"
          style={{
            ...getPlanetStyle(-0.21, 's'),
            width: "calc(var(--clock-size) * 0.032)", // 约 9.6px
            height: "calc(var(--clock-size) * 0.032)",
          }}
        />
      </div>
    </Container>
  );
}
