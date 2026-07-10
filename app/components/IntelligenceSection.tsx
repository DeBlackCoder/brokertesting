"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const NEWS_FEED = [
  { tag: "MACRO",      headline: "Fed signals extended pause; bond yields retreat",       time: "2m ago",  impact: "high",   sentiment: "bearish" },
  { tag: "EQUITY",     headline: "NVDA Q2 beat: $36.8B revenue, +122% YoY",               time: "8m ago",  impact: "high",   sentiment: "bullish" },
  { tag: "FOREX",      headline: "ECB rate path divergence widens EUR spread",             time: "14m ago", impact: "medium", sentiment: "neutral" },
  { tag: "COMM.",      headline: "Crude drawdown exceeds expectations by 4.2M bbl",        time: "22m ago", impact: "medium", sentiment: "bullish" },
  { tag: "CRYPTO",     headline: "BTC ETF flows hit $1.2B in single session",             time: "31m ago", impact: "high",   sentiment: "bullish" },
];

const SIGNALS = [
  { asset: "EUR/USD", signal: "Short", strength: 84, timeframe: "4H" },
  { asset: "XAUUSD",  signal: "Long",  strength: 91, timeframe: "1D" },
  { asset: "SPX500",  signal: "Hold",  strength: 67, timeframe: "1W" },
  { asset: "BTC/USD", signal: "Long",  strength: 78, timeframe: "4H" },
];

function SignalBar({ strength, color }: { strength: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(37,45,61,0.6)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span style={{ color, fontSize: "0.75rem", fontWeight: "bold", minWidth: 28 }}>
        {strength}%
      </span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false, timeZone: "America/New_York",
        })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono tabular-nums" style={{ color: "#10d48e" }}>{time} NY</span>;
}

function ThroughputCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const target = 12400000;
    const duration = 2200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView]);

  return (
    <div ref={ref} className="text-4xl font-bold tabular-nums" style={{ color: "#f0ede8", letterSpacing: "-0.03em" }}>
      {display.toLocaleString()}
    </div>
  );
}

export default function IntelligenceSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="intelligence"
      ref={ref}
      className="relative py-40 px-6"
      style={{ background: "linear-gradient(180deg, #080a0f 0%, #0e1118 100%)" }}
    >
      {/* Real candlestick chart photograph — Austin Hervias / Unsplash (free) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1689732888407-310424e3a372?q=85&w=1920&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: "center 35%",
            opacity: 0.2,
            mixBlendMode: "screen",
          }}
        />
        {/* Strong centre vignette — data cards stay sharp */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 70% at 50% 50%, rgba(8,10,15,0.85) 0%, rgba(8,10,15,0.45) 50%, rgba(8,10,15,0.12) 100%),
              linear-gradient(180deg, rgba(8,10,15,0.55) 0%, transparent 12%, transparent 88%, rgba(8,10,15,0.55) 100%)
            `,
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px" style={{ background: "#00bcd4" }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: "#00bcd4" }}>
                Intelligence Layer
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-bold leading-none"
              style={{ fontSize: "clamp(2rem, 4.5vw, 5rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
            >
              Know before
              <br />
              <span style={{ color: "#00bcd4" }}>the market knows.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-end gap-4"
          >
            <p style={{ color: "#6b7a8d", lineHeight: 1.8 }}>
              AUREX Intelligence aggregates 47 proprietary data sources, processes 12 million
              events per second, and surfaces actionable signals before price moves occur.
            </p>
            <div className="flex items-center gap-2">
              <motion.span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "#10d48e" }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                aria-hidden="true"
              />
              <span className="text-xs tracking-widest" style={{ color: "#6b7a8d" }}>
                Live feed — <LiveClock />
              </span>
            </div>
          </motion.div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* News feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="p-8"
            style={{ border: "1px solid rgba(37,45,61,0.5)", background: "rgba(14,17,24,0.8)", borderRadius: "4px" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold tracking-widest uppercase" style={{ color: "#9fa8b4" }}>
                Market Intelligence Feed
              </h3>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#10d48e" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  aria-hidden="true"
                />
                <span className="text-xs" style={{ color: "#6b7a8d" }}>Live</span>
              </div>
            </div>

            {NEWS_FEED.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="flex items-start gap-4 py-4"
                style={{ borderBottom: i < NEWS_FEED.length - 1 ? "1px solid rgba(37,45,61,0.3)" : "none" }}
              >
                <span
                  className="mt-0.5 font-bold px-2 py-0.5 rounded-sm shrink-0"
                  style={{
                    background: item.impact === "high" ? "rgba(16,212,142,0.1)" : "rgba(74,85,104,0.2)",
                    color:      item.impact === "high" ? "#10d48e" : "#9fa8b4",
                    fontSize: "9px", letterSpacing: "0.1em",
                  }}
                >
                  {item.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-snug mb-1" style={{ color: "#f0ede8" }}>
                    {item.headline}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: "#6b7a8d" }}>{item.time}</span>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: item.sentiment === "bullish" ? "#10d48e"
                             : item.sentiment === "bearish" ? "#ef4444"
                             : "#9fa8b4",
                      }}
                    >
                      {item.sentiment.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Signals + throughput */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            {/* Signals card */}
            <div
              className="p-8 flex-1"
              style={{ border: "1px solid rgba(37,45,61,0.5)", background: "rgba(14,17,24,0.8)", borderRadius: "4px" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold tracking-widest uppercase" style={{ color: "#9fa8b4" }}>
                  AI Trade Signals
                </h3>
                <span className="text-xs" style={{ color: "#00bcd4" }}>4 Active</span>
              </div>

              <div className="space-y-6">
                {SIGNALS.map((sig, i) => (
                  <motion.div
                    key={sig.asset}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span style={{ color: "#f0ede8", fontWeight: "bold", fontSize: "0.9rem" }}>
                          {sig.asset}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-sm font-bold"
                          style={{
                            background: sig.signal === "Long"  ? "rgba(16,212,142,0.1)"
                                      : sig.signal === "Short" ? "rgba(239,68,68,0.1)"
                                      : "rgba(74,85,104,0.2)",
                            color: sig.signal === "Long"  ? "#10d48e"
                                 : sig.signal === "Short" ? "#ef4444"
                                 : "#9fa8b4",
                          }}
                        >
                          {sig.signal}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: "#6b7a8d" }}>{sig.timeframe}</span>
                    </div>
                    <SignalBar
                      strength={sig.strength}
                      color={sig.signal === "Long" ? "#10d48e" : sig.signal === "Short" ? "#ef4444" : "#9fa8b4"}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Throughput — now animates */}
            <div
              className="p-8"
              style={{ border: "1px solid rgba(0,188,212,0.2)", background: "rgba(0,188,212,0.03)", borderRadius: "4px" }}
            >
              <div className="text-xs tracking-widest uppercase mb-2" style={{ color: "#00bcd4" }}>
                Data throughput
              </div>
              <ThroughputCounter />
              <div className="text-sm mt-1" style={{ color: "#6b7a8d" }}>
                events processed per second
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
