"use client";

import { motion } from "framer-motion";

const PRODUCTS = [
  {
    name: "Terminal",
    tagline: "Professional trading. Uncompromised.",
    description: "The AUREX Terminal is a desktop-class trading environment built for professional traders who demand the fastest execution, deepest analytics, and most complete market view available anywhere.",
    accent: "#10d48e",
    features: [
      "Sub-0.3ms order execution",
      "Level II order book",
      "Custom watchlists & alerts",
      "Advanced charting (100+ indicators)",
      "Automated strategy builder",
      "Multi-account management",
      "Real-time P&L analytics",
      "API-grade data feeds",
    ],
    badge: "Most Popular",
  },
  {
    name: "Web App",
    tagline: "Institutional power. Browser-native.",
    description: "A full-featured trading platform accessible from any browser. No installation required. Full feature parity with the desktop terminal, optimised for modern web performance.",
    accent: "#c9a84c",
    features: [
      "Full terminal feature set",
      "No download required",
      "Responsive across screen sizes",
      "WebSocket real-time data",
      "Cross-device sync",
      "Biometric authentication",
      "Offline order staging",
      "Browser notifications",
    ],
    badge: null,
  },
  {
    name: "Mobile",
    tagline: "Markets in your pocket.",
    description: "The AUREX mobile app is engineered to the same standard as our desktop platform — not a simplified version. Full trading capabilities, real-time data, and portfolio management on iOS and Android.",
    accent: "#00bcd4",
    features: [
      "Full order management",
      "Real-time portfolio tracking",
      "Face ID / fingerprint auth",
      "Push price alerts",
      "One-tap close positions",
      "Advanced mobile charting",
      "News & intelligence feed",
      "Offline capability",
    ],
    badge: null,
  },
  {
    name: "API Access",
    tagline: "Build on institutional infrastructure.",
    description: "The AUREX API provides programmatic access to our full platform — market data, order management, account information, and historical data — with sub-millisecond latency via FIX and REST protocols.",
    accent: "#10d48e",
    features: [
      "FIX 4.4 & 5.0 SP2 support",
      "REST & WebSocket APIs",
      "Co-location options",
      "Historical tick data",
      "Real-time order book",
      "Risk management endpoints",
      "Sandbox environment",
      "99.99% uptime SLA",
    ],
    badge: "Institutional",
  },
  {
    name: "Integrations",
    tagline: "Connect your entire stack.",
    description: "AUREX integrates with the tools your team already uses — from risk management systems and portfolio analytics to Bloomberg terminals and prime brokerage platforms.",
    accent: "#c9a84c",
    features: [
      "Bloomberg B-PIPE",
      "Refinitiv Elektron",
      "SS&C Eze",
      "Charles River IMS",
      "Risk management APIs",
      "Excel / Google Sheets add-in",
      "Python & R libraries",
      "Custom webhook support",
    ],
    badge: null,
  },
];

const SPECS = [
  { label: "Order Execution", value: "0.3ms", detail: "Average latency" },
  { label: "Uptime SLA", value: "99.99%", detail: "Last 36 months" },
  { label: "Data Feeds", value: "47", detail: "Real-time sources" },
  { label: "Co-lo Sites", value: "8", detail: "Global exchange hubs" },
  { label: "API Calls/sec", value: "10,000", detail: "Per account" },
  { label: "Historical Data", value: "20yr", detail: "Tick-level" },
];

export default function PlatformPageContent() {
  return (
    <div style={{ background: "#080a0f" }} className="pb-32">

      {/* Tech specs strip */}
      <div style={{ borderBottom: "1px solid rgba(37,45,61,0.4)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
            {SPECS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="py-8 px-4"
                style={{ borderRight: i < SPECS.length - 1 ? "1px solid rgba(37,45,61,0.4)" : "none" }}
              >
                <div className="text-2xl font-bold mb-1 text-gradient-emerald" style={{ letterSpacing: "-0.02em" }}>
                  {s.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#f0ede8" }}>
                  {s.label}
                </div>
                <div className="text-xs" style={{ color: "#6b7a8d" }}>{s.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 pt-20 space-y-6">
        {PRODUCTS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="group relative p-8 md:p-10"
            style={{
              border: "1px solid rgba(37,45,61,0.4)",
              background: "rgba(14,17,24,0.5)",
              borderRadius: "4px",
            }}
          >
            {/* Hover top accent */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: p.accent, transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.4 }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left — title + description */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>
                    {p.name}
                  </h2>
                  {p.badge && (
                    <span
                      className="text-xs px-2.5 py-1 font-bold tracking-widest uppercase"
                      style={{
                        background: `rgba(${p.accent === "#10d48e" ? "16,212,142" : "201,168,76"},0.12)`,
                        color: p.accent,
                        borderRadius: "2px",
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm mb-4 font-medium" style={{ color: p.accent }}>
                  {p.tagline}
                </p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b7a8d" }}>
                  {p.description}
                </p>
                <a
                  href="/auth/open-account"
                  className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
                  style={{ color: p.accent }}
                >
                  Get access →
                </a>
              </div>

              {/* Right — features grid */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p.features.map((f, j) => (
                    <div key={f} className="flex items-center gap-3">
                      <div
                        className="w-1 h-4 rounded-full shrink-0"
                        style={{ background: p.accent }}
                      />
                      <span className="text-sm" style={{ color: "#9fa8b4" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
