"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ClockCircleProps {
  className?: string
  size?: string | number
  /** 如果传此值，则为静态展示模式 */
  staticTime?: string | Date;
  onClick?: () => void
}

// 填满容器、间距为0的配置
const CONFIG = {
  sec: { r: 86.5, width: 5, color: "stroke-black dark:stroke-white", shadow: "drop-shadow-[0_0_5px_rgba(0,0,0,0.9)] dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]" },
  min: { r: 91, width: 4, color: "stroke-[#232323] dark:stroke-[#dcdcdc]", shadow: "drop-shadow-[0_0_4px_rgba(35,35,35,0.6)] dark:drop-shadow-[0_0_4px_rgba(220,220,220,0.6)]" },
  h12: { r: 94.5, width: 3, color: "stroke-[#565656] dark:stroke-[#a9a9a9]", shadow: "drop-shadow-[0_0_3px_rgba(86,86,86,0.5)] dark:drop-shadow-[0_0_3px_rgba(169,169,169,0.5)]" },
  h24: { r: 97, width: 2, color: "stroke-[#999999] dark:stroke-[#666666]", shadow: "drop-shadow-[0_0_2px_rgba(153,153,153,0.4)] dark:drop-shadow-[0_0_2px_rgba(100,100,100,0.4)]" },
}

export default function ClockCircle({ className, size = "300px", staticTime, onClick }: ClockCircleProps) {
  const [mounted, setMounted] = useState(false)

  // 动态状态
  const [dynamicTime, setDynamicTime] = useState("")
  const [dynamicDate, setDynamicDate] = useState("")

  const refs = useRef<{ [key: string]: { prog: SVGCircleElement | null, ghost: SVGCircleElement | null } }>({
    sec: { prog: null, ghost: null }, min: { prog: null, ghost: null }, h12: { prog: null, ghost: null }, h24: { prog: null, ghost: null },
  })
  const lastVals = useRef({ sec: -1, min: -1, h12: -1, h24: -1 })

  // --- 静态计算 ---
  const staticData = useMemo(() => {
    if (!staticTime) return null;
    const date = typeof staticTime === 'string' ? new Date(`2000-01-01T${staticTime}`) : staticTime;
    const s = date.getSeconds();
    const m = date.getMinutes();
    const h = date.getHours();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 文字
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // 进度
    return {
      timeStr, dateStr,
      percents: {
        sec: s / 60,
        min: m / 60 + s / 3600,
        h12: (h % 12) / 12 + m / 720,
        h24: h / 24 + m / 1440
      }
    };
  }, [staticTime]);

  useEffect(() => {
    setMounted(true)
    if (staticTime) return; // 静态模式：不启动动画循环

    const updateClock = () => {
      const now = new Date()
      const ms = now.getMilliseconds()
      const s = now.getSeconds()
      const m = now.getMinutes()
      const h = now.getHours()

      const tStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

      setDynamicTime(prev => prev !== tStr ? tStr : prev)
      setDynamicDate(prev => prev !== dStr ? dStr : prev)

      const valSec = s + ms / 1000
      const valMin = m + valSec / 60
      const val12 = (h % 12) + valMin / 60
      const val24 = h + valMin / 60

      updateRing("sec", valSec / 60, valSec, 60)
      updateRing("min", valMin / 60, valMin, 60)
      updateRing("h12", val12 / 12, val12, 12)
      updateRing("h24", val24 / 24, val24, 24)

      requestAnimationFrame(updateClock)
    }

    const updateRing = (key: string, pct: number, currentVal: number, maxVal: number) => {
      const r = refs.current[key]
      if (!r.prog) return
      const radius = CONFIG[key as keyof typeof CONFIG].r
      const len = 2 * Math.PI * radius
      r.prog.style.strokeDasharray = `${len * pct} ${len}`

      // 幽灵动画 (仅动态模式)
      const lastVal = lastVals.current[key as keyof typeof lastVals.current]
      if (lastVal > maxVal * 0.9 && currentVal < maxVal * 0.1 && currentVal < lastVal) {
        if (r.ghost) {
          r.ghost.style.strokeDasharray = `${len} ${len}`
          r.ghost.animate([{ strokeDashoffset: 0, opacity: 1 }, { strokeDashoffset: -len, opacity: 1 }], { duration: 800, easing: "ease-out", fill: "forwards" })
        }
      }
      lastVals.current[key as keyof typeof lastVals.current] = currentVal
    }

    const timer = requestAnimationFrame(updateClock)
    return () => cancelAnimationFrame(timer)
  }, [staticTime])

  if (!mounted) return null

  // 决定显示内容：静态 vs 动态
  const displayTime = staticData ? staticData.timeStr : dynamicTime;
  const displayDate = staticData ? staticData.dateStr : dynamicDate;

  // 辅助函数：获取圆环样式
  const getRingStyle = (key: string) => {
    if (!staticData) return {}; // 动态模式：样式由 JS 循环直接写 DOM
    const cfg = CONFIG[key as keyof typeof CONFIG];
    const pct = staticData.percents[key as keyof typeof staticData.percents];
    const len = 2 * Math.PI * cfg.r;
    return {
      strokeDasharray: `${len * pct} ${len}`,
      strokeDashoffset: 0
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
      className={cn("relative mx-auto flex items-center justify-center rounded-full select-none overflow-hidden transition-colors duration-300", onClick ? "cursor-pointer" : "cursor-default", className)}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none text-center">
        <div className="text-foreground dark:text-white text-3xl sm:text-4xl font-normal tracking-widest mb-2 font-mono drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
          {displayTime || "00:00:00"}
        </div>
        <div className="text-muted-foreground dark:text-[#d0d0d0] text-sm sm:text-base font-semibold tracking-widest font-mono drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {displayDate || "2023-01-01"}
        </div>
      </div>

      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        {Object.entries(CONFIG).map(([key, cfg]) => (
          <circle key={`track-${key}`} cx="100" cy="100" r={cfg.r} fill="none" strokeLinecap="round" className="stroke-[#e5e5e5] dark:stroke-[#1a1a1a]" strokeWidth={cfg.width} />
        ))}
        {Object.entries(CONFIG).map(([key, cfg]) => (
          <React.Fragment key={`group-${key}`}>
            {!staticTime && (
              <circle ref={(el) => { if (refs.current) refs.current[key].ghost = el }} cx="100" cy="100" r={cfg.r} fill="none" strokeLinecap="round" className={cn("opacity-0", cfg.color, cfg.shadow)} strokeWidth={cfg.width} />
            )}
            <circle
              ref={(el) => { if (refs.current) refs.current[key].prog = el }}
              cx="100" cy="100" r={cfg.r} fill="none" strokeLinecap="round"
              className={cn(cfg.color, cfg.shadow)} strokeWidth={cfg.width}
              // 关键：如果是静态模式，直接在这里通过 style 应用样式
              style={getRingStyle(key)}
            />
          </React.Fragment>
        ))}
      </svg>
    </Container>
  )
}
