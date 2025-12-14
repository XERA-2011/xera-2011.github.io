"use client";

import { useEffect, useState } from "react";
import { Roboto_Mono } from "next/font/google";

// 加载字体 (Next.js 优化方式)
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// 半径配置 (百分比，相对于容器宽度的 90vmin)
const R_SEC_PCT = 45;
const R_MIN_PCT = 36;
const R_HOUR_PCT = 25;

export default function SimpleClock() {
  const [now, setNow] = useState<Date | null>(null);

  // 初始化和定时器
  useEffect(() => {
    setNow(new Date()); // 避免服务端渲染水合不匹配
    const timer = requestAnimationFrame(function loop() {
      setNow(new Date());
      requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // 如果还没加载完，先不渲染或渲染骨架，防止 Hydration Error
  if (!now) return null;

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const hIndex = hours % 12;
  const isPm = hours >= 12;

  // 日期数据
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  // 辅助函数：计算位置样式
  const getPosStyle = (index: number, total: number, radiusPct: number) => {
    const angleDeg = index * (360 / total) - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = radiusPct * Math.cos(angleRad);
    const y = radiusPct * Math.sin(angleRad);
    return {
      left: `calc(50% + ${x}%)`,
      top: `calc(50% + ${y}%)`,
    };
  };

  return (
    <div className={`flex justify-center items-center w-full h-full min-h-125 overflow-hidden ${robotoMono.className}`}>
      {/* 
        主容器 
        使用 vmin 确保响应式，max-w/h 限制大屏过大
        text-[calc(...)] 用于基准字体大小
      */}
      <div
        className="relative rounded-full bg-[radial-gradient(circle,#111_0%,#000_80%)] shadow-[inset_0_0_3em_rgba(0,0,0,1)]"
        style={{
          width: "90vmin",
          height: "90vmin",
          maxWidth: "600px",
          maxHeight: "600px",
          fontSize: "calc(min(90vmin, 600px) / 40)", // 动态基准字体
        }}
      >
        {/* --- 1. 秒 (最外圈) --- */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`sec-${i}`}
            className={`absolute flex justify-center items-center w-[2em] h-[2em] rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200 select-none cursor-default
              ${i === seconds
                ? "text-[#ff3b30] font-bold text-[1em] scale-140 z-10"
                : "text-[#1a1a1a] text-[0.6em]"
              }`}
            style={{
              ...getPosStyle(i, 60, R_SEC_PCT),
              textShadow: i === seconds ? "0 0 0.8em rgba(255, 59, 48, 0.8)" : "none",
            }}
          >
            {i}
          </div>
        ))}

        {/* --- 2. 分 (中间圈) --- */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`min-${i}`}
            className={`absolute flex justify-center items-center w-[2em] h-[2em] rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200 select-none cursor-default
              ${i === minutes
                ? "text-[#ff3b30] font-bold text-[1.1em] scale-130 z-10"
                : "text-[#222] text-[0.8em]"
              }`}
            style={{
              ...getPosStyle(i, 60, R_MIN_PCT),
              textShadow: i === minutes ? "0 0 0.8em rgba(255, 59, 48, 0.8)" : "none",
            }}
          >
            {i}
          </div>
        ))}

        {/* --- 3. 时 (内圈 - 24H 逻辑) --- */}
        {Array.from({ length: 12 }).map((_, i) => {
          // 24小时制显示逻辑
          let displayNum = i;
          if (isPm) {
            displayNum = i === 0 ? 12 : 12 + i; // 下午: 0->12, 1->13...
          } else {
            displayNum = i === 0 ? 12 : i;      // 上午: 0->12, 1->1...
          }

          const isActive = i === hIndex;

          return (
            <div
              key={`hour-${i}`}
              className={`absolute flex justify-center items-center w-[2em] h-[2em] rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200 select-none cursor-default
                ${isActive
                  ? "text-[#ff3b30] font-bold text-[1.5em] scale-130 z-10"
                  : "text-[#2a2a2a] text-[1em]"
                }`}
              style={{
                ...getPosStyle(i, 12, R_HOUR_PCT),
                textShadow: isActive ? "0 0 0.8em rgba(255, 59, 48, 0.8)" : "none",
              }}
            >
              {displayNum}
            </div>
          );
        })}

        {/* --- 中心日期显示 --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col justify-center items-center z-20 w-[35%] h-[35%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]">
          <div className="text-[rgba(255,255,255,0.7)] text-[0.9em] tracking-[0.2em] mb-[0.3em]">
            {now.getFullYear()}
          </div>
          <div className="flex items-baseline gap-[0.5em]">
            <div className="text-white text-[4.5em] leading-none font-bold drop-shadow-[0_0_1em_rgba(255,255,255,0.3)]">
              {String(now.getDate()).padStart(2, "0")}
            </div>
            <div className="text-white text-[1.5em] font-light uppercase">
              {months[now.getMonth()]}
            </div>
          </div>
          <div className="text-[rgba(255,255,255,0.6)] text-[0.75em] tracking-[0.2em] mt-[0.6em] border-t border-[rgba(255,255,255,0.2)] pt-[0.5em] w-[60%]">
            {days[now.getDay()]}
          </div>
        </div>
      </div>
    </div>
  );
}
