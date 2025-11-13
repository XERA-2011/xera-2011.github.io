"use client";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { cn } from '@/utils/cn';
import { usePreloader } from "../preloader";
import { useMediaQuery } from "@/hooks/use-media-query";

// 类型定义
interface Position {
  x: number;
  y: number;
}

interface QuickSetters {
  x?: (value: number) => void;
  y?: (value: number) => void;
  r?: (value: number) => void;
  width?: (value: number) => void;
  height?: (value: number) => void;
  sx?: (value: number) => void;
  sy?: (value: number) => void;
}

function useInstance<T>(value: T | (() => T)): T {
  const ref = useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = typeof value === "function" ? (value as () => T)() : value;
  }
  return ref.current;
}

// 优化的速度计算 - 使用更平滑的距离映射
function getScale(diffX: number, diffY: number): number {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  return Math.min(distance / 800, 0.3);
}

// 计算鼠标移动角度
function getAngle(diffX: number, diffY: number): number {
  return (Math.atan2(diffY, diffX) * 180) / Math.PI;
}

const CURSOR_DIAMETER = 50;

function ElasticCursor() {
  const { loadingPercent, isLoading } = usePreloader();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const jellyRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorMoved, setCursorMoved] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);
  const hoverTweenRef = useRef<gsap.core.Tween | null>(null);

  // 位置和速度对象
  const pos = useInstance<Position>(() => ({ x: 0, y: 0 }));
  const vel = useInstance<Position>(() => ({ x: 0, y: 0 }));
  const set = useInstance<QuickSetters>(() => ({}));

  // 初始化 GSAP quickSetter
  useLayoutEffect(() => {
    if (!jellyRef.current) return;
    set.x = gsap.quickSetter(jellyRef.current, "x", "px") as (value: number) => void;
    set.y = gsap.quickSetter(jellyRef.current, "y", "px") as (value: number) => void;
    set.r = gsap.quickSetter(jellyRef.current, "rotate", "deg") as (value: number) => void;
    set.sx = gsap.quickSetter(jellyRef.current, "scaleX") as (value: number) => void;
    set.sy = gsap.quickSetter(jellyRef.current, "scaleY") as (value: number) => void;
    set.width = gsap.quickSetter(jellyRef.current, "width", "px") as (value: number) => void;
    set.height = gsap.quickSetter(jellyRef.current, "height", "px") as (value: number) => void;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 优化的动画循环 - 使用 requestAnimationFrame
  const loop = useCallback(() => {
    if (!set.width || !set.sx || !set.sy || !set.r || !set.height) return;

    const rotation = getAngle(vel.x, vel.y);
    const scale = getScale(vel.x, vel.y);

    if (!isHovering && !isLoading) {
      set.x?.(pos.x);
      set.y?.(pos.y);
      set.r?.(rotation);
      set.sx?.(1 + scale);
      set.sy?.(1 - scale * 1.5);
      set.width?.(CURSOR_DIAMETER + scale * 250);
      set.height?.(CURSOR_DIAMETER);
    } else {
      // 悬停时重置变形，避免被压扁
      set.r?.(0);
      set.sx?.(1);
      set.sy?.(1);
    }

    if (!isLoading && cursorMoved) {
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [isHovering, isLoading, cursorMoved, pos, vel, set]);

  // 鼠标移动事件处理
  useLayoutEffect(() => {
    if (isMobile || isLoading) return;

    const setFromEvent = (e: MouseEvent) => {
      if (!jellyRef.current) return;

      if (!cursorMoved) {
        setCursorMoved(true);
      }

      const el = e.target as HTMLElement;

      // 查找带有 cursor-can-hover 类的元素
      let hoverElement: HTMLElement | null = null;
      let current: HTMLElement | null = el;
      while (current && current !== document.body) {
        if (current.classList.contains("cursor-can-hover")) {
          hoverElement = current;
          break;
        }
        current = current.parentElement;
      }

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (hoverElement) {
        const rect = hoverElement.getBoundingClientRect();
        setIsHovering(true);

        // 取消之前的悬停动画
        if (hoverTweenRef.current) {
          hoverTweenRef.current.kill();
        }

        // 创建新的悬停动画 - 使用完整的 DOM 尺寸
        hoverTweenRef.current = gsap.to(jellyRef.current, {
          width: rect.width + 20,
          height: rect.height + 20,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          borderRadius: 10,
          scaleX: 1,
          scaleY: 1,
          duration: 0.35,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        if (isHovering) {
          setIsHovering(false);

          if (hoverTweenRef.current) {
            hoverTweenRef.current.kill();
          }

          gsap.to(jellyRef.current, {
            borderRadius: 50,
            width: CURSOR_DIAMETER,
            height: CURSOR_DIAMETER,
            scaleX: 1,
            scaleY: 1,
            duration: 0.3,
            ease: "power3.out",
            overwrite: true,
          });
        }
      }

      // 平滑的位置动画和速度计算
      // 非悬停时才更新位置，悬停时位置由悬停动画控制
      if (!hoverElement) {
        gsap.to(pos, {
          x: mouseX,
          y: mouseY,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: () => {
            vel.x = (mouseX - pos.x) * 0.8;
            vel.y = (mouseY - pos.y) * 0.8;
          },
        });
      } else {
        // 悬停时清空速度，避免形变
        vel.x = 0;
        vel.y = 0;
      }
    };

    window.addEventListener("mousemove", setFromEvent);

    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, [isLoading, isMobile, cursorMoved, isHovering, pos, vel]);

  // 加载动画
  useEffect(() => {
    if (!jellyRef.current || !isLoading) return;

    gsap.to(jellyRef.current, {
      height: "2rem",
      borderRadius: "1rem",
      width: loadingPercent * 2 + "vw",
      duration: 0.3,
      ease: "power2.out",
    });
  }, [loadingPercent, isLoading]);

  // 启动/停止动画循环
  useEffect(() => {
    if (!isLoading && cursorMoved && !isMobile) {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [loop, isLoading, cursorMoved, isMobile]);

  if (isMobile) return null;

  return (
    <div
      ref={jellyRef}
      id="jelly-cursor"
      className={cn(
        "jelly-blob fixed left-0 top-0 pointer-events-none",
        "translate-x-[-50%] translate-y-[-50%]",
        "border-2 border-transparent rounded-full",
        "will-change-transform"
      )}
      style={{
        width: CURSOR_DIAMETER,
        height: CURSOR_DIAMETER,
        zIndex: 9999,
        backdropFilter: "invert(100%)",
        backfaceVisibility: "hidden",
        perspective: 1000,
      }}
    />
  );
}

export default ElasticCursor;
