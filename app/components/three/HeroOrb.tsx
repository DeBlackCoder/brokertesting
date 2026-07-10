"use client";

import { useEffect, useRef } from "react";
import Lightfall from "../backgrounds/Lightfall";

/**
 * Hero background — Lightfall shader, no re-renders on scroll.
 * The parent writes scrollProgress as a data attribute; we read it
 * in a rAF loop and mutate the wrapper style directly — zero React
 * re-renders while scrolling.
 */
export default function HeroOrb({ scrollProgress }: { scrollProgress: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Mirror the latest scrollProgress into a ref the rAF loop reads
  const scrollRef = useRef(scrollProgress);
  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);

  // Drive opacity + scale via direct style mutation — bypasses React entirely
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const v = scrollRef.current;
      if (!wrapRef.current) return;
      const opacity    = Math.max(0, 1 - v * 2.2);
      const scale      = 1 + v * 0.05;
      const translateY = v * 50;
      wrapRef.current.style.opacity   = String(opacity);
      wrapRef.current.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <Lightfall
        className="absolute inset-0"
        colors={["#10d48e", "#00bcd4", "#c9a84c", "#0a9965"]}
        backgroundColor="#040507"
        speed={0.4}
        streakCount={4}        /* was 6 — each streak costs a full loop pass */
        streakWidth={0.8}
        streakLength={1.4}
        glow={0.9}
        density={0.5}
        twinkle={0.6}
        zoom={3.5}
        backgroundGlow={0.18}
        opacity={1}
        mouseInteraction={true}
        mouseStrength={0.35}
        mouseRadius={0.6}
        mouseDampening={0.12}
        dpr={1}
      />

      {/* Text-protection gradients — static, no shader cost */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, rgba(8,10,15,0.94) 0%, rgba(8,10,15,0.75) 30%, rgba(8,10,15,0.25) 58%, rgba(8,10,15,0.08) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(8,10,15,0.85), transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #080a0f)" }}
      />
    </div>
  );
}
