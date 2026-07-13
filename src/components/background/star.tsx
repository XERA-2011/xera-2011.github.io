"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { useMousePosition } from "@/utils/mouse";
import { useTheme } from "next-themes";

interface ParticlesProps {
  /** 粒子/星星的数量，默认值为100 */
  quantity?: number;
  /** 控制粒子对鼠标移动的反应灵敏度，值越大反应越小，默认值为50 */
  staticity?: number;
  /** 控制粒子移动的平滑度，值越大移动越平滑但反应越慢，默认值为50 */
  ease?: number;
  /** 是否刷新/重绘粒子，当值变化时会触发重新初始化画布 */
  refresh?: boolean;
  /** 是否启用星空模式，启用后会模拟真实星空效果，包括闪烁和光晕，默认为true */
  starMode?: boolean;
  /** 是否启用彩色模式，启用后星星会有多种颜色，否则全为白色，默认为true */
  colorful?: boolean;
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
  colorIndex: number;
  spriteType: "small" | "medium" | "large";
  twinkleSpeed: number; // 闪烁速度
  twinkleDirection: number; // 闪烁方向 (1 或 -1)
  depth: number; // 星星深度感，用于视差效果
};

interface StarSprite {
  small: HTMLCanvasElement;
  medium: HTMLCanvasElement;
  large: HTMLCanvasElement;
}

// 辅助函数：十六进制颜色转RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export default function Particles({
  quantity = 100,
  staticity = 20,
  ease = 20,
  refresh = false,
  starMode = true,
  colorful = true,
}: ParticlesProps) {
  const { theme, resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  
  // 缓存 Sprites 的 Ref
  const sprites = useRef<StarSprite[]>([]);

  // 将 props 存入 refs 避免 raf 闭包过期问题
  const quantityRef = useRef(quantity);
  const staticityRef = useRef(staticity);
  const easeRef = useRef(ease);
  const starModeRef = useRef(starMode);
  const colorfulRef = useRef(colorful);

  useEffect(() => { quantityRef.current = quantity; }, [quantity]);
  useEffect(() => { staticityRef.current = staticity; }, [staticity]);
  useEffect(() => { easeRef.current = ease; }, [ease]);
  useEffect(() => { starModeRef.current = starMode; }, [starMode]);
  useEffect(() => { colorfulRef.current = colorful; }, [colorful]);

  const dpr = 1;

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h
      );
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): number => {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  // 星空颜色调色板 - 根据主题切换
  const starColors = useMemo(() => {
    const currentTheme = resolvedTheme || theme || "dark";

    if (currentTheme === "light") {
      return [
        "#000000",
        "#1a1a1a",
        "#2d2d2d",
        "#404040",
        "#333333",
        "#262626",
        "#4a4a4a",
        "#1f1f1f",
      ];
    } else {
      return [
        "#ffffff",
        "#fffaf0",
        "#f8f8ff",
        "#f0f8ff",
        "#f5f5f5",
        "#fffafa",
        "#ffe4e1",
        "#e6e6fa",
        "#b0e0e6",
        "#87cefa",
      ];
    }
  }, [theme, resolvedTheme]);

  // 预渲染星星纹理精灵 (Offscreen Sprites)
  const buildSprites = useCallback(() => {
    sprites.current = starColors.map((color) => {
      const rgb = hexToRgb(color) || { r: 255, g: 255, b: 255 };
      const { r, g, b } = rgb;

      // 1. Small Sprite: 纯圆形。基础尺寸 8x8 (中心点 4, 4, 星体半径 2)
      const small = document.createElement("canvas");
      small.width = 8;
      small.height = 8;
      const ctxS = small.getContext("2d")!;
      ctxS.beginPath();
      ctxS.arc(4, 4, 2, 0, 2 * Math.PI);
      ctxS.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctxS.fill();

      // 2. Medium Sprite: 带径向渐变光晕。基础尺寸 24x24 (中心点 12, 12, 星体半径 2, 光晕半径 8)
      const medium = document.createElement("canvas");
      medium.width = 24;
      medium.height = 24;
      const ctxM = medium.getContext("2d")!;
      
      const gradM = ctxM.createRadialGradient(12, 12, 0, 12, 12, 8);
      gradM.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      gradM.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`);
      gradM.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctxM.beginPath();
      ctxM.arc(12, 12, 8, 0, 2 * Math.PI);
      ctxM.fillStyle = gradM;
      ctxM.fill();
      
      ctxM.beginPath();
      ctxM.arc(12, 12, 2, 0, 2 * Math.PI);
      ctxM.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctxM.fill();

      // 3. Large Sprite: 带渐变光晕和十字光芒。基础尺寸 36x36 (中心点 18, 18, 星体半径 2, 光晕半径 8, 星芒半径 10)
      const large = document.createElement("canvas");
      large.width = 36;
      large.height = 36;
      const ctxL = large.getContext("2d")!;
      
      const gradL = ctxL.createRadialGradient(18, 18, 0, 18, 18, 8);
      gradL.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      gradL.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`);
      gradL.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctxL.beginPath();
      ctxL.arc(18, 18, 8, 0, 2 * Math.PI);
      ctxL.fillStyle = gradL;
      ctxL.fill();

      // 十字光芒
      ctxL.beginPath();
      ctxL.moveTo(18 - 10, 18);
      ctxL.lineTo(18 + 10, 18);
      ctxL.moveTo(18, 18 - 10);
      ctxL.lineTo(18, 18 + 10);
      // 对角线光芒
      ctxL.moveTo(18 - 7, 18 - 7);
      ctxL.lineTo(18 + 7, 18 + 7);
      ctxL.moveTo(18 - 7, 18 + 7);
      ctxL.lineTo(18 + 7, 18 - 7);

      ctxL.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
      ctxL.lineWidth = 0.5;
      ctxL.stroke();

      // 中心实体
      ctxL.beginPath();
      ctxL.arc(18, 18, 2, 0, 2 * Math.PI);
      ctxL.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctxL.fill();

      return { small, medium, large };
    });
  }, [starColors]);

  const circleParams = useCallback((): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;

    // 星空大小分布 - 85%小星星, 12%中星星, 3%大星星
    const sizeDistribution = Math.random();
    let size;

    if (sizeDistribution < 0.85) {
      size = Math.random() * 0.3 + 0.5;
    } else if (sizeDistribution < 0.97) {
      size = Math.random() * 0.4 + 0.8;
    } else {
      size = Math.random() * 0.6 + 1.2;
    }

    const alpha = 0;
    const brightnessBase = Math.random() * 0.4 + 0.2;
    const sizeFactor = size * 0.3;
    const targetAlpha = parseFloat((brightnessBase + sizeFactor).toFixed(1));

    const movementSpeed = starModeRef.current ? 0.01 : 0.2;
    const dx = (Math.random() - 0.5) * movementSpeed;
    const dy = (Math.random() - 0.5) * movementSpeed;

    const magnetism = 0.1 + Math.random() * 4;

    const colorIndex = Math.floor(Math.random() * starColors.length);

    // 决定使用的 Sprite 类型
    let spriteType: "small" | "medium" | "large" = "small";
    if (starModeRef.current) {
      if (size > 0.8) {
        spriteType = "large";
      } else if (size > 0.7) {
        spriteType = "medium";
      }
    }

    const twinkleSpeed = Math.random() * 0.01 + 0.002;
    const twinkleDirection = Math.random() > 0.5 ? 1 : -1;
    const depth = Math.random();

    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
      colorIndex,
      spriteType,
      twinkleSpeed,
      twinkleDirection,
      depth,
    };
  }, [starColors]);

  const drawCircle = useCallback((circle: Circle, update = false) => {
    if (context.current && sprites.current[circle.colorIndex]) {
      const { x, y, translateX, translateY, size, alpha, spriteType, colorIndex } = circle;
      const spriteSet = sprites.current[colorIndex];
      const sprite = spriteSet[spriteType];

      // 缩放因子：Sprite 中星体半径是 2 (直径 4)；实际星体直径为 size * 2
      const scale = size / 2;
      const destWidth = sprite.width * scale;
      const destHeight = sprite.height * scale;

      // 居中对齐到物理渲染点
      const destX = x + translateX - destWidth / 2;
      const destY = y + translateY - destHeight / 2;

      context.current.save();
      context.current.globalAlpha = alpha;
      context.current.drawImage(sprite, destX, destY, destWidth, destHeight);
      context.current.restore();

      if (!update) {
        circles.current.push(circle);
      }
    }
  }, []);

  const drawParticles = useCallback(() => {
    clearContext();
    circles.current.length = 0;
    
    // 移动端自适应减少星星数量
    const isMobile = canvasSize.current.w <= 768;
    const actualQuantity = isMobile 
      ? Math.min(40, quantityRef.current) 
      : quantityRef.current;

    for (let i = 0; i < actualQuantity; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  }, [circleParams, drawCircle]);

  const initCanvas = useCallback(() => {
    resizeCanvas();
    drawParticles();
  }, [drawParticles]);

  const onMouseMove = useCallback(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mousePosition.x - rect.left - w / 2;
      const y = mousePosition.y - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  }, [mousePosition.x, mousePosition.y]);

  const animate = useCallback(() => {
    if (!isVisibleRef.current) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    clearContext();
    circles.current.forEach((circle: Circle) => {
      // 处理边缘透明度
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      );

      // 星空模式下添加闪烁效果
      if (starModeRef.current) {
        const twinkleSpeedFactor = 1 - circle.size * 0.5;
        circle.targetAlpha += circle.twinkleSpeed * circle.twinkleDirection * twinkleSpeedFactor;

        if (circle.targetAlpha > 0.7 + circle.size * 0.2) {
          circle.twinkleDirection = -1;
        } else if (circle.targetAlpha < 0.2 + circle.size * 0.1) {
          circle.twinkleDirection = 1;
        }

        const minAlpha = 0.1 + circle.size * 0.1;
        const maxAlpha = 0.6 + circle.size * 0.3;
        circle.targetAlpha = Math.max(minAlpha, Math.min(maxAlpha, circle.targetAlpha));
      }

      // 透明度渐变
      if (remapClosestEdge > 1) {
        circle.alpha += 0.01;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }

      // 更新位置
      circle.x += circle.dx;
      circle.y += circle.dy;

      const depthFactor = starModeRef.current ? (0.1 + circle.depth * 0.9) : 1;
      const mouseInfluence = mouse.current.x !== 0 || mouse.current.y !== 0 ? 1 : 0;

      circle.translateX +=
        (mouse.current.x / (staticityRef.current / (circle.magnetism * depthFactor)) - circle.translateX) /
        easeRef.current * mouseInfluence;
      circle.translateY +=
        (mouse.current.y / (staticityRef.current / (circle.magnetism * depthFactor)) - circle.translateY) /
        easeRef.current * mouseInfluence;

      // 检查是否超出画布
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        // 原地重置以避免使用 splice 引发的索引偏移问题及内存分配抖动
        const newParams = circleParams();
        Object.assign(circle, newParams);
      } else {
        drawCircle(
          {
            ...circle,
            x: circle.x,
            y: circle.y,
            translateX: circle.translateX,
            translateY: circle.translateY,
            alpha: circle.alpha,
          },
          true
        );
      }
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [circleParams, drawCircle]);

  // 初始化画布
  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    buildSprites();
    initCanvas();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, [starColors, initCanvas, buildSprites]);

  // 控制 Tab 切换时的后台挂起，降低能耗
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 启动唯一的动画循环
  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate]);

  useEffect(() => {
    onMouseMove();
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    buildSprites();
    initCanvas();
  }, [refresh]);

  return (
    <div
      className="fixed inset-0 -z-10 animate-fade-in bg-background"
      ref={canvasContainerRef}
      aria-hidden="true"
      suppressHydrationWarning
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
