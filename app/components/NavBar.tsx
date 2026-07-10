"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/useAuth";

const NAV_LINKS = [
  { label: "Markets",       href: "/markets" },
  { label: "Platform",      href: "/platform" },
  { label: "Intelligence",  href: "/#intelligence" },
  { label: "Institutional", href: "/#institutional" },
];

export default function NavBar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [activeLink,  setActiveLink]  = useState<string | null>(null);
  const { user, loaded, signOut }     = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-20"
        style={{
          background:    scrolled ? "rgba(8,10,15,0.9)" : "transparent",
          backdropFilter:scrolled ? "blur(24px)"        : "none",
          borderBottom:  scrolled ? "1px solid rgba(37,45,61,0.5)" : "none",
          transition:    "background 0.4s ease, backdrop-filter 0.4s ease, border-bottom 0.4s ease",
        }}
      >
        {/* Logo */}
        <motion.a href="/" className="flex items-center gap-3 group" whileHover={{ scale: 1.02 }} aria-label="AUREX home">
          <div className="relative w-8 h-8 shrink-0">
            <div className="absolute inset-0"     style={{ background:"linear-gradient(135deg,#10d48e,#00bcd4)", clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
            <div className="absolute inset-[2px]" style={{ background:"#080a0f",                                  clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
            <div className="absolute inset-[4px]" style={{ background:"linear-gradient(135deg,#10d48e,#00bcd4)", clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity:0.7 }}/>
          </div>
          <span className="text-lg font-bold tracking-[0.25em] uppercase" style={{ color:"#f0ede8" }}>AUREX</span>
        </motion.a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <motion.a key={link.label} href={link.href}
              className="relative text-sm tracking-widest uppercase"
              style={{ color: activeLink===link.label ? "#10d48e" : "#9fa8b4", transition:"color 0.2s ease" }}
              onHoverStart={() => setActiveLink(link.label)}
              onHoverEnd={() => setActiveLink(null)}>
              {link.label}
              <motion.span className="absolute -bottom-1 left-0 h-px"
                style={{ background:"#10d48e" }}
                animate={{ width: activeLink===link.label ? "100%" : "0%" }}
                transition={{ duration:0.2 }}/>
            </motion.a>
          ))}
        </nav>

        {/* CTA — changes based on auth state */}
        <div className="hidden md:flex items-center gap-5">
          {loaded && user ? (
            // Signed-in state
            <>
              <motion.a href="/dashboard"
                className="text-sm tracking-widest uppercase"
                style={{ color:"#9fa8b4", transition:"color 0.2s" }}
                whileHover={{ color:"#f0ede8" }}>
                Dashboard
              </motion.a>
              <button onClick={signOut}
                className="text-sm tracking-widest uppercase"
                style={{ color:"#6b7a8d", transition:"color 0.2s", background:"none", border:"none", cursor:"pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color="#ef4444")}
                onMouseLeave={e => (e.currentTarget.style.color="#6b7a8d")}>
                Sign out
              </button>
            </>
          ) : (
            // Guest state
            <>
              <motion.a href="/auth/signin"
                className="text-sm tracking-widest uppercase"
                style={{ color:"#9fa8b4", transition:"color 0.2s" }}
                whileHover={{ color:"#f0ede8" }}>
                Sign in
              </motion.a>
              <MagneticButton href="/auth/open-account" label="Open Account"/>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <motion.button className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
          <motion.span className="block w-6 h-px" style={{ background:"#f0ede8" }} animate={menuOpen ? { rotate:45, y:5 }  : { rotate:0, y:0 }}/>
          <motion.span className="block w-4 h-px" style={{ background:"#10d48e" }} animate={menuOpen ? { opacity:0, x:-10 } : { opacity:1, x:0 }}/>
          <motion.span className="block w-6 h-px" style={{ background:"#f0ede8" }} animate={menuOpen ? { rotate:-45, y:-5 }: { rotate:0, y:0 }}/>
        </motion.button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
            style={{ background:"rgba(4,5,7,0.97)", backdropFilter:"blur(20px)" }}
            aria-modal="true" role="dialog">
            {NAV_LINKS.map((link, i) => (
              <motion.a key={link.label} href={link.href}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.08, ease:[0.16,1,0.3,1] }}
                className="text-3xl font-light tracking-widest uppercase mb-8"
                style={{ color:"#9fa8b4" }}
                onClick={() => setMenuOpen(false)}>
                {link.label}
              </motion.a>
            ))}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.38 }} className="mt-4 flex flex-col items-center gap-5">
              {loaded && user ? (
                <>
                  <a href="/dashboard" className="text-xl tracking-widest uppercase" style={{ color:"#10d48e" }} onClick={() => setMenuOpen(false)}>
                    Dashboard →
                  </a>
                  <button onClick={() => { signOut(); setMenuOpen(false); }}
                    className="text-base tracking-widest uppercase" style={{ color:"#6b7a8d", background:"none", border:"none", cursor:"pointer" }}>
                    Sign out
                  </button>
                </>
              ) : (
                <MagneticButton href="/auth/open-account" label="Open Account" large/>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MagneticButton({
  href,
  label,
  large,
}: {
  href: string;
  label: string;
  large?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`relative inline-flex items-center justify-center font-semibold tracking-widest uppercase overflow-hidden ${
        large ? "px-10 py-4 text-base" : "px-6 py-2.5 text-xs"
      }`}
      style={{
        x: springX,
        y: springY,
        background: "linear-gradient(135deg, #10d48e, #00bcd4)",
        color: "#040507",
        borderRadius: "2px",
      }}
    >
      <span className="relative z-10">{label}</span>
    </motion.a>
  );
}
