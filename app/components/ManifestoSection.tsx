"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const MANIFESTO_LINES = [
  {
    number: "01",
    title: "Institutional Grade",
    body: "Every tool, every algorithm, every data feed is built to the standard of the world's largest trading desks — now accessible to those who demand more.",
  },
  {
    number: "02",
    title: "Zero Compromise",
    body: "Sub-millisecond execution. Fractional spreads. Real-time risk analytics. We removed every bottleneck between your conviction and the market.",
  },
  {
    number: "03",
    title: "Complete Discretion",
    body: "Your portfolio is private. Your strategy is protected. Military-grade encryption and regulatory compliance across 127 jurisdictions.",
  },
];

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-40 px-5 md:px-6 overflow-hidden"
      style={{ background: "#080a0f" }}
    >
      {/* Left accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{ background: "linear-gradient(180deg, transparent, #10d48e, transparent)" }}
      />

      {/* CSS background — animated emerald gradient lines, zero WebGL cost */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft diagonal emerald glow — replaces Threads shader */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 60% at 100% 50%, rgba(16,212,142,0.07) 0%, transparent 55%),
              radial-gradient(ellipse 60% 80% at 0% 80%, rgba(0,188,212,0.04) 0%, transparent 50%)
            `,
          }}
        />
        {/* Subtle horizontal scan lines — pure CSS, GPU compositor only */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(16,212,142,0.015) 3px, rgba(16,212,142,0.015) 4px)",
            backgroundSize: "100% 4px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Big statement */}
        <div className="mb-10 md:mb-28 text-center">
          <div
            className="inline-block font-bold leading-none text-center"
            style={{ fontSize: "clamp(1.75rem, 6vw, 8rem)", letterSpacing: "-0.04em" }}
          >
            <span className="block overflow-hidden">
              <motion.span
                className="block text-gradient-platinum"
                initial={{ y: "110%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                Not just a broker.
              </motion.span>
            </span>
            <span className="block overflow-hidden mt-2">
              <motion.span
                className="block text-gradient-emerald"
                initial={{ y: "110%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                A new architecture
              </motion.span>
            </span>
            <span className="block overflow-hidden mt-2">
              <motion.span
                className="block"
                style={{ color: "#9fa8b4" }}
                initial={{ y: "110%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                of wealth.
              </motion.span>
            </span>
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {MANIFESTO_LINES.map((item, i) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-5 md:p-10"
              style={{
                borderLeft: i === 0 ? "none" : "1px solid rgba(37,45,61,0.5)",
              }}
            >
              {/* Hover bg */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "rgba(16,212,142,0.02)" }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />

              {/* Number */}
              <div className="text-xs font-mono tracking-widest mb-8" style={{ color: "#10d48e" }}>
                {item.number}
              </div>

              {/* Title */}
              <h3
                className="text-xl md:text-2xl font-bold mb-3 md:mb-5 leading-tight"
                style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}
              >
                {item.title}
              </h3>

              {/* Body — colour raised for contrast */}
              <p className="leading-relaxed" style={{ color: "#6b7a8d", fontSize: "0.95rem" }}>
                {item.body}
              </p>

              {/* Bottom accent on hover */}
              <motion.div
                className="absolute bottom-0 left-10 right-10 h-px"
                style={{ background: "linear-gradient(90deg, #10d48e, transparent)" }}
                initial={{ scaleX: 0, originX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
