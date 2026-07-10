"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const FEATURES = [
  {
    id: "execution",
    label: "Precision Execution",
    headline: "Sub-millisecond. Every time.",
    body: "Our co-located servers at major financial exchange hubs deliver consistent sub-millisecond execution. No slippage. No excuses. Your orders hit the book at the exact price you see.",
    metric: "0.3ms",
    metricLabel: "Avg execution",
    accent: "#10d48e",
    visual: "execution",
  },
  {
    id: "risk",
    label: "Live Risk Engine",
    headline: "Risk calculated at the speed of light.",
    body: "Real-time margin monitoring, automatic hedging triggers, and portfolio stress testing — all running 24/7 across your entire book of positions.",
    metric: "99.99%",
    metricLabel: "System uptime",
    accent: "#c9a84c",
    visual: "risk",
  },
  {
    id: "intelligence",
    label: "Market Intelligence",
    headline: "Information before it becomes news.",
    body: "Proprietary sentiment analysis, order flow analytics, and institutional positioning data — synthesized and delivered to your terminal before the market reacts.",
    metric: "12M+",
    metricLabel: "Data points/sec",
    accent: "#00bcd4",
    visual: "intelligence",
  },
];

function ExecutionVisual() {
  const bars = [0.3, 0.7, 0.2, 0.5, 0.4, 0.8, 0.15, 0.6, 0.35, 0.9];
  return (
    <div className="flex items-end gap-1 h-24 w-full" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm"
          style={{ background: `rgba(16,212,142,${0.1 + h * 0.7})` }}
          initial={{ height: 0 }}
          animate={{ height: `${h * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function RiskVisual() {
  const segments = [
    { label: "Equity", pct: 42, color: "#c9a84c" },
    { label: "Forex",  pct: 28, color: "#10d48e" },
    { label: "Deriv.", pct: 18, color: "#00bcd4" },
    { label: "Crypto", pct: 12, color: "#9b59b6" },
  ];
  let cumulative = 0;
  const cx = 60, cy = 60, r = 45, strokeW = 12;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width={120} height={120} viewBox="0 0 120 120" aria-hidden="true">
        {segments.map((seg, i) => {
          const offset   = circumference - (seg.pct / 100) * circumference;
          const rotation = -90 + (cumulative / 100) * 360;
          cumulative += seg.pct;
          return (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "60px 60px" }}
              animate={{ strokeDashoffset: offset }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
            />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fill="#f0ede8" fontSize="11" fontWeight="bold">
          Risk
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
            <span style={{ color: "#9fa8b4", fontSize: "0.8rem" }}>{seg.label}</span>
            <span style={{ color: seg.color, fontSize: "0.8rem", fontWeight: "bold" }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntelligenceVisual() {
  const lines = [
    { label: "Sentiment", value: 78, color: "#10d48e" },
    { label: "Flow",      value: 62, color: "#00bcd4" },
    { label: "Momentum",  value: 91, color: "#c9a84c" },
    { label: "Volume",    value: 45, color: "#9b59b6" },
  ];
  return (
    <div className="space-y-4 w-full" aria-hidden="true">
      {lines.map((line, i) => (
        <div key={line.label}>
          <div className="flex justify-between mb-1">
            <span style={{ color: "#9fa8b4", fontSize: "0.75rem" }}>{line.label}</span>
            <span style={{ color: line.color, fontSize: "0.75rem", fontWeight: "bold" }}>{line.value}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: "rgba(37,45,61,0.6)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: line.color }}
              initial={{ width: 0 }}
              animate={{ width: `${line.value}%` }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureVisual({ visual }: { visual: string }) {
  if (visual === "execution")   return <ExecutionVisual />;
  if (visual === "risk")        return <RiskVisual />;
  return <IntelligenceVisual />;
}

function accentRgb(hex: string) {
  if (hex === "#10d48e") return "16,212,142";
  if (hex === "#c9a84c") return "201,168,76";
  return "0,188,212";
}

export default function PlatformSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [active, setActive] = useState(0);

  return (
    <section
      id="platform"
      ref={ref}
      className="relative py-16 md:py-40 px-4 md:px-6 overflow-hidden"
      style={{ background: "#080a0f" }}
    >
      {/* 3D render background — black & green wavy Blender render */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1711025372958-db48a4fe0ba1?q=85&w=1920&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          style={{ opacity: 0.18, mixBlendMode: "screen" }}
        />
        {/* Vignette keeps the cards legible */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(8,10,15,0.55) 20%, rgba(8,10,15,0.15) 60%, rgba(8,10,15,0.7) 100%)",
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ background: "#c9a84c" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>
              The Platform
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold leading-none"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 5.5rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
          >
            Engineered for
            <br />
            <span className="text-gradient-gold">those who lead.</span>
          </motion.h2>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.8 }}
              onClick={() => setActive(i)}
              className="relative cursor-pointer p-5 md:p-8 group"
              style={{
                borderRight: i < 2 ? "1px solid rgba(37,45,61,0.4)" : "none",
                borderBottom: "1px solid rgba(37,45,61,0.4)",
                background: active === i ? `rgba(${accentRgb(f.accent)},0.04)` : "transparent",
                transition: "background 0.3s ease",
              }}
              role="button"
              aria-pressed={active === i}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActive(i)}
            >
              {/* Top active line */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: f.accent }}
                animate={{ opacity: active === i ? 1 : 0 }}
              />

              <div
                className="text-xs tracking-widest uppercase mb-6 font-medium"
                style={{ color: active === i ? f.accent : "#6b7a8d", transition: "color 0.2s" }}
              >
                {f.label}
              </div>

              {/* Visual slot */}
              <div className="mb-8 h-28 flex items-end">
                {active === i ? (
                  <FeatureVisual visual={f.visual} />
                ) : (
                  <div
                    className="w-full h-1 rounded"
                    style={{ background: `rgba(${accentRgb(f.accent)},0.15)` }}
                  />
                )}
              </div>

              <div className="mb-4">
                <div
                  className="text-2xl md:text-4xl font-bold tabular-nums"
                  style={{ color: f.accent, letterSpacing: "-0.03em" }}
                >
                  {f.metric}
                </div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: "#6b7a8d" }}>
                  {f.metricLabel}
                </div>
              </div>

              <h3
                className="text-xl font-bold mb-3 leading-tight"
                style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}
              >
                {f.headline}
              </h3>

              <p style={{ color: "#6b7a8d", fontSize: "0.875rem", lineHeight: 1.8 }}>
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
