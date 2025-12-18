"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["700"], display: 'swap' });

const ROMANS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

function createGearPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number, holeR: number) {
  let d = "";
  const step = Math.PI * 2 / teeth;
  const width = 0.45;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const a1 = a - step * (1 - width) / 2;
    const a2 = a - step * width / 2;
    const a3 = a + step * width / 2;
    const a4 = a + step * (1 - width) / 2;
    const cos = Math.cos, sin = Math.sin;
    if (i === 0) d += `M ${cx + rInner * cos(a1)} ${cy + rInner * sin(a1)}`;
    else d += ` L ${cx + rInner * cos(a1)} ${cy + rInner * sin(a1)}`;
    d += ` L ${cx + rOuter * cos(a2)} ${cy + rOuter * sin(a2)}`;
    d += ` L ${cx + rOuter * cos(a3)} ${cy + rOuter * sin(a3)}`;
    d += ` L ${cx + rInner * cos(a4)} ${cy + rInner * sin(a4)}`;
  }
  d += " Z";
  if (holeR > 0) {
    d += ` M ${cx + holeR},${cy}`;
    d += ` A ${holeR},${holeR} 0 1,0 ${cx - holeR},${cy}`;
    d += ` A ${holeR},${holeR} 0 1,0 ${cx + holeR},${cy}`;
  }
  return d;
}

interface ClockProps {
  className?: string;
  /** 
   * 如果传入此参数，时钟将变为【静态模式】，不会运行动画。
   * 格式: "10:10:30" 或 Date 对象
   */
  staticTime?: string | Date;
}

export default function ClockSteampunk({ className, staticTime }: ClockProps) {
  const [mounted, setMounted] = React.useState(false);

  // Refs
  const handHourRef = React.useRef<HTMLDivElement>(null);
  const handMinuteRef = React.useRef<HTMLDivElement>(null);
  const handSecondRef = React.useRef<HTMLDivElement>(null);
  const gear1Ref = React.useRef<SVGPathElement>(null);
  const gear2Ref = React.useRef<SVGPathElement>(null);
  const gear3Ref = React.useRef<SVGPathElement>(null);

  // --- 静态模式计算 ---
  const staticAngles = React.useMemo(() => {
    if (!staticTime) return null;
    const date = typeof staticTime === 'string' ? new Date(`2000-01-01T${staticTime}`) : staticTime;
    const s = date.getSeconds();
    const m = date.getMinutes();
    const h = date.getHours();

    const sDeg = s * 6;
    const mDeg = m * 6 + s * 0.1;
    const hDeg = (h % 12) * 30 + m * 0.5;

    const g1 = sDeg;
    // 齿轮联动逻辑
    const g2 = -(g1 * 2) + 9;
    const g3 = -(g1 * (40 / 30)) + 6;

    return { s: sDeg, m: mDeg, h: hDeg, g1, g2, g3 };
  }, [staticTime]);

  React.useEffect(() => {
    setMounted(true);
    if (staticTime) return;

    let frameId: number;
    const animate = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds() + ms / 1000;
      const min = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + min / 60;

      if (handSecondRef.current) handSecondRef.current.style.transform = `rotate(${s * 6}deg)`;
      if (handMinuteRef.current) handMinuteRef.current.style.transform = `rotate(${min * 6}deg)`;
      if (handHourRef.current) handHourRef.current.style.transform = `rotate(${h * 30}deg)`;

      const rot1 = s * 6;
      if (gear1Ref.current) gear1Ref.current.style.transform = `rotate(${rot1}deg)`;
      const rot2 = -(rot1 * 2) + 9;
      if (gear2Ref.current) gear2Ref.current.style.transform = `rotate(${rot2}deg)`;
      const rot3 = -(rot1 * (40 / 30)) + 6;
      if (gear3Ref.current) gear3Ref.current.style.transform = `rotate(${rot3}deg)`;

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [staticTime]);

  // --- 静态资源 ---
  const ticks = React.useMemo(() => Array.from({ length: 60 }).map((_, i) => {
    const isLarge = i % 5 === 0;
    return (
      <div key={i}
        className={cn("absolute bg-[#cba864] shadow-[0_1px_1px_rgba(0,0,0,0.8)] origin-bottom", isLarge ? "w-1 h-3 top-2.5 left-1/2 -ml-0.5" : "w-0.5 h-1.5 top-3.5 left-1/2 -ml-px opacity-50")}
        style={{ transform: `rotate(${i * 6}deg)`, transformOrigin: isLarge ? '50% 195px' : '50% 191px' }}>
        {isLarge && <div className="absolute inset-0 bg-linear-to-b from-white to-[#cba864]" />}
      </div>
    );
  }), []);

  const numerals = React.useMemo(() => ROMANS.map((num, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x = 205 + 168 * Math.cos(angle);
    const y = 205 + 168 * Math.sin(angle);
    return (
      <div key={num} className="absolute text-[28px] text-[#e5d3b3] w-10 h-10 leading-10 text-center -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: y, textShadow: "-1px -1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(255,255,255,0.1), 0 0 5px rgba(0,0,0,1)" }}>
        {num}
      </div>
    );
  }), []);

  const gears = React.useMemo(() => {
    const m = 1.8;
    const p1 = createGearPath(130, 130, 36 + m, 36 - 1.25 * m, 40, 15);
    const p2 = createGearPath(130 + (36 + 18) * Math.cos(210 * Math.PI / 180), 130 + (36 + 18) * Math.sin(210 * Math.PI / 180), 18 + m, 18 - 1.25 * m, 20, 5);
    const p3 = createGearPath(130 + (36 + 27) * Math.cos(-30 * Math.PI / 180), 130 + (36 + 27) * Math.sin(-30 * Math.PI / 180), 27 + m, 27 - 1.25 * m, 30, 8);
    return { p1, p2, p3, cx2: 130 + 54 * Math.cos(210 * Math.PI / 180), cy2: 130 + 54 * Math.sin(210 * Math.PI / 180), cx3: 130 + 63 * Math.cos(-30 * Math.PI / 180), cy3: 130 + 63 * Math.sin(-30 * Math.PI / 180) };
  }, []);

  if (!mounted) return <div className={cn("relative", className)} style={{ width: 300, height: 300 }}><div className="w-full h-full rounded-full bg-[#1a120b]" /></div>;

  const ORIGINAL_SIZE = 460;
  const TARGET_SIZE = 300;
  const SCALE = TARGET_SIZE / ORIGINAL_SIZE;

  const getStyle = (deg?: number) => staticAngles && deg !== undefined ? { transform: `rotate(${deg}deg)` } : undefined;

  return (
    <div className={cn("relative flex items-center justify-center font-serif overflow-hidden select-none", cinzel.className, className)}
      style={{ width: TARGET_SIZE, height: TARGET_SIZE }}>

      <div style={{ width: ORIGINAL_SIZE, height: ORIGINAL_SIZE, transform: `scale(${SCALE})`, transformOrigin: "center", flexShrink: 0 }} className="relative">
        <div className="relative w-115 h-115 rounded-full">

          {/* --- 金属外壳 --- */}
          <div
            className="absolute inset-0 rounded-full z-1 border-12 border-[#150f08] shadow-[inset_0_0_10px_rgba(0,0,0,0.8),inset_0_0_0_2px_#221] box-border"
            style={{ background: `conic-gradient(from 145deg, #5e4b35, #8c7048 10%, #ffd700 18%, #8c7048 25%, #5e4b35 40%, #3a2a1a 50%, #5e4b35 60%, #8c7048 75%, #ffd700 85%, #8c7048 90%, #5e4b35)` }}
          >
            <div className="absolute inset-3.75 rounded-full border border-dashed border-[#3c280a80] shadow-[inset_0_0_20px_#000]" />
          </div>

          {/* --- 表盘 --- */}
          <div className="absolute inset-6.25 rounded-full z-2 border-2 border-[#5c4305] shadow-[inset_0_0_50px_rgba(0,0,0,1)]"
            style={{ background: `radial-gradient(circle, #2b2015 0%, #1a120b 100%), radial-gradient(circle, #2b2015 0%, #100a05 100%)`, backgroundBlendMode: 'normal' }}>

            <div className="absolute inset-0 pointer-events-none z-4">{ticks}{numerals}</div>

            {/* 机械镂空区 */}
            <div className="absolute top-1/2 left-1/2 w-65 h-65 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#050301] z-3 overflow-hidden shadow-[inset_0_0_30px_#000,0_0_0_1px_#745618,0_0_0_6px_#1a120b]">
              <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#edd893" /><stop offset="50%" stopColor="#c5a059" /><stop offset="100%" stopColor="#7a5e28" /></linearGradient>
                  <linearGradient id="steel" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#dce1f7" /><stop offset="50%" stopColor="#7f8c8d" /><stop offset="100%" stopColor="#2c3e50" /></linearGradient>
                  <linearGradient id="copper" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#f8bfa8" /><stop offset="50%" stopColor="#e07e59" /><stop offset="100%" stopColor="#8b4513" /></linearGradient>
                  <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.7)" /></filter>
                </defs>
                <g>
                  <path ref={gear1Ref} d={gears.p1} fill="url(#brass)" filter="url(#innerGlow)" stroke="#5c4305" style={{ transformOrigin: '130px 130px', ...getStyle(staticAngles?.g1) }} fillRule="evenodd" />
                  <path ref={gear2Ref} d={gears.p2} fill="url(#steel)" filter="url(#innerGlow)" stroke="#333" style={{ transformOrigin: `${gears.cx2}px ${gears.cy2}px`, ...getStyle(staticAngles?.g2) }} fillRule="evenodd" />
                  <path ref={gear3Ref} d={gears.p3} fill="url(#copper)" filter="url(#innerGlow)" stroke="#4e2a15" style={{ transformOrigin: `${gears.cx3}px ${gears.cy3}px`, ...getStyle(staticAngles?.g3) }} fillRule="evenodd" />
                </g>
              </svg>

              {/* 指针系统 */}
              <div className="absolute inset-0 z-10 pointer-events-none drop-shadow-[4px_8px_6px_rgba(0,0,0,0.6)]">
                <div ref={handHourRef} style={getStyle(staticAngles?.h)} className="absolute bottom-1/2 left-1/2 w-4 h-25 -ml-2 bg-[#1a1a1a] border-2 border-[#bba060] rounded origin-bottom">
                  <div className="absolute top-3.75 left-0.75 right-0.75 h-17.5 bg-black border border-[#555]" />
                </div>
                <div ref={handMinuteRef} style={{ background: 'linear-gradient(to right, #6d4c26, #a0733f, #6d4c26)', ...getStyle(staticAngles?.m) }} className="absolute bottom-1/2 left-1/2 w-1.5 h-38.75 -ml-0.75 rounded-tl-sm rounded-tr-sm rounded-b-[50%] origin-bottom shadow-[inset_0_0_2px_rgba(0,0,0,0.5)]" />
                <div ref={handSecondRef} style={getStyle(staticAngles?.s)} className="absolute bottom-1/2 left-1/2 w-px h-45 -ml-[0.5px] bg-[#ff5252] z-12 shadow-[0_0_4px_rgba(255,82,82,0.6)] origin-bottom">
                  <div className="absolute -bottom-12.5 -left-0.75 w-1.5 h-10 bg-[#ff5252]" style={{ clipPath: 'polygon(50% 0, 100% 20%, 50% 100%, 0% 20%)' }} />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-20 border border-[#5c4305] shadow-[0_2px_5px_rgba(0,0,0,0.8)]" style={{ background: 'radial-gradient(circle at 30% 30%, #fff, #daa520)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
