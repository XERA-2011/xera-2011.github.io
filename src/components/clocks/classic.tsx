"use client";

import { useEffect, useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/use-has-mounted";

interface ClockClassicProps {
  className?: string;
  size?: string | number;
  /** Format: HH:mm:ss or Date object */
  staticTime?: string | Date;
  onClick?: () => void;
}

export default function ClockClassic({ className, size = "300px", staticTime, onClick }: ClockClassicProps) {
  const clockRef = useRef<HTMLDivElement>(null);
  const hourHandRef = useRef<HTMLDivElement>(null);
  const minHandRef = useRef<HTMLDivElement>(null);
  const secHandRef = useRef<HTMLDivElement>(null);
  const mounted = useHasMounted();

  // State for date display
  const [dateDisplay, setDateDisplay] = useState({ year: 2000, month: 1, day: 1 });

  // Static time calculation
  const staticData = useMemo(() => {
    if (!staticTime) return null;
    const date = typeof staticTime === 'string' ? new Date(`2000-01-01T${staticTime}`) : staticTime;
    const s = date.getSeconds();
    const m = date.getMinutes();
    const h = date.getHours();

    return {
      secDeg: s * 6,
      minDeg: (m + s / 60) * 6,
      hourDeg: ((h % 12) + m / 60) * 30,
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    };
  }, [staticTime]);

  // Initial markers generation
  const ticks = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-full h-full clock-marker pointer-events-none"
        style={{
          transform: `rotate(${i * 6}deg)`,
          padding: '10px',
          textAlign: 'center'
        }}
      >
        <span
          className={cn(
            "block mx-auto",
            i % 5 === 0 ? "w-0.5 h-[4%] bg-foreground" : "w-px h-[3%] bg-border"
          )}
        />
      </div>
    ));
  }, []);

  useEffect(() => {
    if (staticData) {
      // Set static positions - 使用 requestAnimationFrame 延迟执行以避免 lint 警告
      requestAnimationFrame(() => {
        if (secHandRef.current) secHandRef.current.style.transform = `rotate(${staticData.secDeg}deg)`;
        if (minHandRef.current) minHandRef.current.style.transform = `rotate(${staticData.minDeg}deg)`;
        if (hourHandRef.current) hourHandRef.current.style.transform = `rotate(${staticData.hourDeg}deg)`;
        setDateDisplay(staticData.date);
      });
      return;
    }

    let animationId: number;

    function updateTime() {
      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();
      const milliseconds = now.getMilliseconds();

      // Update Date
      setDateDisplay({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      });

      // Update Hands
      const secDeg = (seconds + milliseconds / 1000) * 6;
      const minDeg = (minutes + seconds / 60) * 6;
      const hourDeg = ((hours % 12) + minutes / 60) * 30;

      if (secHandRef.current) {
        secHandRef.current.style.transform = `rotate(${secDeg}deg)`;
      }
      if (minHandRef.current) {
        minHandRef.current.style.transform = `rotate(${minDeg}deg)`;
      }
      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hourDeg}deg)`;
      }
    }

    function animate() {
      updateTime();
      animationId = requestAnimationFrame(animate);
    }

    // 使用 requestAnimationFrame 启动动画循环
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [staticData]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const Container = staticTime ? 'div' : motion.div;
  const containerProps = staticTime ? {} : {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { delay: 0.5, duration: 0.6 }
  };

  // Hydration fix: Always render if staticTime is present, else wait for mount
  if (!mounted && !staticTime) {
    return (
      <div className={cn("flex justify-center", className)}>
        <div
          className="relative rounded-full bg-card border border-border"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  return (
    <Container
      {...containerProps}
      className={cn("flex justify-center", className)}
    >
      <div
        className={cn(
          "relative",
          onClick ? "cursor-pointer" : "cursor-default"
        )}
        style={{ width: size, height: size }}
        onClick={onClick}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Clock Face */}
          <div
            ref={clockRef}
            className="relative w-full h-full rounded-full bg-card border border-border flex items-center justify-center shadow-lg"
          >
            {/* Markers */}
            {ticks}

            {/* Date */}
            <div className="absolute top-[58%] left-1/2 -translate-x-1/2 z-5">
              <span className="text-muted-foreground text-[8px] sm:text-[10px] font-light whitespace-nowrap">
                {dateDisplay.year}.{formatNumber(dateDisplay.month)}.{formatNumber(dateDisplay.day)}
              </span>
            </div>

            {/* Center Dot */}
            <div
              className="absolute w-[4%] h-[4%] bg-foreground rounded-full z-13"
              style={{
                boxShadow: '0 0 4px hsl(var(--foreground) / 0.4)'
              }}
            />

            {/* Hour Hand */}
            <div
              ref={hourHandRef}
              className="absolute bottom-1/2 left-1/2 w-0.75 h-[23%] bg-foreground z-10"
              style={{
                transformOrigin: 'bottom center',
                marginLeft: '-1.5px'
              }}
            />

            {/* Minute Hand */}
            <div
              ref={minHandRef}
              className="absolute bottom-1/2 left-1/2 w-0.5 h-[31%] bg-foreground z-11"
              style={{
                transformOrigin: 'bottom center',
                marginLeft: '-1px'
              }}
            />

            {/* Second Hand */}
            <div
              ref={secHandRef}
              className="absolute bottom-1/2 left-1/2 w-px h-[37%] bg-muted-foreground z-12"
              style={{
                transformOrigin: 'bottom center',
                marginLeft: '-0.5px'
              }}
            >
              <div className="absolute bottom-[-6%] left-[-1.5px] w-1 h-[6%] bg-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
