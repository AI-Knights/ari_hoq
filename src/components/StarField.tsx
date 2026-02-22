'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let stars: {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }[] = [];

    const isLight = theme === 'light';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };
    const initStars = () => {
      stars = [];
      const starCount = Math.floor(
        window.innerWidth * window.innerHeight / 3000
      );
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speed: Math.random() * 0.2 + 0.05,
          opacity: Math.random()
        });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        // In light mode, use warm golden particles; in dark mode, white stars
        if (isLight) {
          ctx.fillStyle = `rgba(180, 160, 100, ${star.opacity * 0.5})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        // Move star
        star.y -= star.speed;
        // Reset if off screen
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
        // Twinkle
        if (Math.random() > 0.99) {
          star.opacity = Math.random();
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`star-field fixed top-0 left-0 w-full h-full pointer-events-none z-0 ${theme === 'light' ? 'opacity-30' : 'opacity-60'
        }`} />);

}