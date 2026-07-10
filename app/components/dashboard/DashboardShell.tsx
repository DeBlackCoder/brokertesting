"use client";

import { motion } from "framer-motion";

/**
 * Dashboard shell — placeholder until the full design is confirmed.
 * The layout skeleton is already structured for the final build:
 * sidebar nav | main content area | right panel
 */
export default function DashboardShell() {
  return (
    <div className="min-h-screen flex" style={{ background: "#080a0f" }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 px-6 py-8"
        style={{ borderRight: "1px solid rgba(37,45,61,0.4)", background: "rgba(8,10,15,0.95)" }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 mb-12">
          <div className="relative w-7 h-7 shrink-0">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
            <div className="absolute inset-[2px]" style={{ background: "#080a0f", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
            <div className="absolute inset-[3px]" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity: 0.7 }} />
          </div>
          <span className="text-sm font-bold tracking-[0.25em] uppercase" style={{ color: "#f0ede8" }}>AUREX</span>
        </a>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {[
            { label: "Overview",      icon: "◈", active: true  },
            { label: "Portfolio",     icon: "◉", active: false },
            { label: "Markets",       icon: "◍", active: false },
            { label: "Orders",        icon: "◌", active: false },
            { label: "Intelligence",  icon: "◎", active: false },
            { label: "Analytics",     icon: "◐", active: false },
            { label: "Settings",      icon: "◑", active: false },
          ].map(item => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left transition-colors"
              style={{
                color:      item.active ? "#10d48e" : "#6b7a8d",
                background: item.active ? "rgba(16,212,142,0.07)" : "transparent",
                borderRadius: "4px",
                borderLeft: item.active ? "2px solid #10d48e" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: "0.75rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User block */}
        <div className="pt-6" style={{ borderTop: "1px solid rgba(37,45,61,0.4)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c" }}>
              AC
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: "#f0ede8" }}>Account</div>
              <div className="text-xs truncate" style={{ color: "#6b7a8d" }}>Pending KYC</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-12">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ borderBottom: "1px solid rgba(37,45,61,0.4)", background: "rgba(8,10,15,0.8)", backdropFilter: "blur(16px)" }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>
              Welcome to AUREX
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#6b7a8d" }}>
              Your dashboard is being configured
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: "#c9a84c" }}
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              aria-hidden="true"
            />
            <span className="text-xs" style={{ color: "#c9a84c" }}>KYC Pending</span>
          </div>
        </div>

        {/* Dashboard placeholder content */}
        <div className="px-8 py-10">

          {/* KYC notice */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 mb-8 flex items-start gap-5"
            style={{ border: "1px solid rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.05)", borderRadius: "4px" }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <span style={{ color: "#c9a84c", fontSize: "1rem" }}>!</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: "#f0ede8" }}>Verify your email to activate your account</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7a8d" }}>
                We sent a verification link to your registered email address. Please click it to fully activate your account and unlock trading features.
              </p>
            </div>
          </motion.div>

          {/* Stat cards — locked placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: "Portfolio Value",  value: "—",      accent: "#10d48e" },
              { label: "Today's P&L",      value: "—",      accent: "#c9a84c" },
              { label: "Open Positions",   value: "—",      accent: "#00bcd4" },
              { label: "Available Margin", value: "—",      accent: "#10d48e" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-6"
                style={{ border: "1px solid rgba(37,45,61,0.4)", background: "rgba(14,17,24,0.6)", borderRadius: "4px" }}
              >
                <div className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6b7a8d" }}>{card.label}</div>
                <div className="text-3xl font-bold" style={{ color: card.accent, letterSpacing: "-0.03em" }}>{card.value}</div>
                <div className="text-xs mt-2" style={{ color: "rgba(74,85,104,0.5)" }}>Unlocked after verification</div>
              </motion.div>
            ))}
          </div>

          {/* Coming soon panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col items-center justify-center py-24 text-center"
            style={{ border: "1px dashed rgba(37,45,61,0.4)", borderRadius: "4px" }}
          >
            <div className="text-4xl mb-4" style={{ color: "rgba(37,45,61,0.6)" }}>◈</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#9fa8b4", letterSpacing: "-0.01em" }}>
              Dashboard in preparation
            </h3>
            <p className="text-sm max-w-sm" style={{ color: "#4a5568", lineHeight: 1.7 }}>
              Your full trading dashboard — charts, order management, positions, and analytics — will be available once your account is verified and approved.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
