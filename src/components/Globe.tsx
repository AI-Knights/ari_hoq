'use client';

import React, { useEffect, useRef } from 'react';
export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let rotation = 0;
    // Globe parameters
    const GLOBE_RADIUS = 180;
    const DOT_RADIUS = 2;
    const DOT_COUNT = 400;
    const CONNECTION_DISTANCE = 40;
    // Generate points on a sphere (Fibonacci sphere algorithm)
    const points: {
      x: number;
      y: number;
      z: number;
      phi: number;
      theta: number;
    }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < DOT_COUNT; i++) {
      const y = 1 - i / (DOT_COUNT - 1) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      points.push({
        x: x * GLOBE_RADIUS,
        y: y * GLOBE_RADIUS,
        z: z * GLOBE_RADIUS,
        phi,
        theta
      });
    }
    const draw = () => {
      // Handle resize
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      // Center of canvas
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      ctx.clearRect(0, 0, rect.width, rect.height);
      // Rotate points
      rotation += 0.003;
      const projectedPoints: {
        x: number;
        y: number;
        z: number;
      }[] = [];
      // Project points
      points.forEach((point) => {
        // Rotate around Y axis
        const x = point.x * Math.cos(rotation) - point.z * Math.sin(rotation);
        const z = point.x * Math.sin(rotation) + point.z * Math.cos(rotation);
        const y = point.y;
        // Perspective projection (simple)
        const scale = 400 / (400 - z);
        const px = x * scale + cx;
        const py = y * scale + cy;
        // Only store points that are on the front side (z > -50 roughly) or fade them out
        projectedPoints.push({
          x: px,
          y: py,
          z
        });
      });
      // Draw connections
      ctx.lineWidth = 0.5;
      projectedPoints.forEach((p1, i) => {
        if (p1.z < 0) return; // Skip back side connections for cleaner look
        // Find neighbors (simplified: just check distance in 2D for visual effect,
        // though 3D distance is more accurate but computationally heavier for loop)
        // Optimization: only check a subset or pre-calculate neighbors.
        // For this visual, we'll just check close indices in the array which corresponds to bands on the sphere
        for (let j = i + 1; j < Math.min(i + 15, projectedPoints.length); j++) {
          const p2 = projectedPoints[j];
          if (p2.z < 0) continue;
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.4;
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`; // Gold color
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      // Draw points
      projectedPoints.forEach((p) => {
        const opacity = (p.z + GLOBE_RADIUS) / (2 * GLOBE_RADIUS); // Fade back points
        if (opacity < 0.1) return;
        ctx.fillStyle = `rgba(212, 175, 55, ${opacity})`;
        // Make front points glow
        if (p.z > 50) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#D4AF37';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, DOT_RADIUS * (p.z > 0 ? 1.2 : 0.8), 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full transform scale-75" />
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[600px] max-h-[600px]"
        style={{
          width: '100%',
          height: '100%'
        }} />

    </div>);

}