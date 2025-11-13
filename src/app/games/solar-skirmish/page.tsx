"use client";

// Next.js single-page 2D space game — paste this file as app/page.tsx (App Router)
// Works with a vanilla create-next-app (no extra deps). TypeScript-friendly.
// Controls
//  - Arrow Keys / WASD: Thrust (Up/W/W), Turn (Left/Right or A/D)
//  - Space: Fire blaster
//  - Shift: Boost (brief speed burst with heat penalty)
//  - P: Pause / Unpause
//  - R: Restart after game over
//  - M: Toggle mute
// Goal
//  - Survive, pop asteroids for points, and dogfight AI raiders. Chain kills for combo bonuses.
//  - Avoid overheating; overheat disables firing briefly. Don’t collide, and watch shields.
// Tips
//  - Shots ricochet slightly off big rocks; use drift + boost to swing around enemies.

import React, { useEffect, useRef, useState } from "react";
import { usePageTitle } from '@/hooks/use-page-title';
import { motion } from "framer-motion";

// ===== Utility =====
const TAU = Math.PI * 2;
const rand = (a = 1, b?: number) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wrap = (v: number, max: number) => (v < 0 ? v + max : v >= max ? v - max : v);

function angleLerp(a: number, b: number, t: number) {
  const d = ((((b - a) % TAU) + TAU) % TAU);
  const delta = d > Math.PI ? d - TAU : d;
  return a + delta * t;
}

function playBeep(ctx: AudioContext, type: OscillatorType, freq: number, dur = 0.06, gain = 0.03) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + dur);
}

// ===== Types =====
interface Ent {
  x: number; y: number; vx: number; vy: number; r: number; ang: number; dead?: boolean;
}

interface Bullet extends Ent { life: number; team: "player" | "enemy"; }
interface Particle extends Ent { life: number; color: string; }
interface Asteroid extends Ent { size: number; spin: number; hp: number; id: number; }
interface Enemy extends Ent { aim: number; cd: number; aiTimer: number; hp: number; kind: number; heat: number; }

// ===== Main Page Component =====
export default function Page() {
  usePageTitle('太空混战');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const acRef = useRef<AudioContext | null>(null);
  const inputs = useRef({ up: false, left: false, right: false, fire: false, boost: false });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = typeof window !== "undefined" ? Math.max(1, Math.min(2, window.devicePixelRatio || 1)) : 1;
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // ===== Game State =====
    const player: Ent & { thrust: number; heat: number; overheat: number; inv: number; } = {
      x: w / 2, y: h / 2, vx: 0, vy: 0, r: 12, ang: -Math.PI / 2, thrust: 0, heat: 0, overheat: 0, inv: 2,
    };

    let bullets: Bullet[] = [];
    let parts: Particle[] = [];
    let rocks: Asteroid[] = [];
    let foes: Enemy[] = [];
    let nextRockId = 1;
    let wave = 1;
    let combo = 0; // time-limited multiplier
    let comboTimer = 0;
    let fireCD = 0;
    let spawnTimer = 0;

    const spawnAsteroid = (x?: number, y?: number, size = rand(28, 46)) => {
      const ang = rand(TAU);
      const sp = rand(0.3, 1.2);
      const rock: Asteroid = { x: x ?? rand(w), y: y ?? rand(h), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: size, size, ang: rand(TAU), spin: rand(-0.02, 0.02), hp: Math.max(1, Math.round(size / 14)), id: nextRockId++ };
      rocks.push(rock);
    };

    const splitAsteroid = (r: Asteroid) => {
      const pieces = r.size > 26 ? 2 + (Math.random() < 0.4 ? 1 : 0) : 0;
      for (let i = 0; i < pieces; i++) {
        const sz = r.size * (0.5 + Math.random() * 0.25);
        spawnAsteroid(r.x + rand(-6, 6), r.y + rand(-6, 6), sz);
      }
    };

    const spawnEnemy = () => {
      const edge = Math.floor(rand(4));
      const pos = [
        { x: rand(w), y: -30 },
        { x: rand(w), y: h + 30 },
        { x: -30, y: rand(h) },
        { x: w + 30, y: rand(h) },
      ][edge];
      const kind = Math.random() < 0.5 ? 0 : 1; // 0: interceptor, 1: bruiser
      const e: Enemy = { x: pos.x, y: pos.y, vx: 0, vy: 0, r: kind ? 15 : 12, ang: rand(TAU), aim: rand(TAU), cd: 0, aiTimer: 0, hp: kind ? 5 : 3, kind, heat: 0 };
      foes.push(e);
    };

    const resetGame = () => {
      bullets = []; parts = []; rocks = []; foes = [];
      nextRockId = 1; wave = 1; combo = 0; comboTimer = 0; fireCD = 0; spawnTimer = 0;
      player.x = w / 2; player.y = h / 2; player.vx = 0; player.vy = 0; player.ang = -Math.PI / 2; player.thrust = 0; player.heat = 0; player.overheat = 0; player.inv = 2;
      for (let i = 0; i < 6; i++) spawnAsteroid();
      for (let i = 0; i < 2; i++) spawnEnemy();
      setScore(0); setLives(3); setPaused(false); setGameOver(false);
    };

    resetGame();

    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!acRef.current && !muted) {
        try {
          const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            acRef.current = new AudioContextClass();
          }
        } catch { /* ignore */ }
      }
    };

    // ===== Input =====
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (down) initAudio(); // Initialize audio on first keypress
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") inputs.current.up = down;
      if (k === "arrowleft" || k === "a") inputs.current.left = down;
      if (k === "arrowright" || k === "d") inputs.current.right = down;
      if (k === " " || k === "spacebar") inputs.current.fire = down;
      if (k === "shift") inputs.current.boost = down;
      if (down) {
        if (k === "p") setPaused(p => !p);
        if (k === "m") setMuted(m => !m);
        if (k === "r" && gameOver) resetGame();
      }
    };
    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));

    // Mouse fire (hold) and steer with mouse when pressed
    let mouseX = 0, mouseY = 0, mouseDown = false;
    canvas.addEventListener("mousemove", (e) => { const rect = canvas.getBoundingClientRect(); mouseX = e.clientX - rect.left; mouseY = e.clientY - rect.top; });
    canvas.addEventListener("mousedown", () => { initAudio(); mouseDown = true; inputs.current.fire = true; }); // Initialize audio on first click
    window.addEventListener("mouseup", () => { mouseDown = false; inputs.current.fire = false; });

    // ===== Helpers =====
    const emit = (x: number, y: number, count: number, baseAng: number, spread: number, speed: number, life: number, color: string) => {
      for (let i = 0; i < count; i++) {
        const a = baseAng + rand(-spread, spread);
        parts.push({ x, y, vx: Math.cos(a) * speed * rand(0.4, 1.2), vy: Math.sin(a) * speed * rand(0.4, 1.2), r: rand(1, 2.6), ang: a, life: life * rand(0.7, 1.3), color });
      }
    };

    const trySfx = (fn: () => void) => {
      if (muted || !acRef.current) return;
      // Ensure AudioContext is running before playing sound
      if (acRef.current.state === 'suspended') {
        acRef.current.resume().then(() => fn()).catch(() => { /* ignore */ });
      } else {
        fn();
      }
    };

    // ===== Main Loop =====
    let last = performance.now();
    let raf = 0;

    const step = (t: number) => {
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;

      if (!paused && !gameOver) {
        update(dt);
      }
      render();
      raf = requestAnimationFrame(step);
    };

    const update = (dt: number) => {
      // screen wrap helper
      const wrapEnt = (e: Ent) => { e.x = wrap(e.x, w); e.y = wrap(e.y, h); };

      // Player steering
      if (mouseDown) {
        const angToMouse = Math.atan2(mouseY - player.y, mouseX - player.x);
        player.ang = angleLerp(player.ang, angToMouse, 0.18);
      } else {
        if (inputs.current.left) player.ang -= 3.4 * dt;
        if (inputs.current.right) player.ang += 3.4 * dt;
      }
      const thrusting = inputs.current.up;
      const baseAcc = 120; // px/s^2
      const boost = inputs.current.boost && player.heat < 0.95 ? 2.2 : 1;
      const acc = thrusting ? baseAcc * boost : 0;
      if (thrusting) {
        player.vx += Math.cos(player.ang) * acc * dt;
        player.vy += Math.sin(player.ang) * acc * dt;
        player.thrust = clamp(player.thrust + 4 * dt, 0, 1);
        player.heat = clamp(player.heat + (boost > 1 ? 0.5 : 0.28) * dt, 0, 1.2);
      } else {
        player.thrust = clamp(player.thrust - 2.2 * dt, 0, 1);
        player.heat = clamp(player.heat - 0.18 * dt, 0, 1.2);
      }

      // overheat disables firing briefly
      if (player.heat >= 1) player.overheat = Math.max(player.overheat, 1.0);
      if (player.overheat > 0) player.overheat = Math.max(0, player.overheat - dt);

      // friction
      player.vx *= 0.996; player.vy *= 0.996;
      player.x += player.vx * dt; player.y += player.vy * dt; wrapEnt(player);
      if (player.inv > 0) player.inv -= dt;

      // Fire
      fireCD = Math.max(0, fireCD - dt);
      const canFire = inputs.current.fire && fireCD <= 0 && player.overheat <= 0;
      if (canFire) {
        const spread = 0.045;
        const count = 1;
        for (let i = 0; i < count; i++) {
          const a = player.ang + rand(-spread, spread);
          bullets.push({ x: player.x + Math.cos(a) * 15, y: player.y + Math.sin(a) * 15, vx: player.vx + Math.cos(a) * 460, vy: player.vy + Math.sin(a) * 460, r: 2.2, ang: a, life: 0.9, team: "player" });
        }
        emit(player.x, player.y, 6, player.ang + Math.PI, 0.4, 70, 0.4, "#88f");
        player.heat = clamp(player.heat + 0.08, 0, 1.2);
        fireCD = 0.14;
        trySfx(() => playBeep(acRef.current!, "square", 440, 0.04, 0.02));
      }

      // Bullets update
      bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; wrapEnt(b); });
      bullets = bullets.filter(b => !b.dead && b.life > 0);

      // Asteroids
      if (rocks.length < 4 + wave) spawnAsteroid();
      rocks.forEach(r => { r.x += r.vx * dt; r.y += r.vy * dt; r.ang += r.spin; wrapEnt(r); });

      // Enemies
      spawnTimer -= dt;
      if (spawnTimer <= 0 && foes.length < 3 + Math.floor(wave * 0.6)) { spawnEnemy(); spawnTimer = rand(2, 5); }
      foes.forEach(e => {
        e.aiTimer -= dt; if (e.aiTimer <= 0) e.aiTimer = rand(0.2, 0.5);
        // steer toward player with some jitter
        const toP = Math.atan2(player.y - e.y, player.x - e.x);
        const jitter = Math.sin(performance.now() * 0.001 + e.x * 0.01) * (e.kind ? 0.2 : 0.3);
        e.aim = angleLerp(e.aim, toP + jitter, 0.08 * (e.kind ? 0.8 : 1));
        e.ang = angleLerp(e.ang, e.aim, 0.12);
        const thrust = e.kind ? 80 : 110;
        e.vx += Math.cos(e.ang) * thrust * dt;
        e.vy += Math.sin(e.ang) * thrust * dt;
        e.vx *= e.kind ? 0.995 : 0.993; e.vy *= e.kind ? 0.995 : 0.993;
        e.x += e.vx * dt; e.y += e.vy * dt; wrapEnt(e);

        // Fire at player when aligned and not overheated
        e.cd = Math.max(0, e.cd - dt); e.heat = Math.max(0, e.heat - 0.2 * dt);
        const facing = Math.abs((((toP - e.ang + Math.PI) % TAU) + TAU) - Math.PI);
        if (e.cd <= 0 && facing < 0.2 && e.heat < 0.9) {
          const a = e.ang + rand(-0.06, 0.06);
          bullets.push({ x: e.x + Math.cos(a) * (e.r + 4), y: e.y + Math.sin(a) * (e.r + 4), vx: e.vx + Math.cos(a) * 420, vy: e.vy + Math.sin(a) * 420, r: 2.1, ang: a, life: 1.2, team: "enemy" });
          e.heat += 0.2; e.cd = e.kind ? 0.28 : 0.18;
          trySfx(() => playBeep(acRef.current!, "square", e.kind ? 320 : 360, 0.05, 0.018));
        }
      });
      foes = foes.filter(f => !f.dead);

      // Collisions
      const hit = (e1: Ent, e2: Ent, rr = 0) => {
        const dx = e1.x - e2.x, dy = e1.y - e2.y; const r = (e1.r + e2.r + rr); return dx * dx + dy * dy < r * r;
      };

      // bullets vs rocks and foes and player
      for (const b of bullets) {
        if (b.team === "player") {
          for (const r of rocks) if (!r.dead && hit(b, r)) {
            b.dead = true; r.hp -= 1; emit(b.x, b.y, 10, b.ang, 0.8, 80, 0.5, "#acf");
            trySfx(() => playBeep(acRef.current!, "triangle", 160, 0.06, 0.03));
            if (r.hp <= 0) {
              r.dead = true; splitAsteroid(r);
              const pts = 20 + Math.round(r.size);
              combo = Math.min(5, combo + 1); comboTimer = 2.4;
              setScore(s => s + Math.floor(pts * (1 + combo * 0.25)));
              emit(r.x, r.y, 24, rand(TAU), 3.2, 160, 0.9, "#f8f");
            }
          }
          for (const f of foes) if (!f.dead && hit(b, f)) {
            b.dead = true; f.hp -= 1; emit(b.x, b.y, 10, b.ang, 0.5, 110, 0.6, "#ff9");
            if (f.hp <= 0) {
              f.dead = true; const pts = f.kind ? 120 : 90; combo = Math.min(5, combo + 1); comboTimer = 2.4; setScore(s => s + Math.floor(pts * (1 + combo * 0.25)));
              emit(f.x, f.y, 30, rand(TAU), 3.4, 200, 1.0, "#fa5");
              trySfx(() => playBeep(acRef.current!, "sawtooth", 140, 0.08, 0.04));
            }
          }
        } else {
          if (player.inv <= 0 && hit(b, player)) {
            b.dead = true; damagePlayer(1);
          }
        }
      }

      // rocks vs player
      for (const r of rocks) if (!r.dead && player.inv <= 0 && hit(r, player)) {
        r.dead = true; splitAsteroid(r); emit(r.x, r.y, 24, rand(TAU), 3.0, 180, 1.0, "#faa");
        damagePlayer(1);
      }

      // foes vs player (ram)
      for (const f of foes) if (!f.dead && player.inv <= 0 && hit(f, player)) {
        f.dead = true; emit(f.x, f.y, 26, rand(TAU), 3.2, 200, 1.0, "#f96");
        damagePlayer(1);
      }

      // cleanup
      rocks = rocks.filter(r => !r.dead);
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vx *= 0.99; p.vy *= 0.99; });
      parts = parts.filter(p => p.life > 0.02);

      // waves
      if (rocks.length === 0 && foes.length === 0) {
        wave += 1; for (let i = 0; i < 4 + wave; i++) spawnAsteroid(); for (let i = 0; i < 1 + Math.floor(wave / 2); i++) spawnEnemy();
        trySfx(() => playBeep(acRef.current!, "sine", 600, 0.08, 0.04));
      }

      // combo decay
      if (combo > 0) { comboTimer -= dt; if (comboTimer <= 0) combo = 0; }
    };

    const damagePlayer = (dmg: number) => {
      emit(player.x, player.y, 40, rand(TAU), 3.4, 220, 1.2, "#f66");
      trySfx(() => playBeep(acRef.current!, "triangle", 120, 0.1, 0.06));
      player.inv = 2.2; setLives(L => {
        const nl = L - dmg; if (nl <= 0) { setGameOver(true); setPaused(false); trySfx(() => playBeep(acRef.current!, "sawtooth", 90, 0.6, 0.04)); }
        return nl;
      });
      // small knockback
      player.vx -= Math.cos(player.ang) * 40; player.vy -= Math.sin(player.ang) * 40;
      player.heat = Math.max(0.2, player.heat - 0.3);
    };

    const render = () => {
      // background
      ctx.fillStyle = "#0b0e18"; ctx.fillRect(0, 0, w, h);
      // stars parallax
      const t = performance.now() * 0.0001;
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 97.13 + t * 120 + player.x * 0.1) % w + w) % w;
        const sy = ((i * 53.77 + t * 80 + player.y * 0.1) % h + h) % h;
        ctx.globalAlpha = 0.6 + (i % 5) * 0.08; ctx.fillStyle = "#ffffff"; ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.globalAlpha = 1;

      // particles
      parts.forEach(p => { ctx.fillStyle = p.color; ctx.globalAlpha = clamp(p.life, 0, 1); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; });

      // draw asteroids (faceted shapes)
      ctx.strokeStyle = "#9ab"; ctx.lineWidth = 2; ctx.fillStyle = "#1b2233";
      for (const r of rocks) {
        ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.ang);
        const verts = 8 + Math.floor(r.size / 6);
        ctx.beginPath();
        for (let i = 0; i <= verts; i++) {
          const a = (i / verts) * TAU; const rad = r.size * (0.75 + Math.sin(i * 1.7 + r.id) * 0.12 + Math.random() * 0.02);
          const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      }

      // draw enemies (creative silhouettes)
      for (const e of foes) {
        ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang);
        if (e.kind === 0) {
          // Interceptor: manta-ray shape
          ctx.fillStyle = "#59f"; ctx.beginPath();
          ctx.moveTo(16, 0); ctx.quadraticCurveTo(-6, -10, -12, -2); ctx.quadraticCurveTo(-4, 0, -12, 2); ctx.quadraticCurveTo(-6, 10, 16, 0); ctx.fill();
        } else {
          // Bruiser: beetle shell
          ctx.fillStyle = "#f55"; ctx.beginPath();
          ctx.moveTo(18, 0); ctx.lineTo(-10, -10); ctx.lineTo(-6, 0); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#c33"; ctx.fillRect(-4, -4, 8, 8);
        }
        // engine glow
        ctx.fillStyle = "#fd8"; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(-e.r - 2, 0, 2 + Math.random() * 1.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        ctx.restore();
      }

      // draw player ship (arrow + fins)
      ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.ang);
      const blink = player.inv > 0 && Math.floor(performance.now() * 0.01) % 2 === 0;
      if (!blink) {
        ctx.fillStyle = "#6ef"; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-12, -8); ctx.lineTo(-6, 0); ctx.lineTo(-12, 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#3ac"; ctx.fillRect(-5, -3, 7, 6); // cockpit
      }
      if (player.thrust > 0.05) {
        ctx.fillStyle = "#ffb"; const len = 6 + 12 * player.thrust; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-12 - len, -3); ctx.lineTo(-12 - len * 0.6, 0); ctx.lineTo(-12 - len, 3); ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // bullets
      ctx.fillStyle = "#fff";
      for (const b of bullets) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); }

      // HUD
      ctx.fillStyle = "#cfe"; ctx.font = "14px ui-monospace, monospace"; ctx.fillText(`Score ${score}`, 12, 20);
      ctx.fillText(`Wave ${wave}`, 12, 38);
      // lives
      for (let i = 0; i < lives; i++) { ctx.beginPath(); ctx.moveTo(100 + i * 16, 14); ctx.lineTo(92 + i * 16, 22); ctx.lineTo(92 + i * 16, 6); ctx.closePath(); ctx.fill(); }
      // heat bar
      const hx = 12, hy = 48, hw = 120, hh = 8; ctx.strokeStyle = "#456"; ctx.strokeRect(hx, hy, hw, hh);
      ctx.fillStyle = player.overheat > 0 ? "#f55" : "#6ef"; ctx.fillRect(hx + 1, hy + 1, (hw - 2) * clamp(player.heat, 0, 1), hh - 2);
      if (player.overheat > 0) { ctx.fillStyle = "#fbb"; ctx.fillText("OVERHEAT", hx, hy + 24); }

      if (paused) {
        overlay("PAUSED — press P to resume");
      }
      if (gameOver) {
        overlay("GAME OVER — press R to restart");
      }

      // combo
      if (combo > 0) { ctx.globalAlpha = 0.8; ctx.fillStyle = "#ff9"; ctx.fillText(`Combo x${1 + combo * 0.25 | 0}`, w - 140, 20); ctx.globalAlpha = 1; }

      function overlay(text: string) {
        ctx.save(); ctx.translate(w / 2, h / 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(-220, -40, 440, 80);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "20px ui-monospace, monospace"; ctx.fillText(text, 0, 6);
        ctx.font = "13px ui-monospace, monospace"; ctx.fillText("WASD/Arrows move, Space fire, Shift boost, M mute", 0, 28);
        ctx.restore();
      }
    };

    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", (e) => onKey(e, true));
      window.removeEventListener("keyup", (e) => onKey(e, false));
    };
  }, [muted, gameOver, lives, paused, score]);

  return (
    <div className="relative w-full min-h-screen py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            太空混战
          </h2>
        </motion.div>

        <div className="bg-[#070a12] text-[#cfe] font-mono rounded-lg overflow-hidden shadow-2xl">
          <div className="grid grid-rows-[auto_1fr]">
            <header className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#111] bg-gradient-to-b from-[#0c1222] to-[#0a0f1c]">
              <div className="flex items-center gap-2">
                <span className="font-bold">🚀 Solar Skirmish</span>
                <span className="opacity-70 text-xs">Asteroids + Dogfights</span>
              </div>
              <div className="text-xs opacity-80">Space: fire • Shift: boost • P: pause • M: mute</div>
            </header>
            <div className="relative">
              <canvas ref={canvasRef} className="w-full h-[calc(100vh-200px)] block cursor-crosshair" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
