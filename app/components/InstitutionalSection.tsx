"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PARTNERS = [
  "Goldman Sachs", "JPMorgan", "BlackRock", "Citadel", "Bridgewater",
  "Two Sigma", "Renaissance", "D.E. Shaw", "Vanguard", "Fidelity",
];

const TRUST_METRICS = [
  { value: "$48.7B",  label: "Assets Under Management", detail: "Across 127 jurisdictions"    },
  { value: "99.99%",  label: "System Uptime",           detail: "99.999% last 24 months"      },
  { value: "SOC 2",   label: "Type II Certified",       detail: "Annual external audit"        },
  { value: "Tier 1",  label: "Regulatory Status",       detail: "FCA, SEC, MAS regulated"     },
];

const TESTIMONIALS = [
  {
    quote: "AUREX has fundamentally changed how we approach execution. The latency improvements alone justify the entire migration.",
    name: "Head of Equities Trading",
    firm: "Top 10 Global Hedge Fund",
    initials: "HE",
  },
  {
    quote: "We moved $4.2B in AUM to AUREX in Q1. The institutional infrastructure and compliance toolkit are genuinely best-in-class.",
    name: "Chief Investment Officer",
    firm: "Sovereign Wealth Fund",
    initials: "CI",
  },
  {
    quote: "The signal quality from their intelligence layer is unlike anything we've accessed before. It's a genuine edge.",
    name: "Quantitative Strategist",
    firm: "Multi-Strategy Family Office",
    initials: "QS",
  },
];

function LogoMarquee() {
  return (
    <div className="relative overflow-hidden w-full py-8" aria-hidden="true">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...PARTNERS, ...PARTNERS].map((name, i) => (
          <div key={i} className="flex items-center shrink-0">
            <span
              className="text-sm font-bold tracking-[0.2em] uppercase px-8"
              style={{ color: "rgba(159,168,180,0.35)" }}
            >
              {name}
            </span>
            <span style={{ color: "rgba(37,45,61,0.6)", fontSize: "0.4rem" }}>◆</span>
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-y-0 left-0 w-20 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #080a0f, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-20 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #080a0f, transparent)" }} />
    </div>
  );
}

export default function InstitutionalSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="institutional"
      ref={ref}
      className="relative py-40 px-6 overflow-hidden"
      style={{ background: "#080a0f" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 20% 60%, rgba(201,168,76,0.04) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ background: "#c9a84c" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>
              Institutional Trust
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold leading-none max-w-3xl"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)", letterSpacing: "-0.03em", color: "#f0ede8" }}
          >
            Trusted by those
            <br />
            <span className="text-gradient-gold">who define markets.</span>
          </motion.h2>
        </div>

        {/* Partner marquee */}
        <div
          className="mb-20"
          style={{ borderTop: "1px solid rgba(37,45,61,0.4)", borderBottom: "1px solid rgba(37,45,61,0.4)" }}
        >
          <LogoMarquee />
        </div>

        {/* Trust metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 mb-24">
          {TRUST_METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8"
              style={{
                borderRight: i < 3 ? "1px solid rgba(37,45,61,0.4)" : "none",
                borderTop: "1px solid rgba(37,45,61,0.4)",
              }}
            >
              <div
                className="text-3xl font-bold mb-2 text-gradient-gold"
                style={{ letterSpacing: "-0.02em" }}
              >
                {m.value}
              </div>
              <div className="text-sm font-semibold mb-1" style={{ color: "#f0ede8" }}>{m.label}</div>
              <div className="text-xs" style={{ color: "#6b7a8d" }}>{m.detail}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.7 }}
              className="relative p-8 group"
              style={{
                border: "1px solid rgba(37,45,61,0.4)",
                background: "rgba(14,17,24,0.6)",
                borderRadius: "4px",
              }}
            >
              {/* Hover top accent */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, #c9a84c, transparent)" }}
                initial={{ scaleX: 0, originX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Quote mark — styled span, no broken serif */}
              <div
                className="leading-none mb-5 select-none"
                style={{ color: "rgba(201,168,76,0.35)", fontSize: "4rem", fontWeight: 700, lineHeight: 1 }}
                aria-hidden="true"
              >
                "
              </div>

              <p className="leading-relaxed mb-8" style={{ color: "#9fa8b4", fontSize: "0.95rem" }}>
                {t.quote}
              </p>

              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "rgba(201,168,76,0.08)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    color: "#c9a84c",
                    letterSpacing: "0.05em",
                  }}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#f0ede8" }}>{t.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#6b7a8d" }}>{t.firm}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
