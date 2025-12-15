"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"

interface ClockCircleProps {
  className?: string
  /** 自定义容器大小 */
  size?: string | number
}

// 配置项：半径与宽度
const CONFIG = {
  sec: {
    r: 60,
    width: 10,
    // 亮色: 黑色, 暗色: 白色
    color: "stroke-black dark:stroke-white",
    // 亮色: 黑色阴影, 暗色: 白色阴影
    shadow: "drop-shadow-[0_0_5px_rgba(0,0,0,0.9)] dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]"
  },
  min: {
    r: 69,
    width: 8,
    // 亮色: 深灰, 暗色: 浅灰
    color: "stroke-[#232323] dark:stroke-[#dcdcdc]",
    shadow: "drop-shadow-[0_0_4px_rgba(35,35,35,0.6)] dark:drop-shadow-[0_0_4px_rgba(220,220,220,0.6)]"
  },
  h12: {
    r: 76,
    width: 6,
    // 亮色: 中灰, 暗色: 中灰
    color: "stroke-[#565656] dark:stroke-[#a9a9a9]",
    shadow: "drop-shadow-[0_0_3px_rgba(86,86,86,0.5)] dark:drop-shadow-[0_0_3px_rgba(169,169,169,0.5)]"
  },
  h24: {
    r: 81,
    width: 4,
    // 亮色: 浅灰, 暗色: 深灰
    color: "stroke-[#999999] dark:stroke-[#666666]",
    shadow: "drop-shadow-[0_0_2px_rgba(153,153,153,0.4)] dark:drop-shadow-[0_0_2px_rgba(100,100,100,0.4)]"
  },
}

export default function ClockCircle({ className, size = "60vmin" }: ClockCircleProps) {
  const { setIsMenuActive } = useApp()
  const [mounted, setMounted] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState("")
  const [dateDisplay, setDateDisplay] = useState("")

  // Refs for SVG elements to manipulate directly for performance
  const refs = useRef<{
    [key: string]: {
      prog: SVGCircleElement | null
      ghost: SVGCircleElement | null
    }
  }>({
    sec: { prog: null, ghost: null },
    min: { prog: null, ghost: null },
    h12: { prog: null, ghost: null },
    h24: { prog: null, ghost: null },
  })

  // Store last values to detect cycle completion
  const lastVals = useRef({ sec: -1, min: -1, h12: -1, h24: -1 })

  useEffect(() => {
    setMounted(true)

    const updateClock = () => {
      const now = new Date()
      const ms = now.getMilliseconds()
      const s = now.getSeconds()
      const m = now.getMinutes()
      const h = now.getHours()

      // 1. 文字更新 (React state update is fine for 1Hz text, but maybe optimize if needed)
      // To avoid too many re-renders, we could also use refs for text, but state is easier for now.
      // Given requestAnimationFrame runs 60fps, setting state 60fps is bad.
      // Let's use refs for text content too if we want pure 60fps smoothness without React overhead,
      // OR just throttle the text update.
      // Actually, for the text "00:00:00", it only changes once per second.

      const tH = String(h).padStart(2, "0")
      const tM = String(m).padStart(2, "0")
      const tS = String(s).padStart(2, "0")
      const newTime = `${tH}:${tM}:${tS}`

      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      const newDate = `${year}-${month}-${day}`

      // Only update state if changed
      setTimeDisplay(prev => prev !== newTime ? newTime : prev)
      setDateDisplay(prev => prev !== newDate ? newDate : prev)

      // 2. 进度计算
      const valSec = s + ms / 1000
      const valMin = m + valSec / 60
      const val12 = (h % 12) + valMin / 60
      const val24 = h + valMin / 60

      const pctSec = valSec / 60
      const pctMin = valMin / 60
      const pct12 = val12 / 12
      const pct24 = val24 / 24

      // 3. 渲染
      updateRing("sec", pctSec, valSec, 60)
      updateRing("min", pctMin, valMin, 60)
      updateRing("h12", pct12, val12, 12)
      updateRing("h24", pct24, val24, 24)

      requestAnimationFrame(updateClock)
    }

    const updateRing = (key: string, pct: number, currentVal: number, maxVal: number) => {
      const r = refs.current[key]
      if (!r.prog) return

      // Calculate circumference
      const radius = CONFIG[key as keyof typeof CONFIG].r
      const len = 2 * Math.PI * radius

      const drawLen = len * pct

      r.prog.style.strokeDasharray = `${drawLen} ${len}`
      r.prog.style.strokeDashoffset = "0"

      // 动画触发 (Ghost effect on cycle reset)
      const lastVal = lastVals.current[key as keyof typeof lastVals.current]
      if (lastVal > maxVal * 0.9 && currentVal < maxVal * 0.1 && currentVal < lastVal) {
        triggerGhostAnimation(key, len)
      }
      lastVals.current[key as keyof typeof lastVals.current] = currentVal
    }

    const triggerGhostAnimation = (key: string, len: number) => {
      const ghost = refs.current[key].ghost
      if (!ghost) return

      ghost.style.strokeDasharray = `${len} ${len}`

      // Web Animations API
      ghost.animate([
        { strokeDashoffset: 0, opacity: 1 },
        { strokeDashoffset: -len, opacity: 1 } // Keep opacity 1 during move, or fade out? Original code kept opacity 1 but it was class-based opacity 0 initially?
        // Original CSS: .ghost { opacity: 0; }
        // Original JS: opacity: 1 in keyframes.
        // So it appears, moves, then disappears (because animation finishes and reverts to CSS opacity 0 if not filled forwards, but it has fill: 'forwards').
        // Wait, if fill is forwards, it stays visible? 
        // Ah, the original code has `opacity: 0` in CSS. The animation keyframes set `opacity: 1`.
        // If `fill: forwards`, it stays at the last keyframe (opacity 1, offset -len).
        // But offset -len means it's fully "unwound" or "wound"? 
        // StrokeDashoffset -len usually means hidden if dasharray is "len len".
      ], {
        duration: 800,
        easing: "ease-out",
        fill: "forwards" // This might keep it visible if not careful. 
        // Actually, strokeDashoffset: -len with dasharray: len len effectively hides it if it's a full circle stroke.
      }).onfinish = () => {
        // Reset if needed, though fill: forwards handles it.
        // Ideally we want it to reset to invisible for the next time.
        // But since it's a ghost that runs once per minute/hour, it's fine.
        // However, for the next cycle, we need to reset it?
        // The animate() creates a new animation each time.
      }
    }

    const timer = requestAnimationFrame(updateClock)
    return () => cancelAnimationFrame(timer)
  }, [])

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className={cn(
        "relative mx-auto flex items-center justify-center rounded-full select-none overflow-hidden transition-colors duration-300 cursor-pointer",
        className
      )}
      style={{
        width: size,
        height: size,
        maxWidth: "500px",
        maxHeight: "500px",
      }}
      onClick={() => setIsMenuActive(true)}
    >
      {/* Center Info */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none text-center">
        <div className="text-foreground dark:text-white text-[20px] sm:text-[32px] md:text-[44px] font-normal tracking-widest mb-1 sm:mb-2 font-mono drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
          {timeDisplay || "00:00:00"}
        </div>
        <div className="text-muted-foreground dark:text-[#d0d0d0] text-[10px] sm:text-sm md:text-lg font-semibold tracking-widest font-mono drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {dateDisplay || "2023-01-01"}
        </div>
      </div>

      {/* SVG Clock */}
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        {/* Tracks (Background Rings) */}
        {Object.entries(CONFIG).map(([key, cfg]) => (
          <circle
            key={`track-${key}`}
            cx="100"
            cy="100"
            r={cfg.r}
            fill="none"
            strokeLinecap="round"
            className="stroke-[#e5e5e5] dark:stroke-[#1a1a1a]"
            strokeWidth={cfg.width}
          />
        ))}

        {/* Progress Rings & Ghosts */}
        {Object.entries(CONFIG).map(([key, cfg]) => (
          <React.Fragment key={`group-${key}`}>
            {/* Ghost (Animation on reset) */}
            <circle
              ref={(el) => { if (refs.current) refs.current[key].ghost = el }}
              cx="100"
              cy="100"
              r={cfg.r}
              fill="none"
              strokeLinecap="round"
              className={cn("opacity-0", cfg.color, cfg.shadow)} // Base opacity 0, controlled by animation
              strokeWidth={cfg.width}
            />
            {/* Progress (Main) */}
            <circle
              ref={(el) => { if (refs.current) refs.current[key].prog = el }}
              cx="100"
              cy="100"
              r={cfg.r}
              fill="none"
              strokeLinecap="round"
              className={cn(cfg.color, cfg.shadow)}
              strokeWidth={cfg.width}
            />
          </React.Fragment>
        ))}
      </svg>
    </motion.div>
  )
}
