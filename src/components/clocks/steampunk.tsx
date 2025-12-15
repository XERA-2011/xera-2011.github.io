"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Cinzel } from "next/font/google";

// 加载 Cinzel 字体
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700"],
  display: 'swap',
});

// --- 常量定义 ---
const ROMANS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

// --- 辅助函数：生成齿轮 SVG 路径 ---
function createGearPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number, holeR: number) {
  let d = "";
  const step = Math.PI * 2 / teeth;
  const width = 0.45; // 齿厚

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

export default function ClockSteampunk({ className }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);

  // Refs for animation
  const handHourRef = React.useRef<HTMLDivElement>(null);
  const handMinuteRef = React.useRef<HTMLDivElement>(null);
  const handSecondRef = React.useRef<HTMLDivElement>(null);
  const gear1Ref = React.useRef<SVGPathElement>(null);
  const gear2Ref = React.useRef<SVGPathElement>(null);
  const gear3Ref = React.useRef<SVGPathElement>(null);

  React.useEffect(() => {
    setMounted(true);
    let frameId: number;

    const animate = () => {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds() + ms / 1000;
      const min = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + min / 60;

      // 指针旋转
      if (handSecondRef.current) handSecondRef.current.style.transform = `rotate(${s * 6}deg)`;
      if (handMinuteRef.current) handMinuteRef.current.style.transform = `rotate(${min * 6}deg)`;
      if (handHourRef.current) handHourRef.current.style.transform = `rotate(${h * 30}deg)`;

      // 齿轮联动
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
  }, []);

  // --- 静态数据预计算 ---
  const ticks = React.useMemo(() => Array.from({ length: 60 }).map((_, i) => {
    const isLarge = i % 5 === 0;
    return (
      <div
        key={i}
        className={cn(
          "absolute bg-[#cba864] shadow-[0_1px_1px_rgba(0,0,0,0.8)] origin-bottom",
          isLarge
            ? "w-1 h-3 top-2.5 left-1/2 -ml-0.5"
            : "w-0.5 h-1.5 top-3.5 left-1/2 -ml-px opacity-50"
        )}
        style={{
          transform: `rotate(${i * 6}deg)`,
          transformOrigin: isLarge ? '50% 195px' : '50% 191px'
        }}
      >
        {/* v4 update: bg-gradient-to-b -> bg-linear-to-b */}
        {isLarge && <div className="absolute inset-0 bg-linear-to-b from-white to-[#cba864]" />}
      </div>
    );
  }), []);

  const numerals = React.useMemo(() => ROMANS.map((num, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const r = 168;
    const cx = 205;
    const cy = 205;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return (
      <div
        key={num}
        className="absolute text-[28px] text-[#e5d3b3] w-10 h-10 leading-10 text-center -translate-x-1/2 -translate-y-1/2"
        style={{
          left: x,
          top: y,
          textShadow: "-1px -1px 0 rgba(0,0,0,0.8), 1px 1px 0 rgba(255,255,255,0.1), 0 0 5px rgba(0,0,0,1)"
        }}
      >
        {num}
      </div>
    );
  }), []);

  const gears = React.useMemo(() => {
    const m = 1.8;
    const t1 = 40; const r1 = t1 * m / 2;
    const p1 = createGearPath(130, 130, r1 + m, r1 - 1.25 * m, t1, 15);
    const t2 = 20; const r2 = t2 * m / 2;
    const dist2 = r1 + r2;
    const ang2 = 210 * Math.PI / 180;
    const cx2 = 130 + dist2 * Math.cos(ang2);
    const cy2 = 130 + dist2 * Math.sin(ang2);
    const p2 = createGearPath(cx2, cy2, r2 + m, r2 - 1.25 * m, t2, 5);
    const t3 = 30; const r3 = t3 * m / 2;
    const dist3 = r1 + r3;
    const ang3 = -30 * Math.PI / 180;
    const cx3 = 130 + dist3 * Math.cos(ang3);
    const cy3 = 130 + dist3 * Math.sin(ang3);
    const p3 = createGearPath(cx3, cy3, r3 + m, r3 - 1.25 * m, t3, 8);
    return { p1, p2, cx2, cy2, p3, cx3, cy3 };
  }, []);

  if (!mounted) return <div className="w-[460px] h-[460px]" />;

  return (
    <div className={cn("relative flex items-center justify-center font-serif", cinzel.className, className)}>
      <div className="relative w-[460px] h-[460px] rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.6)]">

        {/* --- 金属外壳 --- */}
        {/* v4 update: z-[1] -> z-1 */}
        <div
          className="absolute inset-0 rounded-full z-1 shadow-[inset_0_0_10px_rgba(0,0,0,0.8),0_0_0_2px_#221,0_0_0_12px_#150f08]"
          style={{
            background: `conic-gradient(from 145deg, #5e4b35, #8c7048 10%, #ffd700 18%, #8c7048 25%, #5e4b35 40%, #3a2a1a 50%, #5e4b35 60%, #8c7048 75%, #ffd700 85%, #8c7048 90%, #5e4b35)`
          }}
        >
          <div className="absolute inset-[15px] rounded-full border border-dashed border-[#3c280a80] shadow-[inset_0_0_20px_#000]" />
        </div>

        {/* --- 表盘 --- */}
        {/* v4 update: z-[2] -> z-2 */}
        <div
          className="absolute inset-[25px] rounded-full z-2 border-2 border-[#5c4305] shadow-[inset_0_0_50px_rgba(0,0,0,1)]"
          style={{
            background: `
              radial-gradient(circle, #2b2015 0%, #1a120b 100%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"),
              radial-gradient(circle, #2b2015 0%, #100a05 100%)
            `,
            backgroundBlendMode: 'normal, overlay, normal'
          }}
        >
          {/* 刻度与数字 */}
          {/* v4 update: z-[4] -> z-4 */}
          <div className="absolute inset-0 pointer-events-none z-4">
            {ticks}
            {numerals}
          </div>

          {/* 机械镂空区 */}
          {/* v4 update: z-[3] -> z-3 */}
          <div className="absolute top-1/2 left-1/2 w-[260px] h-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#050301] z-3 overflow-hidden shadow-[inset_0_0_30px_#000,0_0_0_1px_#745618,0_0_0_6px_#1a120b,0_1px_2px_rgba(255,255,255,0.1)]">
            <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#edd893" />
                  <stop offset="50%" stopColor="#c5a059" />
                  <stop offset="100%" stopColor="#7a5e28" />
                </linearGradient>
                <linearGradient id="steel" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dce1f7" />
                  <stop offset="50%" stopColor="#7f8c8d" />
                  <stop offset="100%" stopColor="#2c3e50" />
                </linearGradient>
                <linearGradient id="copper" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8bfa8" />
                  <stop offset="50%" stopColor="#e07e59" />
                  <stop offset="100%" stopColor="#8b4513" />
                </linearGradient>
                <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.7)" />
                </filter>
              </defs>
              <g id="gear-assembly">
                <path ref={gear1Ref} d={gears.p1} fill="url(#brass)" filter="url(#innerGlow)" stroke="#5c4305" style={{ transformOrigin: '130px 130px' }} fillRule="evenodd" />
                <path ref={gear2Ref} d={gears.p2} fill="url(#steel)" filter="url(#innerGlow)" stroke="#333" style={{ transformOrigin: `${gears.cx2}px ${gears.cy2}px` }} fillRule="evenodd" />
                <path ref={gear3Ref} d={gears.p3} fill="url(#copper)" filter="url(#innerGlow)" stroke="#4e2a15" style={{ transformOrigin: `${gears.cx3}px ${gears.cy3}px` }} fillRule="evenodd" />
              </g>
            </svg>

            {/* 指针系统 */}
            {/* v4 update: z-[10] -> z-10 */}
            <div className="absolute inset-0 z-10 pointer-events-none drop-shadow-[4px_8px_6px_rgba(0,0,0,0.6)]">
              {/* 时针 */}
              <div ref={handHourRef} className="absolute bottom-1/2 left-1/2 w-4 h-[100px] -ml-2 bg-[#1a1a1a] border-2 border-[#bba060] rounded origin-bottom">
                <div className="absolute top-[15px] left-[3px] right-[3px] h-[70px] bg-black border border-[#555]" />
              </div>

              {/* 分针 */}
              <div ref={handMinuteRef} className="absolute bottom-1/2 left-1/2 w-1.5 h-[155px] -ml-[3px] rounded-tl-sm rounded-tr-sm rounded-b-[50%] origin-bottom shadow-[inset_0_0_2px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(to right, #6d4c26, #a0733f, #6d4c26)' }} />

              {/* 秒针 */}
              {/* v4 update: z-[12] -> z-12 */}
              <div ref={handSecondRef} className="absolute bottom-1/2 left-1/2 w-px h-[180px] -ml-[0.5px] bg-[#ff5252] z-12 shadow-[0_0_4px_rgba(255,82,82,0.6)] origin-bottom">
                <div className="absolute -bottom-[50px] -left-[3px] w-1.5 h-10 bg-[#ff5252]" style={{ clipPath: 'polygon(50% 0, 100% 20%, 50% 100%, 0% 20%)' }} />
              </div>
            </div>

            {/* 中心轴 */}
            {/* v4 update: z-[20] -> z-20 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-20 border border-[#5c4305] shadow-[0_2px_5px_rgba(0,0,0,0.8)]" style={{ background: 'radial-gradient(circle at 30% 30%, #fff, #daa520)' }} />
          </div>
        </div>

        {/* --- 玻璃罩 --- */}
        {/* v4 update: z-[100] -> z-100 */}
        <div
          className="absolute inset-0 rounded-full z-100 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.6),inset_0_0_10px_rgba(255,255,255,0.1)]"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.1) 90%, rgba(255,255,255,0.3) 100%)`
          }}
        >
          <div className="absolute top-[30px] left-[30px] w-[200px] h-[120px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_60%)] -rotate-45 blur-[5px] opacity-70" />
          <div className="absolute bottom-10 right-10 w-[150px] h-20 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_60%)] -rotate-45 blur-[10px]" />
        </div>
      </div>
    </div>
  );
}
