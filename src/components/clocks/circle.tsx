"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"

interface ClockCircleProps {
  className?: string
  /** 自定义容器大小，默认为 300px */
  size?: string | number
}

// 配置项：半径与宽度
// 修改：重新计算半径，使最外层接近 SVG 边缘 (100)，实现“填满”效果
// 计算逻辑：Max(98) -> h24(2) -> 96 -> h12(3) -> 93 -> min(4) -> 89 -> sec(5) -> 84
const CONFIG = {
  sec: {
    r: 86.5, // 范围: 84 - 89 (最内层)
    width: 5,
    color: "stroke-black dark:stroke-white",
    shadow: "drop-shadow-[0_0_5px_rgba(0,0,0,0.9)] dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]"
  },
  min: {
    r: 91,   // 范围: 89 - 93
    width: 4,
    color: "stroke-[#232323] dark:stroke-[#dcdcdc]",
    shadow: "drop-shadow-[0_0_4px_rgba(35,35,35,0.6)] dark:drop-shadow-[0_0_4px_rgba(220,220,220,0.6)]"
  },
  h12: {
    r: 94.5, // 范围: 93 - 96
    width: 3,
    color: "stroke-[#565656] dark:stroke-[#a9a9a9]",
    shadow: "drop-shadow-[0_0_3px_rgba(86,86,86,0.5)] dark:drop-shadow-[0_0_3px_rgba(169,169,169,0.5)]"
  },
  h24: {
    r: 97,   // 范围: 96 - 98 (最外层，接近 SVG 边界 100)
    width: 2,
    color: "stroke-[#999999] dark:stroke-[#666666]",
    shadow: "drop-shadow-[0_0_2px_rgba(153,153,153,0.4)] dark:drop-shadow-[0_0_2px_rgba(100,100,100,0.4)]"
  },
}

export default function ClockCircle({ className, size = "300px" }: ClockCircleProps) {
  const { setIsMenuActive } = useApp()
  const [mounted, setMounted] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState("")
  const [dateDisplay, setDateDisplay] = useState("")

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

  const lastVals = useRef({ sec: -1, min: -1, h12: -1, h24: -1 })

  useEffect(() => {
    setMounted(true)

    const updateClock = () => {
      const now = new Date()
      const ms = now.getMilliseconds()
      const s = now.getSeconds()
      const m = now.getMinutes()
      const h = now.getHours()

      // 1. 文字更新
      const tH = String(h).padStart(2, "0")
      const tM = String(m).padStart(2, "0")
      const tS = String(s).padStart(2, "0")
      const newTime = `${tH}:${tM}:${tS}`

      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      const newDate = `${year}-${month}-${day}`

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

      const radius = CONFIG[key as keyof typeof CONFIG].r
      const len = 2 * Math.PI * radius
      const drawLen = len * pct

      r.prog.style.strokeDasharray = `${drawLen} ${len}`
      r.prog.style.strokeDashoffset = "0"

      // 动画触发
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
      ghost.animate([
        { strokeDashoffset: 0, opacity: 1 },
        { strokeDashoffset: -len, opacity: 1 }
      ], {
        duration: 800,
        easing: "ease-out",
        fill: "forwards"
      }).onfinish = () => {
        // Animation finished
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
      }}
      onClick={() => setIsMenuActive(true)}
    >
      {/* Center Info */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none text-center">
        {/* 时间: 22px */}
        <div className="text-foreground dark:text-white text-[22px] font-normal tracking-widest mb-1 font-mono drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
          {timeDisplay || "00:00:00"}
        </div>
        {/* 日期: 12px */}
        <div className="text-muted-foreground dark:text-[#d0d0d0] text-[12px] font-semibold tracking-widest font-mono drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
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
            {/* Ghost */}
            <circle
              ref={(el) => { if (refs.current) refs.current[key].ghost = el }}
              cx="100"
              cy="100"
              r={cfg.r}
              fill="none"
              strokeLinecap="round"
              className={cn("opacity-0", cfg.color, cfg.shadow)}
              strokeWidth={cfg.width}
            />
            {/* Progress */}
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
