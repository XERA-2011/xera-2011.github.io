"use client";

import { useEffect, useRef } from "react";

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mouse position tracking
    const mouse = { x: 0, y: 0 };

    // Set canvas size - exactly like original
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particles for neural network effect - exactly like original
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
    }> = [];

    // Create particles - exactly like original
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width / window.devicePixelRatio,
        y: Math.random() * canvas.height / window.devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        size: Math.random() * 3 + 1.5
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles with mouse interaction
      particles.forEach((particle, i) => {
        // Mouse interaction - attract particles to mouse
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx += (dx / distance) * force * 0.02;
          particle.vy += (dy / distance) * force * 0.02;
        }

        // Add random movement to keep particles active
        particle.vx += (Math.random() - 0.5) * 0.01;
        particle.vy += (Math.random() - 0.5) * 0.01;

        // Apply friction to prevent particles from moving too fast
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Ensure minimum movement speed
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed < 0.1) {
          particle.vx += (Math.random() - 0.5) * 0.2;
          particle.vy += (Math.random() - 0.5) * 0.2;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width / window.devicePixelRatio;
        if (particle.x > canvas.width / window.devicePixelRatio) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height / window.devicePixelRatio;
        if (particle.y > canvas.height / window.devicePixelRatio) particle.y = 0;

        // Draw particle with mouse proximity effect
        const mouseDistance = Math.sqrt((mouse.x - particle.x) ** 2 + (mouse.y - particle.y) ** 2);
        const proximityEffect = mouseDistance < 100 ? (100 - mouseDistance) / 100 : 0;
        const enhancedAlpha = Math.min(particle.alpha + proximityEffect * 0.5, 1);
        const enhancedSize = particle.size + proximityEffect * 2;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, enhancedSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${enhancedAlpha})`;
        ctx.fill();

        // Draw connections to nearby particles - exactly like original
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            // Enhanced connection lines near mouse
            const midX = (particle.x + otherParticle.x) / 2;
            const midY = (particle.y + otherParticle.y) / 2;
            const mouseToMid = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
            const mouseProximity = mouseToMid < 80 ? (80 - mouseToMid) / 80 : 0;

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const baseAlpha = 0.3 * (1 - distance / 100);
            const enhancedAlpha = Math.min(baseAlpha + mouseProximity * 0.4, 1);
            ctx.strokeStyle = `rgba(255, 255, 255, ${enhancedAlpha})`;
            ctx.lineWidth = 0.5 + mouseProximity * 1;
            ctx.stroke();
          }
        });

        // Draw connection from particle to mouse if close enough
        const mouseConnectionDistance = Math.sqrt((mouse.x - particle.x) ** 2 + (mouse.y - particle.y) ** 2);
        if (mouseConnectionDistance < 120) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouse.x, mouse.y);
          const mouseAlpha = 0.4 * (1 - mouseConnectionDistance / 120);
          ctx.strokeStyle = `rgba(255, 255, 255, ${mouseAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}