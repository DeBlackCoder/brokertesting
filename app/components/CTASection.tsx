"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Orb from "./backgrounds/Orb";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      className="relative py-48 px-6 overflow-hidden"
      style={{ background: "#040507" }}
    >
      {/* Orb shader */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{ opacity: 0.85 }}
      >
        <Orb
          hue={150}
          hoverIntensity={0.25}
          rotateOnHover={true}
          forceHoverState={false}
          backgroundColor="#040507"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#10d48e" }}
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: "#10d48e" }}
          >
            Ready to begin
          </span>
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#10d48e" }}
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </motion.div>

        {/* Headline */}
        <div className="overflow-hidden mb-4">
          <motion.h2
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold leading-none"
            style={{
              fontSize: "clamp(3rem, 8vw, 9rem)",
              letterSpacing: "-0.04em",
              color: "#f0ede8",
            }}
          >
            Enter
          </motion.h2>
        </div>
        <div className="overflow-hidden mb-12">
          <motion.h2
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold leading-none text-gradient-emerald"
            style={{
              fontSize: "clamp(3rem, 8vw, 9rem)",
              letterSpacing: "-0.04em",
            }}
          >
            AUREX.
          </motion.h2>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-12 max-w-lg mx-auto"
          style={{ color: "#4a5568", lineHeight: 1.8 }}
        >
          Applications reviewed within 24 hours. Dedicated onboarding team.
          Full institutional infrastructure from day one.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <CTAPrimary label="Apply for Access" href="/auth/open-account" />
          <CTASecondary label="Schedule a Consultation" href="/company/about" />
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
          className="mt-10 text-xs tracking-wider"
          style={{ color: "rgba(74,85,104,0.6)" }}
        >
          FCA Regulated · SOC 2 Certified · 24/7 Client Support · Minimum $250,000 AUM
        </motion.p>
      </div>
    </section>
  );
}

function CTAPrimary({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden px-12 py-5 font-bold text-sm tracking-widest uppercase inline-block"
      style={{
        background: "linear-gradient(135deg, #10d48e 0%, #00bcd4 100%)",
        color: "#040507",
        borderRadius: "2px",
        minWidth: 220,
        textAlign: "center",
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(255,255,255,0.15)" }}
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative z-10">{label}</span>
    </motion.a>
  );
}

function CTASecondary({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ borderColor: "rgba(201,168,76,0.6)", color: "#c9a84c" }}
      whileTap={{ scale: 0.97 }}
      className="px-12 py-5 font-medium text-sm tracking-widest uppercase inline-block"
      style={{
        border: "1px solid rgba(74,85,104,0.4)",
        color: "#9fa8b4",
        borderRadius: "2px",
        minWidth: 220,
        textAlign: "center",
        transition: "border-color 0.2s, color 0.2s",
      }}
    >
      {label}
    </motion.a>
  );
}
