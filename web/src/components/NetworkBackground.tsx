"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Lightweight animated canvas: a field of moving nodes connected by lines
 * when close enough — evokes a distributed validator network / neural graph.
 * Pure canvas (no deps), respects prefers-reduced-motion, pauses when tab hidden.
 */
export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let animationId: number;
    let running = true;
    let networkRgb = "212, 175, 55"; // Golden color
    let networkOpacity = 0.5;

    const LINK_DISTANCE = 140;
    const GLOW_RADIUS = 8;

    function readThemeVars() {
      const rgbRaw = getComputedStyle(document.documentElement)
        .getPropertyValue("--network-color-rgb")
        .trim();
      if (rgbRaw) networkRgb = rgbRaw;

      const opacityRaw = getComputedStyle(document.documentElement)
        .getPropertyValue("--network-opacity")
        .trim();
      if (opacityRaw) networkOpacity = parseFloat(opacityRaw);
    }

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.scale(dpr, dpr);

      const density = width < 640 ? 18000 : 12000;
      const count = Math.max(24, Math.min(70, Math.floor((width * height) / density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function step() {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const opacity = (1 - dist / LINK_DISTANCE) * networkOpacity;
            ctx!.strokeStyle = `rgba(${networkRgb}, ${opacity})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Draw nodes with glow effect
      for (const node of nodes) {
        // Glow/aura
        const gradient = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, GLOW_RADIUS);
        gradient.addColorStop(0, `rgba(${networkRgb}, 0.4)`);
        gradient.addColorStop(0.7, `rgba(${networkRgb}, 0.1)`);
        gradient.addColorStop(1, `rgba(${networkRgb}, 0)`);
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, GLOW_RADIUS, 0, Math.PI * 2);
        ctx!.fill();

        // Core node
        ctx!.fillStyle = `rgba(${networkRgb}, 0.95)`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx!.fill();
      }

      animationId = requestAnimationFrame(step);
    }

    readThemeVars();
    resize();
    window.addEventListener("resize", resize);

    document.addEventListener("visibilitychange", () => {
      running = document.visibilityState === "visible" && !prefersReducedMotion;
      if (running) animationId = requestAnimationFrame(step);
    });

    const themeObserver = new MutationObserver(readThemeVars);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(step);
    } else {
      // Draw a single static frame for reduced-motion users.
      step();
      running = false;
    }

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}
