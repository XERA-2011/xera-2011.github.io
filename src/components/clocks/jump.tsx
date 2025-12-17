"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]

// 半径配置 (百分比)
const R_SEC_PCT = 45
const R_HOUR_PCT = 32

interface ClockJumpProps {
  className?: string
  /** 自定义容器大小，默认 300px */
  size?: string | number
  /** 如果传此值，则为静态展示模式，格式: "10:10:30" 或 Date 对象 */
  staticTime?: string | Date
  onClick?: () => void
}

export default function ClockJump({ className, size = "300px", staticTime, onClick }: ClockJumpProps) {
  const [mounted, setMounted] = useState(false)

  // 1. 根据 staticTime 计算初始值
  const initialTime = useMemo(() => {
    if (staticTime) {
      return typeof staticTime === 'string' ? new Date(`2000-01-01T${staticTime}`) : staticTime;
    }
    // 动态模式初始为 null，等待客户端挂载后再计算，确保无水合错误
    return null;
  }, [staticTime]);

  const [time, setTime] = useState<Date | null>(initialTime)

  useEffect(() => {
    setMounted(true)

    // 情况 A: 静态模式 - 不需要定时器，time 已经在 initialTime 设置好了
    if (staticTime) return;

    // 情况 B: 动态模式
    setTime(new Date()) // 立即更新一次

    let frameId: number
    const update = () => {
      setTime(new Date())
      frameId = requestAnimationFrame(update)
    }
    update()

    return () => cancelAnimationFrame(frameId)
  }, [staticTime])

  // 防止服务端渲染不一致 (仅动态模式)
  // 如果是动态模式且未挂载，显示占位符
  if (!mounted && !staticTime) {
    return (
      <div
        className={cn("relative flex items-center justify-center rounded-full bg-card", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  // 核心修复：确保 displayTime 在 render 中是安全的
  // 如果 time 仍为 null (极罕见)，使用 staticTime 兜底，或者构造一个零点时间，绝对不要在 render 直接 new Date()
  const displayTime = time || (staticTime ? (typeof staticTime === 'string' ? new Date(`2000-01-01T${staticTime}`) : staticTime) : new Date());

  const s = displayTime.getSeconds()
  const m = displayTime.getMinutes()
  const h = displayTime.getHours()
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

  // 动态组件使用 motion.div，静态组件使用 div
  const Container = staticTime ? 'div' : motion.div;
  const containerProps = staticTime ? {} : {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay: 0.5, duration: 0.6 }
  };

  return (
    <Container
      {...containerProps}
      // 核心修复：添加 suppressHydrationWarning
      // 这告诉 React：如果服务器时间和客户端时间有微小差异导致文本/属性不同，请忽略警告，直接使用客户端的值
      suppressHydrationWarning
      className={cn(
        "relative mx-auto rounded-full font-mono select-none transition-colors duration-300",
        onClick ? "cursor-pointer" : "cursor-default",
        "text-[12px]",
        className
      )}
      style={{
        width: size,
        height: size,
      }}
      onClick={onClick}
    >
      {/* 秒针圈 */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={`sec-${i}`}
          className={cn(
            "absolute flex h-[2em] w-[2em] -translate-x-1/2 -translate-y-1/2 cursor-default items-center justify-center rounded-full transition-all duration-200",
            "text-[0.6em] text-muted-foreground/30",
            s === i && "z-10 scale-140 text-[1em] font-bold text-primary"
          )}
          style={getPositionStyle(i, 60, R_SEC_PCT)}
        >
          {i}
        </div>
      ))}

      {/* 小时圈 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const baseNum = isPm ? (i === 0 ? 12 : 12 + i) : i === 0 ? 12 : i
        const isCurrentHour = i === hIndex
        const displayText = isCurrentHour
          ? `${baseNum}:${String(m).padStart(2, "0")}`
          : String(baseNum)

        return (
          <div
            key={`hour-${i}`}
            suppressHydrationWarning // 文本内容可能因 SSR/CSR 时间差异而不同
            className={cn(
              "absolute flex h-[2em] min-w-[2em] w-auto whitespace-nowrap -translate-x-1/2 -translate-y-1/2 cursor-default items-center justify-center rounded-full transition-all duration-200",
              "text-[1em] text-muted-foreground/40",
              isCurrentHour && "z-10 scale-130 text-[1.5em] font-bold text-primary"
            )}
            style={getPositionStyle(i, 12, R_HOUR_PCT)}
          >
            {displayText}
          </div>
        )
      })}

      {/* 中心日期 */}
      <div className="absolute top-1/2 left-1/2 z-20 flex h-[35%] w-[35%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[0.1em] rounded-full bg-muted/5 text-center backdrop-blur-sm">
        <div suppressHydrationWarning className="mb-[0.3em] text-[0.9em] tracking-[0.2em] text-muted-foreground">
          {displayTime.getFullYear()}
        </div>
        <div className="flex items-baseline gap-[0.5em]">
          <div suppressHydrationWarning className="text-[4.5em] font-bold leading-none text-foreground drop-shadow-sm">
            {String(displayTime.getDate()).padStart(2, "0")}
          </div>
          <div suppressHydrationWarning className="text-[1.5em] font-light uppercase text-foreground/80">
            {MONTHS[displayTime.getMonth()]}
          </div>
        </div>
        <div suppressHydrationWarning className="mt-[0.6em] w-[60%] border-t border-border pt-[0.5em] text-[0.75em] tracking-[0.2em] text-muted-foreground">
          {DAYS[displayTime.getDay()]}
        </div>
      </div>
    </Container>
  )
}
