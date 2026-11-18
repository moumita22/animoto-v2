'use client';

import { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  glowColor: string;
  isBig: boolean;
  alpha: number;
  targetAlpha: number;
  pulse: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

const BRIGHT_CINEMA_COLORS = [
  { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.7)' }, // Radiant Amber Gold
  { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)' }, // Pure Gold
  { color: '#f97316', glow: 'rgba(249, 115, 22, 0.7)' }, // Sunset Orange
  { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },  // Fiery Crimson
  { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)' }, // Neon Purple
  { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)' },  // Electric Cyan
];

const TARGET_ORB_COUNT = 11;

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const orbs: Orb[] = [];
    const sparks: Spark[] = [];
    let animationFrameId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Factory function to spawn new balls cleanly inside viewport
    const createOrb = (fadeIn = false): Orb => {
      const isBig = Math.random() > 0.45; // ~45% big balls
      const theme = BRIGHT_CINEMA_COLORS[Math.floor(Math.random() * BRIGHT_CINEMA_COLORS.length)];
      const radius = isBig ? Math.random() * 10 + 20 : Math.random() * 6 + 8; // Big: 20px-30px (30% smaller), Small: 8px-14px

      return {
        x: Math.random() * (width - radius * 4) + radius * 2,
        y: Math.random() * (height - radius * 4) + radius * 2,
        radius,
        vx: (Math.random() - 0.5) * (isBig ? 0.8 : 1.2),
        vy: (Math.random() - 0.5) * (isBig ? 0.8 : 1.2),
        color: theme.color,
        glowColor: theme.glow,
        isBig,
        alpha: fadeIn ? 0.05 : isBig ? 0.85 : 0.6,
        targetAlpha: isBig ? 0.85 : 0.6,
        pulse: Math.random() * Math.PI * 2,
      };
    };

    // Populate initial batch
    for (let i = 0; i < TARGET_ORB_COUNT; i++) {
      orbs.push(createOrb(false));
    }

    // Firecracker burst explosion 💥
    const explodeOrb = (x: number, y: number, baseColor: string) => {
      const sparkCount = 60;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 2;
        const theme = BRIGHT_CINEMA_COLORS[Math.floor(Math.random() * BRIGHT_CINEMA_COLORS.length)];
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.3 ? baseColor : theme.color,
          alpha: 1,
          size: Math.random() * 3.5 + 2,
        });
      }
    };

    // Click handler for bursting balls
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      // Google AdSense Compliance: Never intercept clicks on links, buttons, or Ad slots!
      if (target?.closest('button, a, input, textarea, select, ins.adsbygoogle, [id*="google_ads"], [class*="ad"]')) {
        return;
      }

      const clickX = e.clientX;
      const clickY = e.clientY;

      for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i];
        const dist = Math.hypot(orb.x - clickX, orb.y - clickY);

        // Generous hit-box so it's fun and easy to pop
        if (dist <= orb.radius + 20) {
          explodeOrb(orb.x, orb.y, orb.color);

          // Remove the popped ball
          orbs.splice(i, 1);

          // Immediately spawn a new fresh ball with smooth fade-in
          orbs.push(createOrb(true));
          break;
        }
      }
    };

    window.addEventListener('click', handleClick);

    // 60 FPS Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // GUARANTEE: Never run out of balls! Always maintain TARGET_ORB_COUNT
      while (orbs.length < TARGET_ORB_COUNT) {
        orbs.push(createOrb(true));
      }

      // 1. Draw & Update Floating Balls
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.pulse += 0.035;

        // Smooth fade-in for newly spawned balls
        if (orb.alpha < orb.targetAlpha) {
          orb.alpha = Math.min(orb.alpha + 0.03, orb.targetAlpha);
        }

        // Rock-Solid Boundary Clamping (Guaranteed never to escape screen)
        if (orb.x - orb.radius <= 0) {
          orb.x = orb.radius;
          orb.vx = Math.abs(orb.vx);
        } else if (orb.x + orb.radius >= width) {
          orb.x = width - orb.radius;
          orb.vx = -Math.abs(orb.vx);
        }

        if (orb.y - orb.radius <= 0) {
          orb.y = orb.radius;
          orb.vy = Math.abs(orb.vy);
        } else if (orb.y + orb.radius >= height) {
          orb.y = height - orb.radius;
          orb.vy = -Math.abs(orb.vy);
        }

        // Draw Radiant Ball
        ctx.save();
        ctx.globalAlpha = orb.alpha;

        const grad = ctx.createRadialGradient(
          orb.x,
          orb.y,
          orb.radius * 0.2,
          orb.x,
          orb.y,
          orb.radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, orb.color);
        grad.addColorStop(0.85, orb.glowColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Halo Ring for Big Clickable Balls
        if (orb.isBig) {
          const haloSize = orb.radius + 5 + Math.sin(orb.pulse) * 3;
          ctx.strokeStyle = orb.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.45 + Math.sin(orb.pulse) * 0.25;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, haloSize, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      });

      // 2. Draw & Update Firecracker Sparks 💥
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15; // downward gravity
        s.vx *= 0.97; // friction
        s.alpha -= 0.022; // fade out

        ctx.save();
        ctx.globalAlpha = Math.max(s.alpha, 0);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
