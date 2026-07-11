"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import HeroOrb from "./three/HeroOrb";

function useMouse() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth  - 0.5) * 2);
      y.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [x, y]);
  return { x, y };
}

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText    = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const { x: mouseX, y: mouseY } = useMouse();

  // scrollProgress for HeroOrb — stored in a ref, no setState, no re-renders
  const scrollRef = useRef(0);
  useEffect(() => scrollYProgress.on("change", (v) => { scrollRef.current = v; }), [scrollYProgress]);

  const parallaX = useSpring(useTransform(mouseX, [-1, 1], [-12, 12]), { stiffness: 60, damping: 20 });
  const parallaY = useSpring(useTransform(mouseY, [-1, 1], [-8,   8]), { stiffness: 60, damping: 20 });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#080a0f" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,45,61,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,45,61,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Lightfall background — self-managed scroll fade, zero re-renders */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <HeroOrb scrollProgress={0} />
      </div>

      {/* Mouse-parallax ambient glow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: "-20%", left: "50%", translateX: "-50%",
          width: "80vw", height: "60vh",
          background: "radial-gradient(ellipse, rgba(16,212,142,0.03) 0%, transparent 70%)",
          x: parallaX, y: parallaY, zIndex: 1,
        }}
      />

      {/* Main content */}
      <motion.div
        className="relative flex flex-col items-center justify-center flex-1 px-5 pt-24 pb-12 md:pt-32 md:pb-16"
        style={{ y: yText, opacity, zIndex: 10 }}
      >
        {/* Pre-headline pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 mb-8 px-4 py-1.5"
          style={{
            border: "1px solid rgba(16,212,142,0.2)",
            borderRadius: "999px",
            background: "rgba(16,212,142,0.05)",
          }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: "#10d48e" }}
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: "#10d48e" }}>
            Elite Investment Platform
          </span>
        </motion.div>

        {/* Giant headline */}
        <div className="text-center max-w-6xl mx-auto mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="leading-none font-bold"
            style={{ fontSize: "clamp(2rem, 9vw, 12rem)", letterSpacing: "-0.02em", color: "#f0ede8", fontFamily: "var(--font-hero, Cormorant Garamond, Georgia, serif)", fontWeight: 700 }}
          >
            THE FUTURE
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="leading-none font-bold text-gradient-emerald"
            style={{ fontSize: "clamp(2rem, 9vw, 12rem)", letterSpacing: "-0.02em", fontFamily: "var(--font-hero, Cormorant Garamond, Georgia, serif)", fontWeight: 700 }}
          >
            OF WEALTH
          </motion.h1>
        </div>

        {/* Sub text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="text-center max-w-lg mb-8 md:mb-12 px-2"
          style={{ color: "#9fa8b4", fontSize: "clamp(0.85rem, 2.5vw, 1.05rem)", lineHeight: 1.75 }}
        >
          Precision-engineered for institutions, hedge funds, and the world&apos;s most
          discerning investors. Trade at the speed of conviction.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-10 md:mb-16"
        >
          <PrimaryButton label="Open Account" href="/auth/open-account" />
          <SecondaryButton label="Explore Platform" href="/platform" />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="flex flex-wrap justify-center gap-x-12 gap-y-5"
        >
          {[
            { label: "AUM",          value: "$48.7B" },
            { label: "Countries",    value: "127"    },
            { label: "Daily Volume", value: "$2.1B"  },
            { label: "Uptime",       value: "99.99%" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              {i > 0 && (
                <div
                  className="hidden sm:block absolute -left-6 top-1/2 -translate-y-1/2 w-px h-6"
                  style={{ background: "rgba(37,45,61,0.5)" }}
                />
              )}
              <div
                className="text-2xl font-bold tabular-nums text-gradient-gold"
                style={{ letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </div>
              <div className="text-xs tracking-widest uppercase mt-1" style={{ color: "#6b7a8d" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity, zIndex: 10 }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <div className="text-xs tracking-widest uppercase" style={{ color: "#6b7a8d" }}>Scroll</div>
        <div className="w-px h-12" style={{ background: "linear-gradient(180deg, #6b7a8d, transparent)" }} />
      </motion.div>
    </section>
  );
}

function PrimaryButton({ label, href = "#" }: { label: string; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x  = useMotionValue(0);
  const y  = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 25 });
  const sy = useSpring(y, { stiffness: 400, damping: 25 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width  / 2) * 0.25);
    y.set((e.clientY - r.top  - r.height / 2) * 0.25);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden px-8 py-3.5 font-semibold text-sm tracking-widest uppercase shrink-0 inline-block"
      style={{
        x: sx, y: sy,
        background: "linear-gradient(135deg, #10d48e 0%, #00bcd4 100%)",
        color: "#040507",
        borderRadius: "2px",
      }}
    >
      <span className="relative z-10">{label}</span>
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(255,255,255,0.15)" }}
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.45 }}
      />
    </motion.a>
  );
}

function SecondaryButton({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ borderColor: "rgba(16,212,142,0.5)", color: "#10d48e" }}
      whileTap={{ scale: 0.97 }}
      className="px-8 py-3.5 font-medium text-sm tracking-widest uppercase shrink-0 inline-block"
      style={{
        border: "1px solid rgba(74,85,104,0.5)",
        color: "#9fa8b4",
        borderRadius: "2px",
        transition: "border-color 0.2s, color 0.2s",
      }}
    >
      {label}
    </motion.a>
  );
}
