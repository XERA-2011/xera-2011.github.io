"use client";

import React, { useRef, useEffect, useCallback } from 'react';

type Star = {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
};

type Dot = {
  id: number;
  x: number;
  y: number;
  r: number;
  a: number;
  dir: number;
  speed: number;
  aReduction: number;
  color: string;
  linkColor: string;
};

const Constellation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const stars = useRef<Record<number, Star | null>>({});
  const dots = useRef<Record<number, Dot | null>>({});
  const dotIdCounter = useRef(0);
  const canvasSize = useRef({ width: 0, height: 0 });
  const mouse = useRef({ x: 0, y: 0, moving: false });
  const mouseMoveChecker = useRef<NodeJS.Timeout | null>(null);

  const setCanvasSize = useCallback(() => {
    if (canvasRef.current) {
      const { clientWidth, clientHeight } = document.documentElement;
      canvasSize.current = { width: clientWidth, height: clientHeight };
      canvasRef.current.width = clientWidth;
      canvasRef.current.height = clientHeight;
    }
  }, []);

  const createStar = useCallback((id: number, x?: number, y?: number) => {
    const { width, height } = canvasSize.current;
    const alpha = (Math.floor(Math.random() * 10) + 1) / 10 / 2;
    const star: Star = {
      id,
      x: x ?? Math.floor(Math.random() * width),
      y: y ?? Math.floor(Math.random() * height),
      r: Math.floor(Math.random() * 2) + 1,
      color: `rgba(255,255,255,${alpha})`,
    };
    stars.current[id] = star;
  }, []);

  const createDot = useCallback((id: number, x: number, y: number) => {
    const dot: Dot = {
      id,
      x,
      y,
      r: Math.floor(Math.random() * 5) + 1,
      a: 0.5,
      dir: Math.floor(Math.random() * 140) + 200,
      speed: 0.5,
      aReduction: 0.005,
      get color() {
        return `rgba(255,255,255,${this.a})`;
      },
      get linkColor() {
        return `rgba(255,255,255,${this.a / 4})`;
      },
    };
    dots.current[id] = dot;
  }, []);

  const drawStar = useCallback((star: Star) => {
    const ctx = context.current;
    if (!ctx) return;
    ctx.fillStyle = star.color;
    ctx.shadowBlur = star.r * 2;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }, []);

  const moveStar = useCallback((star: Star) => {
    star.y -= 0.15;
    if (star.y <= -10) star.y = canvasSize.current.height + 10;
    drawStar(star);
  }, [drawStar]);

  const drawDot = useCallback((dot: Dot) => {
    const ctx = context.current;
    if (!ctx) return;
    ctx.fillStyle = dot.color;
    ctx.shadowBlur = dot.r * 2;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }, []);

  const getPreviousDot = (id: number, stepback: number): Dot | false => {
    if (id === 0 || id - stepback < 0) return false;
    const prevDot = dots.current[id - stepback];
    return prevDot || false;
  };

  const linkDot = useCallback((dot: Dot) => {
    const ctx = context.current;
    if (!ctx || dot.id === 0) return;

    const previousDot1 = getPreviousDot(dot.id, 1);
    const previousDot2 = getPreviousDot(dot.id, 2);
    const previousDot3 = getPreviousDot(dot.id, 3);

    if (!previousDot1) return;

    ctx.strokeStyle = dot.linkColor;
    ctx.moveTo(previousDot1.x, previousDot1.y);
    ctx.beginPath();
    ctx.lineTo(dot.x, dot.y);
    if (previousDot2) ctx.lineTo(previousDot2.x, previousDot2.y);
    if (previousDot3) ctx.lineTo(previousDot3.x, previousDot3.y);
    ctx.stroke();
    ctx.closePath();
  }, []);

  const moveDot = useCallback((dot: Dot) => {
    dot.a -= dot.aReduction;
    if (dot.a <= 0) {
      dots.current[dot.id] = null;
      return;
    }
    const rad = dot.dir * (Math.PI / 180);
    dot.x += Math.cos(rad) * dot.speed;
    dot.y += Math.sin(rad) * dot.speed;

    drawDot(dot);
    linkDot(dot);
  }, [drawDot, linkDot]);

  const drawIfMouseMoving = useCallback(() => {
    if (!mouse.current.moving) return;

    const newDotId = dotIdCounter.current;

    if (newDotId === 0) {
      createDot(0, mouse.current.x, mouse.current.y);
      const newDot = dots.current[0];
      if (newDot) drawDot(newDot);
      dotIdCounter.current++;
      return;
    }

    const previousDot = getPreviousDot(newDotId, 1);
    if (!previousDot) return;

    const { x: prevX, y: prevY } = previousDot;
    const { x: mouseX, y: mouseY } = mouse.current;
    const diffX = Math.abs(prevX - mouseX);
    const diffY = Math.abs(prevY - mouseY);

    const dotsMinDist = 2;
    if (diffX < dotsMinDist || diffY < dotsMinDist) return;

    const maxDistFromCursor = 50;
    const xVariation = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random() * maxDistFromCursor) + 1);
    const yVariation = (Math.random() > 0.5 ? -1 : 1) * (Math.floor(Math.random() * maxDistFromCursor) + 1);
    
    createDot(newDotId, mouseX + xVariation, mouseY + yVariation);
    const newDot = dots.current[newDotId];
    if (newDot) {
        drawDot(newDot);
        linkDot(newDot);
    }
    dotIdCounter.current++;
  }, [createDot, drawDot, linkDot]);

  const animate = useCallback(() => {
    const ctx = context.current;
    const { width, height } = canvasSize.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (const i in stars.current) {
      const star = stars.current[i];
      if (star) moveStar(star);
    }
    for (const i in dots.current) {
      const dot = dots.current[i];
      if (dot) moveDot(dot);
      else delete dots.current[i];
    }
    
    drawIfMouseMoving();
    requestAnimationFrame(animate);
  }, [moveStar, moveDot, drawIfMouseMoving]);

  const init = useCallback(() => {
    const ctx = context.current;
    if (!ctx) return;
    setCanvasSize();
    ctx.strokeStyle = 'white';
    ctx.shadowColor = 'white';

    const initStarsPopulation = 80;
    for (let i = 0; i < initStarsPopulation; i++) {
      createStar(i);
    }
    ctx.shadowBlur = 0;
    animate();
  }, [setCanvasSize, createStar, animate]);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d');
      init();
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.moving = true;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (mouseMoveChecker.current) {
        clearTimeout(mouseMoveChecker.current);
      }
      mouseMoveChecker.current = setTimeout(() => {
        mouse.current.moving = false;
      }, 100);
    };

    const handleResize = () => {
        setCanvasSize();
        // Re-initialize or adjust elements on resize if needed
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mouseMoveChecker.current) {
        clearTimeout(mouseMoveChecker.current);
      }
    };
  }, [init, setCanvasSize]);

  return (
    <div className="fixed inset-0 -z-10">
      <canvas ref={canvasRef} id="canvas" />
    </div>
  );
};

export default Constellation;