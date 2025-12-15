"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

// 半径配置 (百分比)
const R_SEC_PCT = 45
const R_HOUR_PCT = 32

interface ClockJumpProps {
  className?: string
  /** 自定义容器大小，默认 90vmin */
  size?: string | number
}

export default function ClockJump({ className, size = "60vmin" }: ClockJumpProps) {
  const { setIsMenuActive } = useApp()
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())

    let frameId: number
    const update = () => {
      setTime(new Date())
      frameId = requestAnimationFrame(update)
    }
    update()

    return () => cancelAnimationFrame(frameId)
  }, [])

  // 防止服务端渲染不一致 (SSR Hydration Mismatch)
  if (!mounted || !time) {
    return (
      <div
        className={cn("relative flex items-center justify-center rounded-full bg-card", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  const s = time.getSeconds()
  const m = time.getMinutes()
  const h = time.getHours()
  const isPm = h >= 12
  const hIndex = h % 12

  // 辅助函数：计算位置
  const getPositionStyle = (index: number, total: number, radiusPct: number) => {
    const angleDeg = index * (360 / total) - 90
    const angleRad = (angleDeg * Math.PI) / 180
    const x = radiusPct * Math.cos(angleRad)
    const y = radiusPct * Math.sin(angleRad)
    return {
      left: `calc(50% + ${x}%)`,
      top: `calc(50% + ${y}%)`,
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className={cn(
        "relative mx-auto rounded-full font-mono shadow-xl select-none overflow-hidden transition-colors duration-300 cursor-pointer",
        // 背景适配主题：亮色使用 card，暗色强制纯黑
        "bg-card dark:bg-black",
        // 边框适配：亮色普通边框，暗色白色微光边框 + 白色外发光
        "border border-border dark:border-white/20 dark:shadow-[0_0_1.5rem_rgba(255,255,255,0.15)]",
        // 响应式字体大小计算
        "text-[clamp(12px,2.25vmin,16px)]",
        className
      )}
      style={{
        width: size,
        height: size,
        maxWidth: "400px",
        maxHeight: "400px",
      }}
      onClick={() => setIsMenuActive(true)}
    >
      {/* 秒针圈 (60个) */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={`sec-${i}`}
          className={cn(
            "absolute flex h-[2em] w-[2em] -translate-x-1/2 -translate-y-1/2 cursor-default items-center justify-center rounded-full transition-all duration-200",
            // 默认颜色：使用 muted-foreground 的低透明度
            "text-[0.6em] text-muted-foreground/30",
            // 激活颜色：使用 primary 或 foreground，添加发光效果
            s === i && "z-10 scale-140 text-[1em] font-bold text-primary drop-shadow-[0_0_0.5em_currentColor]"
          )}
          style={getPositionStyle(i, 60, R_SEC_PCT)}
        >
          {i}
        </div>
      ))}

      {/* 小时圈 (12个) - 含分钟合并逻辑 */}
      {Array.from({ length: 12 }).map((_, i) => {
        // 计算显示的数字
        let baseNum = isPm ? (i === 0 ? 12 : 12 + i) : i === 0 ? 12 : i

        // 核心逻辑：如果是当前小时，拼接分钟
        const isCurrentHour = i === hIndex
        const displayText = isCurrentHour
          ? `${baseNum}:${String(m).padStart(2, "0")}`
          : String(baseNum)

        return (
          <div
            key={`hour-${i}`}
            className={cn(
              "absolute flex h-[2em] min-w-[2em] w-auto whitespace-nowrap -translate-x-1/2 -translate-y-1/2 cursor-default items-center justify-center rounded-full transition-all duration-200",
              // 默认颜色
              "text-[1em] text-muted-foreground/40",
              // 激活颜色
              isCurrentHour && "z-10 scale-130 text-[1.5em] font-bold text-primary drop-shadow-[0_0_0.5em_currentColor]"
            )}
            style={getPositionStyle(i, 12, R_HOUR_PCT)}
          >
            {displayText}
          </div>
        )
      })}

      {/* 中心日期显示 */}
      <div className="absolute top-1/2 left-1/2 z-20 flex h-[35%] w-[35%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[0.1em] rounded-full bg-muted/5 text-center backdrop-blur-sm">
        <div className="mb-[0.3em] text-[0.9em] tracking-[0.2em] text-muted-foreground">
          {time.getFullYear()}
        </div>

        <div className="flex items-baseline gap-[0.5em]">
          <div className="text-[4.5em] font-bold leading-none text-foreground drop-shadow-sm">
            {String(time.getDate()).padStart(2, "0")}
          </div>
          <div className="text-[1.5em] font-light uppercase text-foreground/80">
            {MONTHS[time.getMonth()]}
          </div>
        </div>

        <div className="mt-[0.6em] w-[60%] border-t border-border pt-[0.5em] text-[0.75em] tracking-[0.2em] text-muted-foreground">
          {DAYS[time.getDay()]}
        </div>
      </div>
    </motion.div>
  )
}
