"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { useMousePosition } from "@/utils/mouse";

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
  color: string; // 颜色属性
  twinkleSpeed: number; // 闪烁速度
  twinkleDirection: number; // 闪烁方向 (1 或 -1)
  depth: number; // 星星深度感，用于视差效果
};

export default function Particles({
  quantity = 100,
  staticity = 20,
  ease = 20,
  refresh = false,
  starMode = true, // 默认启用星空模式
  colorful = true, // 默认启用彩色模式
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  // 确保服务器端和客户端使用相同的 dpr 值
  const dpr = 1;

  const drawParticles = useCallback(() => {
    clearContext();
    const particleCount = quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  }, [quantity]);

  const initCanvas = useCallback(() => {
    resizeCanvas();
    drawParticles();
  }, []);

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
    clearContext();
    circles.current.forEach((circle: Circle, i: number) => {
      // 处理边缘透明度
      const edge = [
        circle.x + circle.translateX - circle.size, // 左边缘距离
        canvasSize.current.w - circle.x - circle.translateX - circle.size, // 右边缘距离
        circle.y + circle.translateY - circle.size, // 上边缘距离
        canvasSize.current.h - circle.y - circle.translateY - circle.size, // 下边缘距离
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      );

      // 星空模式下添加闪烁效果 - 更自然的闪烁
      if (starMode) {
        // 闪烁效果 - 大小星星闪烁频率不同
        const twinkleSpeedFactor = 1 - circle.size * 0.5; // 小星星闪烁更快
        circle.targetAlpha += circle.twinkleSpeed * circle.twinkleDirection * twinkleSpeedFactor;

        // 改变闪烁方向 - 更自然的亮度范围
        if (circle.targetAlpha > 0.7 + circle.size * 0.2) { // 大星星可以更亮
          circle.twinkleDirection = -1;
        } else if (circle.targetAlpha < 0.2 + circle.size * 0.1) { // 大星星最暗时也比小星星亮
          circle.twinkleDirection = 1;
        }

        // 限制透明度范围 - 基于星星大小
        const minAlpha = 0.1 + circle.size * 0.1;
        const maxAlpha = 0.6 + circle.size * 0.3;
        circle.targetAlpha = Math.max(minAlpha, Math.min(maxAlpha, circle.targetAlpha));
      }

      // 透明度渐变
      if (remapClosestEdge > 1) {
        circle.alpha += 0.01; // 更缓慢的淡入
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }

      // 更新位置 - 星空模式下几乎静止
      circle.x += circle.dx;
      circle.y += circle.dy;

      // 视差效果 - 深度越大的星星移动越慢，模拟三维空间
      const depthFactor = starMode ? (0.1 + circle.depth * 0.9) : 1;

      // 鼠标交互 - 考虑深度因素，更自然的移动
      const mouseInfluence = mouse.current.x !== 0 || mouse.current.y !== 0
        ? 1
        : 0; // 鼠标不动时星星也不动

      circle.translateX +=
        (mouse.current.x / (staticity / (circle.magnetism * depthFactor)) - circle.translateX) /
        ease * mouseInfluence;
      circle.translateY +=
        (mouse.current.y / (staticity / (circle.magnetism * depthFactor)) - circle.translateY) /
        ease * mouseInfluence;

      // 检查是否超出画布
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        // 移除并创建新星星
        circles.current.splice(i, 1);
        const newCircle = circleParams();
        drawCircle(newCircle);
      } else {
        // 更新星星位置
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
    window.requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, []);

  useEffect(() => {
    onMouseMove();
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

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

  // 星空颜色调色板 - 更加自然的星空色彩
  const starColors = useMemo(() => [
    "#ffffff", // 纯白
    "#fffaf0", // 花白
    "#f8f8ff", // 幽灵白
    "#f0f8ff", // 爱丽丝蓝
    "#f5f5f5", // 白烟
    "#fffafa", // 雪白
    "#ffe4e1", // 薄雾玫瑰
    "#e6e6fa", // 薰衣草
    "#b0e0e6", // 粉蓝
    "#87cefa", // 浅天蓝
  ], []);

  const circleParams = useCallback((): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;

    // 星空大小分布 - 漫天繁星效果：85%小星星, 12%中星星, 3%大星星
    const sizeDistribution = Math.random();
    let size;

    if (sizeDistribution < 0.85) {
      // 85% 的星星较小 (0.5-0.8)
      size = Math.random() * 0.3 + 0.5;
    } else if (sizeDistribution < 0.97) {
      // 12% 的星星中等 (0.8-1.2)
      size = Math.random() * 0.4 + 0.8;
    } else {
      // 3% 的星星较大 (1.2-1.8)
      size = Math.random() * 0.6 + 1.2;
    }

    const alpha = 0;

    // 亮度与大小相关 - 更大的星星更亮
    const brightnessBase = Math.random() * 0.4 + 0.2; // 基础亮度在0.2-0.6之间
    const sizeFactor = size * 0.3; // 大小因子，大星星更亮
    const targetAlpha = parseFloat((brightnessBase + sizeFactor).toFixed(1));

    // 星空模式下移动更慢 - 真实星空几乎静止
    const movementSpeed = starMode ? 0.01 : 0.2;
    const dx = (Math.random() - 0.5) * movementSpeed;
    const dy = (Math.random() - 0.5) * movementSpeed;

    // 磁力因子 - 控制鼠标影响
    const magnetism = 0.1 + Math.random() * 4;

    // 选择颜色 - 更自然的星空色彩
    const color = colorful
      ? starColors[Math.floor(Math.random() * starColors.length)]
      : "#ffffff";

    // 闪烁效果参数 - 更自然的闪烁
    const twinkleSpeed = Math.random() * 0.01 + 0.002; // 更缓慢的闪烁
    const twinkleDirection = Math.random() > 0.5 ? 1 : -1;

    // 深度感，用于视差效果 - 模拟三维星空
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
      color,
      twinkleSpeed,
      twinkleDirection,
      depth
    };
  }, []);

  const drawCircle = useCallback((circle: Circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha, color } = circle;
      context.current.translate(translateX, translateY);

      // 只为较大的星星绘制光晕和光芒
      if (starMode && size > 0.7) {
        // 光晕效果 - 更柔和的渐变
        const haloSize = size * 2;
        const gradient = context.current.createRadialGradient(
          x, y, 0,
          x, y, haloSize
        );
        gradient.addColorStop(0, color.replace(')', ', ' + alpha + ')').replace('rgb', 'rgba'));
        gradient.addColorStop(0.5, color.replace(')', ', ' + alpha * 0.2 + ')').replace('rgb', 'rgba'));
        gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));

        context.current.beginPath();
        context.current.arc(x, y, haloSize, 0, 2 * Math.PI);
        context.current.fillStyle = gradient;
        context.current.fill();

        // 光芒效果 - 更细腻的十字星芒
        if (size > 0.8) {
          context.current.save();

          // 光芒长度与亮度
          const rayLength = size * 2.5;
          const rayAlpha = alpha * 0.1;

          // 绘制光芒
          context.current.beginPath();

          // 主光芒
          context.current.moveTo(x - rayLength, y);
          context.current.lineTo(x + rayLength, y);
          context.current.moveTo(x, y - rayLength);
          context.current.lineTo(x, y + rayLength);

          // 对角线光芒 - 更短
          const diagonalLength = rayLength * 0.7;
          context.current.moveTo(x - diagonalLength * 0.7, y - diagonalLength * 0.7);
          context.current.lineTo(x + diagonalLength * 0.7, y + diagonalLength * 0.7);
          context.current.moveTo(x - diagonalLength * 0.7, y + diagonalLength * 0.7);
          context.current.lineTo(x + diagonalLength * 0.7, y - diagonalLength * 0.7);

          context.current.strokeStyle = color.replace(')', ', ' + rayAlpha + ')').replace('rgb', 'rgba');
          context.current.lineWidth = size / 8; // 更细的光芒
          context.current.stroke();
          context.current.restore();
        }
      }

      // 绘制星星主体 - 所有星星都有
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = color.replace(')', ', ' + alpha + ')').replace('rgb', 'rgba');
      context.current.fill();

      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  }, []);

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

  return (
    <div
      className={"dark:bg-gradient-to-tl from-black via-zinc-600/20 to-black fixed inset-0 -z-10 animate-fade-in"}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
