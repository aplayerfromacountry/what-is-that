import React, { useEffect, useRef, useState } from "react";
import { getShootingStarsEnabled } from "../utils/settingsStorage";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number; // in radians
  headRadius: number;
  alpha: number;
  decay: number;
  color: string;
  tailColor: string;
}

export const ShootingStarsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    setIsEnabled(getShootingStarsEnabled());

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.shootingStars === "boolean") {
        setIsEnabled(customEvent.detail.shootingStars);
      } else {
        setIsEnabled(getShootingStarsEnabled());
      }
    };

    window.addEventListener("app_settings_changed", handleSettingsChange);
    return () => {
      window.removeEventListener("app_settings_changed", handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStaticStars();
    };

    window.addEventListener("resize", handleResize);

    // Initialize static twinkling stars
    let staticStars: Star[] = [];
    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(251, 191, 36, ", // Amber/Gold
      "rgba(254, 240, 138, ", // Light gold
      "rgba(199, 210, 254, ", // Soft indigo
      "rgba(216, 180, 254, ", // Soft lavender
    ];

    const initStaticStars = () => {
      staticStars = [];
      const starCount = Math.floor((width * height) / 9000); // Dense yet subtle
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = Math.random() * 0.5 + 0.15;
        staticStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.3,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    initStaticStars();

    // Shooting stars array
    const shootingStars: ShootingStar[] = [];
    let lastSpawnTime = Date.now();
    let nextSpawnInterval = Math.random() * 2000 + 1500; // spawn every 1.5 - 3.5s

    const spawnShootingStar = () => {
      // Spawn from top or top-left
      const angle = (Math.PI / 180) * (Math.random() * 25 + 35); // 35 to 60 degrees downwards
      const startX = Math.random() * (width * 1.1) - width * 0.1;
      const startY = Math.random() * (height * 0.4) - 50;

      const colors = [
        { head: "rgba(255, 255, 255, 1)", tail: "rgba(251, 191, 36, " }, // Golden comet
        { head: "rgba(254, 243, 199, 1)", tail: "rgba(245, 158, 11, " }, // Amber comet
        { head: "rgba(255, 255, 255, 1)", tail: "rgba(167, 139, 250, " }, // Lavender starlight
        { head: "rgba(224, 242, 254, 1)", tail: "rgba(56, 189, 248, " }, // Cyan starlight
      ];
      const palette = colors[Math.floor(Math.random() * colors.length)];

      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 120 + 80,
        speed: Math.random() * 6 + 7,
        angle,
        headRadius: Math.random() * 1.5 + 1.2,
        alpha: 1,
        decay: Math.random() * 0.008 + 0.006,
        color: palette.head,
        tailColor: palette.tail,
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and twinkle static stars
      for (let i = 0; i < staticStars.length; i++) {
        const s = staticStars[i];
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.85 || s.alpha < 0.1) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.shadowBlur = s.radius > 1 ? 4 : 0;
        ctx.shadowColor = "rgba(251, 191, 36, 0.5)";
        ctx.fill();
      }

      // 2. Check for new shooting star spawn
      const now = Date.now();
      if (now - lastSpawnTime > nextSpawnInterval) {
        spawnShootingStar();
        // Occasionally spawn twin shooting stars
        if (Math.random() < 0.25) {
          setTimeout(() => spawnShootingStar(), 300);
        }
        lastSpawnTime = now;
        nextSpawnInterval = Math.random() * 2500 + 1200;
      }

      // 3. Draw & update shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        // Calculate tail end coordinates
        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        // Create linear gradient for the glowing trail
        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
        gradient.addColorStop(0.15, `${star.tailColor}${star.alpha * 0.8})`);
        gradient.addColorStop(0.6, `${star.tailColor}${star.alpha * 0.3})`);
        gradient.addColorStop(1, `${star.tailColor}0)`);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.headRadius * 1.4;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(251, 191, 36, 0.8)";
        ctx.stroke();

        // Draw shining head
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.headRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#ffffff";
        ctx.fill();
        ctx.restore();

        // Move star forward
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.alpha -= star.decay;

        // Remove if off-screen or faded out
        if (star.alpha <= 0 || star.x > width + 100 || star.y > height + 100) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      id="shooting-stars-background-canvas"
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ opacity: 0.95 }}
    />
  );
};
