"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";

const MARKETS = [
  {
    category: "Equities",
    description: "10,000+ global instruments",
    instruments: ["S&P 500 futures", "NASDAQ composites", "FTSE 100", "Nikkei 225", "DAX 40"],
    stat: "10,000+",
    statLabel: "Instruments",
    color: "#10d48e",
  },
  {
    category: "Forex",
    description: "130+ currency pairs",
    instruments: ["EUR/USD", "GBP/JPY", "USD/CHF", "AUD/CAD", "XAU/USD"],
    stat: "0.1 pip",
    statLabel: "Min Spread",
    color: "#c9a84c",
  },
  {
    category: "Derivatives",
    description: "Futures, options, swaps",
    instruments: ["Crude oil", "Natural gas", "Gold futures", "Index options", "Rate swaps"],
    stat: "1:500",
    statLabel: "Max Leverage",
    color: "#00bcd4",
  },
  {
    category: "Digital Assets",
    description: "200+ crypto instruments",
    instruments: ["BTC perpetuals", "ETH options", "Altcoin CFDs", "DeFi indices", "NFT baskets"],
    stat: "24/7",
    statLabel: "Live Markets",
    color: "#9b59b6",
  },
];

function Sparkline({ color, up }: { color: string; up: boolean }) {
  const points = up
    ? [30, 25, 32, 20, 35, 28, 40, 32, 48, 38, 55, 45, 62, 50, 70]
    : [70, 65, 72, 58, 68, 52, 60, 45, 55, 40, 48, 35, 42, 30, 38];

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;
  const w = 120, h = 40;

  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const fillD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#fill-${color.replace("#", "")})`} />
      <motion.path
        d={pathD}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
}

function colorRgb(hex: string) {
  if (hex === "#10d48e") return "16,212,142";
  if (hex === "#c9a84c") return "201,168,76";
  if (hex === "#00bcd4") return "0,188,212";
  return "155,89,182";
}

export default function MarketSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [activeMarket, setActiveMarket] = useState(0);

  return (
    <section
      id="markets"
      ref={ref}
      className="relative py-16 md:py-40 px-4 md:px-6 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080a0f 0%, #0e1118 50%, #080a0f 100%)" }}
    >
      {/* Real forex/candlestick chart photograph — Maxim Hopman / Unsplash (free) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=85&w=1920&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: "center 40%",
            opacity: 0.22,
            mixBlendMode: "screen",
          }}
        />
        {/* Deep vignette — chart shows at edges, content stays readable in centre */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 75% 70% at 50% 50%, rgba(8,10,15,0.82) 0%, rgba(8,10,15,0.4) 55%, rgba(8,10,15,0.15) 100%),
              linear-gradient(180deg, rgba(8,10,15,0.6) 0%, transparent 15%, transparent 85%, rgba(8,10,15,0.6) 100%)
            `,
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-10 lg:mb-24">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px" style={{ background: "#10d48e" }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: "#10d48e" }}>
                Global Markets
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-bold leading-none mb-6"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 5.5rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
            >
              Every market.
              <br />
              <span className="text-gradient-emerald">One platform.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-end"
          >
            <p style={{ color: "#6b7a8d", lineHeight: 1.8 }}>
              Access 40,000+ instruments across equities, currencies, commodities, and
              digital assets — all from a single, unified interface with institutional-grade
              execution.
            </p>
          </motion.div>
        </div>

        {/* Market tabs + content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Tab selector */}
          <div className="lg:col-span-2 flex flex-col gap-0">
            {MARKETS.map((m, i) => (
              <motion.button
                key={m.category}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                onClick={() => setActiveMarket(i)}
                className="group relative text-left p-3 md:p-6 flex items-center justify-between"
                style={{
                  borderLeft: `2px solid ${activeMarket === i ? m.color : "rgba(37,45,61,0.4)"}`,
                  background: activeMarket === i ? `rgba(${colorRgb(m.color)},0.05)` : "transparent",
                  transition: "all 0.3s ease",
                }}
                aria-pressed={activeMarket === i}
              >
                <div>
                  <div
                    className="text-sm md:text-base font-bold mb-1"
                    style={{ color: activeMarket === i ? "#f0ede8" : "#9fa8b4", transition: "color 0.2s" }}
                  >
                    {m.category}
                  </div>
                  <div className="text-xs" style={{ color: "#6b7a8d" }}>{m.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: m.color }}>{m.stat}</div>
                  <div className="text-xs uppercase tracking-widest" style={{ color: "#6b7a8d" }}>{m.statLabel}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Market detail panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMarket}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="h-full p-5 md:p-10"
                style={{
                  border: "1px solid rgba(37,45,61,0.5)",
                  background: "rgba(14,17,24,0.6)",
                  borderRadius: "4px",
                }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3
                      className="text-xl md:text-3xl font-bold mb-2"
                      style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}
                    >
                      {MARKETS[activeMarket].category}
                    </h3>
                    <p style={{ color: "#6b7a8d", fontSize: "0.9rem" }}>
                      {MARKETS[activeMarket].description}
                    </p>
                  </div>
                  <Sparkline color={MARKETS[activeMarket].color} up={activeMarket !== 2} />
                </div>

                <div className="space-y-0 mb-10">
                  {MARKETS[activeMarket].instruments.map((inst, i) => (
                    <motion.div
                      key={inst}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: "1px solid rgba(37,45,61,0.3)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: MARKETS[activeMarket].color }} />
                        <span style={{ color: "#9fa8b4", fontSize: "0.9rem" }}>{inst}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: MARKETS[activeMarket].color }}>
                        LIVE
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase"
                  style={{ color: MARKETS[activeMarket].color }}
                >
                  Explore {MARKETS[activeMarket].category}
                  <span aria-hidden="true">→</span>
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
