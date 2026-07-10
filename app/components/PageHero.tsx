"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  label: string;
  title: string;
  highlight?: string;
  description?: string;
  accent?: string;
}

export default function PageHero({
  label,
  title,
  highlight,
  description,
  accent = "#10d48e",
}: PageHeroProps) {
  return (
    <section
      className="relative pt-40 pb-20 px-6 overflow-hidden"
      style={{ background: "#080a0f" }}
    >
      {/* Fine grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,45,61,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,45,61,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-96 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(${
            accent === "#10d48e" ? "16,212,142" :
            accent === "#c9a84c" ? "201,168,76" : "0,188,212"
          },0.08) 0%, transparent 70%)`,
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        aria-hidden="true"
        style={{ background: "linear-gradient(to bottom, transparent, #080a0f)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px" style={{ background: accent }} />
          <span className="text-xs tracking-widest uppercase font-medium" style={{ color: accent }}>
            {label}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-bold leading-none mb-6"
          style={{
            fontSize: "clamp(2.8rem, 6vw, 7rem)",
            letterSpacing: "-0.035em",
            color: "#f0ede8",
          }}
        >
          {title}
          {highlight && (
            <>
              <br />
              <span
                style={{
                  background: `linear-gradient(135deg, ${accent}, #00bcd4)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {highlight}
              </span>
            </>
          )}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="max-w-xl text-lg leading-relaxed"
            style={{ color: "#6b7a8d" }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
