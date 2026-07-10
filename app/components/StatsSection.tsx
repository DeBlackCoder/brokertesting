"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import StatsRings from "./three/StatsRings";

const STATS = [
  {
    value: 48.7, suffix: "B", prefix: "$",
    label: "Total AUM",
    description: "Assets under management across all client portfolios",
    color: "#10d48e",
  },
  {
    value: 127, suffix: "", prefix: "",
    label: "Countries",
    description: "Jurisdictions where AUREX is fully licensed and operational",
    color: "#c9a84c",
  },
  {
    value: 2.1, suffix: "B", prefix: "$",
    label: "Daily Volume",
    description: "Average daily trading volume across all instruments",
    color: "#00bcd4",
  },
  {
    value: 0.3, suffix: "ms", prefix: "",
    label: "Execution",
    description: "Average order execution latency at peak market hours",
    color: "#10d48e",
  },
];

function colorRgb(hex: string) {
  if (hex === "#10d48e") return "16,212,142";
  if (hex === "#c9a84c") return "201,168,76";
  return "0,188,212";
}

function CountUp({
  value, prefix, suffix, color, decimals = 0,
}: {
  value: number; prefix: string; suffix: string; color: string; decimals?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplay(ease * value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <div ref={ref} className="overflow-hidden">
      <span
        className="font-bold tabular-nums block truncate"
        style={{
          color,
          /*
           * Font size is now clamped to the cell width, not the viewport.
           * On mobile each cell is ~50vw → 2.5rem (40px) fits perfectly.
           * On desktop each cell is ~25vw → cap at 4.5rem keeps numbers separate.
           */
          fontSize: "clamp(2rem, 4.5vw, 4.5rem)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {prefix}{display.toFixed(decimals)}{suffix}
      </span>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      className="relative py-28 px-4 sm:px-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080a0f 0%, #040507 100%)" }}
    >
      {/* Horizontal accent lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[20, 40, 60, 80].map((top) => (
          <div
            key={top}
            className="absolute w-full h-px"
            style={{ top: `${top}%`, background: "rgba(37,45,61,0.15)" }}
          />
        ))}
      </div>

      {/* 3D photo background */}
      <StatsRings />

      {/* Watermark */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{ y }}
        aria-hidden="true"
      >
        <div
          className="font-bold"
          style={{
            fontSize: "28vw",
            color: "rgba(37,45,61,0.06)",
            letterSpacing: "-0.06em",
            lineHeight: 1,
          }}
        >
          AUM
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex items-center gap-3 mb-14"
        >
          <div className="w-8 h-px" style={{ background: "#10d48e" }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: "#10d48e" }}>
            By the Numbers
          </span>
        </motion.div>

        {/*
         * Grid layout:
         *   mobile  → 2 columns, 2 rows (2×2)
         *   desktop → 4 columns, 1 row (4×1)
         *
         * Borders are handled with outline/box-shadow tricks so they don't
         * double-up or bleed outside the grid container.
         * We use a wrapper with overflow-hidden + individual inset borders.
         */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{
            border: "1px solid rgba(37,45,61,0.35)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative group p-6 sm:p-8 lg:p-10 flex flex-col"
              style={{
                /* Right divider — every cell except the last in each visual row */
                borderRight:
                  /* mobile: odd index = right column, no border */
                  /* desktop: last item = no border */
                  "1px solid rgba(37,45,61,0.35)",
                /* Bottom divider — top row on mobile only */
                borderBottom: i < 2 ? "1px solid rgba(37,45,61,0.35)" : "none",
                /* Remove right border for right-edge cells */
                /* items 1 & 3 are always right-edge on mobile (2-col) */
                /* On desktop items 1, 2, 3 are NOT right-edge except item 3 */
              }}
            >
              {/* Knock out the border on right-edge cells via pseudo approach — 
                  we use a negative margin overlay strip */}
              {(i === 1 || i === 3) && (
                <div
                  className="absolute top-0 right-[-1px] bottom-0 w-px pointer-events-none"
                  style={{ background: "transparent", zIndex: 1 }}
                  aria-hidden="true"
                />
              )}

              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 30% 40%, rgba(${colorRgb(stat.color)},0.07) 0%, transparent 65%)`,
                }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Top accent on hover */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: stat.color }}
                initial={{ scaleX: 0, originX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.35 }}
              />

              {/* Number */}
              <div className="mb-4 mt-1">
                <CountUp
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  color={stat.color}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                />
              </div>

              {/* Label */}
              <div
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: "#f0ede8" }}
              >
                {stat.label}
              </div>

              {/* Description — hidden on mobile to keep cells compact */}
              <div
                className="hidden sm:block text-xs leading-relaxed mt-auto"
                style={{ color: "#6b7a8d" }}
              >
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
