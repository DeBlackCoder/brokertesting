"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/useAuth";

const NAV_LINKS = [
  { label: "Markets",       href: "/markets",       icon: "M3 17l4-8 4 5 4-11 6 14" },
  { label: "Platform",      href: "/platform",      icon: "M4 4h16v16H4zM4 10h16M10 4v16" },
  { label: "Intelligence",  href: "/#intelligence", icon: "M12 2a5 5 0 015 5c0 2-1 3-2 4-.6.6-1 1.2-1 2H10c0-.8-.4-1.4-1-2-1-1-2-2-2-4a5 5 0 015-5zM10 19h4M11 22h2" },
  { label: "Institutional", href: "/#institutional", icon: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" },
];

export default function NavBar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const { user, loaded, signOut }   = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change / escape, lock body scroll while open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const navHeight = "clamp(56px, 8vw, 80px)";

  return (
    <>
      {/* ── Main nav bar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          height:        navHeight,
          padding:       "0 clamp(16px, 4vw, 64px)",
          background:    scrolled ? "rgba(8,10,15,0.92)" : "transparent",
          backdropFilter:scrolled ? "blur(20px)"         : "none",
          borderBottom:  scrolled ? "1px solid rgba(37,45,61,0.45)" : "1px solid transparent",
          transition:    "background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s",
        }}
      >
        {/* Logo */}
        <a href="/"
          aria-label="AUREX home"
          style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, textDecoration:"none" }}>
          <div style={{ position:"relative", width:28, height:28, flexShrink:0 }}>
            <div style={{ position:"absolute", inset:0,     background:"linear-gradient(135deg,#10d48e,#00bcd4)", clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
            <div style={{ position:"absolute", inset:2,     background:"#080a0f",                                  clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
            <div style={{ position:"absolute", inset:3.5,   background:"linear-gradient(135deg,#10d48e,#00bcd4)", clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity:0.7 }}/>
          </div>
          <span style={{ color:"#f0ede8", fontSize:"clamp(0.85rem,3vw,1.05rem)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", lineHeight:1, whiteSpace:"nowrap" }}>
            AUREX
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <motion.a key={link.label} href={link.href}
              className="relative text-sm tracking-widest uppercase"
              style={{ color: activeLink===link.label ? "#10d48e" : "#9fa8b4", transition:"color 0.2s" }}
              onHoverStart={() => setActiveLink(link.label)}
              onHoverEnd={()  => setActiveLink(null)}>
              {link.label}
              <motion.span className="absolute -bottom-1 left-0 h-px"
                style={{ background:"#10d48e" }}
                animate={{ width: activeLink===link.label ? "100%" : "0%" }}
                transition={{ duration:0.2 }}/>
            </motion.a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-5">
          {loaded && user ? (
            <>
              <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.7rem", color:"#5dcaa5", letterSpacing:"0.08em" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#10d48e", boxShadow:"0 0 6px #10d48e" }}/>
                MARKETS OPEN
              </span>
              <div style={{ width:1, height:20, background:"rgba(159,168,180,0.25)" }}/>
              <motion.a href="/dashboard"
                className="text-sm tracking-widest uppercase"
                style={{ color:"#9fa8b4" }}
                whileHover={{ color:"#f0ede8" }}>
                Dashboard
              </motion.a>
              <button onClick={signOut}
                style={{ color:"#6b7a8d", background:"none", border:"none", cursor:"pointer", fontSize:"0.875rem", letterSpacing:"0.1em", textTransform:"uppercase" }}
                onMouseEnter={e => (e.currentTarget.style.color="#ef4444")}
                onMouseLeave={e => (e.currentTarget.style.color="#6b7a8d")}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <motion.a href="/auth/signin"
                className="text-sm tracking-widest uppercase"
                style={{ color:"#9fa8b4" }}
                whileHover={{ color:"#f0ede8" }}>
                Sign in
              </motion.a>
              <MagneticButton href="/auth/open-account" label="Open Account"/>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden relative z-[60] flex flex-col justify-center gap-1.5"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu-panel"
          style={{ width:36, height:36, background:"none", border:"none", cursor:"pointer", padding:6 }}>
          <motion.span className="block h-px rounded-full"
            style={{ background:"#f0ede8", width:"100%" }}
            animate={menuOpen ? { rotate:45, y:6  } : { rotate:0, y:0 }}
            transition={{ duration:0.25 }}/>
          <motion.span className="block h-px rounded-full"
            style={{ background:"#10d48e", width:"66%" }}
            animate={menuOpen ? { opacity:0, x:-8 } : { opacity:1, x:0 }}
            transition={{ duration:0.2 }}/>
          <motion.span className="block h-px rounded-full"
            style={{ background:"#f0ede8", width:"100%" }}
            animate={menuOpen ? { rotate:-45, y:-6 } : { rotate:0, y:0 }}
            transition={{ duration:0.25 }}/>
        </button>
      </motion.nav>

      {/* ── Mobile dropdown menu — anchored panel, not full screen ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Dim backdrop — click to close, but page stays visible behind it */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              className="fixed inset-0 md:hidden"
              style={{ top:navHeight, background:"rgba(4,5,7,0.6)", zIndex:54 }}
              onClick={close}
              aria-hidden="true"/>

            {/* Panel */}
            <motion.div
              id="mobile-menu-panel"
              initial={{ opacity:0, y:-12, scale:0.98 }}
              animate={{ opacity:1, y:0,   scale:1    }}
              exit={{    opacity:0, y:-8,  scale:0.98 }}
              transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
              className="fixed left-3 right-3 md:hidden"
              style={{
                top: `calc(${navHeight} + 8px)`,
                zIndex: 55,
                background: "#0c0f16",
                border: "1px solid rgba(37,45,61,0.6)",
                borderRadius: 14,
                boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                overflow: "hidden",
              }}
              role="dialog" aria-modal="true" aria-label="Mobile menu">

              {/* Market status strip */}
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"12px 18px", borderBottom:"1px solid rgba(37,45,61,0.5)" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#10d48e", boxShadow:"0 0 6px #10d48e" }}/>
                <span style={{ fontSize:"0.68rem", color:"#5dcaa5", letterSpacing:"0.1em", fontWeight:600 }}>MARKETS OPEN</span>
                <span style={{ marginLeft:"auto", fontSize:"0.68rem", color:"#4a5468", letterSpacing:"0.05em" }}>EUR/USD 1.0842</span>
              </div>

              {/* Links */}
              <div style={{ padding:"6px 8px" }}>
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity:0, x:-8 }}
                    animate={{ opacity:1, x:0  }}
                    transition={{ delay:i*0.04, duration:0.25, ease:[0.16,1,0.3,1] }}
                    onClick={close}
                    className="flex items-center gap-3"
                    style={{
                      padding: "13px 12px",
                      borderRadius: 9,
                      color: "#c3cad4",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      textDecoration: "none",
                    }}
                    onTouchStart={e => (e.currentTarget.style.background = "rgba(16,212,142,0.08)")}
                    onTouchEnd={e   => (e.currentTarget.style.background = "transparent")}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10d48e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, opacity:0.85 }}>
                      <path d={link.icon}/>
                    </svg>
                    <span style={{ flex:1 }}>{link.label}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a5468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6l6 6-6 6"/>
                    </svg>
                  </motion.a>
                ))}
              </div>

              {/* Auth actions */}
              <div style={{ padding:"10px 14px 16px", borderTop:"1px solid rgba(37,45,61,0.5)" }}>
                {loaded && user ? (
                  <div className="flex items-center gap-3">
                    <a href="/dashboard" onClick={close}
                      className="flex-1 text-center"
                      style={{ padding:"12px", fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:8, background:"linear-gradient(135deg,#10d48e,#00bcd4)", color:"#040507", textDecoration:"none" }}>
                      Dashboard
                    </a>
                    <button onClick={() => { signOut(); close(); }}
                      aria-label="Sign out"
                      style={{ padding:"12px 16px", borderRadius:8, color:"#6b7a8d", border:"1px solid rgba(37,45,61,0.6)", background:"none" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <a href="/auth/signin" onClick={close}
                      className="flex-1 text-center"
                      style={{ padding:"12px", fontSize:"0.8rem", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:8, color:"#c3cad4", border:"1px solid rgba(37,45,61,0.6)", textDecoration:"none" }}>
                      Sign in
                    </a>
                    <a href="/auth/open-account" onClick={close}
                      className="flex-1 text-center"
                      style={{ padding:"12px", fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", borderRadius:8, background:"linear-gradient(135deg,#10d48e,#00bcd4)", color:"#040507", textDecoration:"none" }}>
                      Open Account
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MagneticButton({ href, label, large }: { href:string; label:string; large?:boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x   = useMotionValue(0);
  const y   = useMotionValue(0);
  const sx  = useSpring(x, { stiffness:400, damping:25 });
  const sy  = useSpring(y, { stiffness:400, damping:25 });

  const onMove  = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width  / 2) * 0.3);
    y.set((e.clientY - r.top  - r.height / 2) * 0.3);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale:0.97 }}
      whileHover={{ boxShadow:"0 0 24px rgba(16,212,142,0.35)" }}
      className={`relative inline-flex items-center justify-center font-semibold tracking-widest uppercase overflow-hidden ${large ? "px-10 py-4 text-base" : "px-6 py-2.5 text-xs"}`}
      style={{ x:sx, y:sy, background:"linear-gradient(135deg,#10d48e,#00bcd4)", color:"#040507", borderRadius:2 }}>
      <span className="relative z-10">{label}</span>
      <motion.div className="absolute inset-0" style={{ background:"rgba(255,255,255,0.15)" }}
        initial={{ x:"-100%" }} whileHover={{ x:"100%" }} transition={{ duration:0.45 }}/>
    </motion.a>
  );
}