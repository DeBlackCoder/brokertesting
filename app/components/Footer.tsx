"use client";

import { motion } from "framer-motion";

const LINKS: Record<string, Record<string, string>> = {
  Platform: {
    "Terminal":     "/platform",
    "Web App":      "/platform",
    "Mobile":       "/platform",
    "API Access":   "/platform",
    "Integrations": "/platform",
  },
  Markets: {
    "Equities":      "/markets",
    "Forex":         "/markets",
    "Derivatives":   "/markets",
    "Digital Assets":"/markets",
    "Commodities":   "/markets",
  },
  Company: {
    "About":     "/company/about",
    "Careers":   "/company/careers",
    "Press":     "/company/about",
    "Investors": "/company/about",
    "Security":  "/company/security",
  },
  Legal: {
    "Privacy Policy":   "/legal/privacy",
    "Terms of Service": "/legal/terms",
    "Risk Disclosure":  "/legal/risk-disclosure",
    "Regulatory":       "/legal/terms",
    "Cookies":          "/legal/privacy",
  },
};

export default function Footer() {
  return (
    <footer
      className="relative px-6 pt-20 pb-12 overflow-hidden"
      style={{ background: "#040507", borderTop: "1px solid rgba(37,45,61,0.4)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          {/* Brand — full row on mobile, 2 cols on md */}
          <div className="sm:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-6 w-fit">
              <div className="relative w-7 h-7 shrink-0">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, #10d48e, #00bcd4)",
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                />
                <div
                  className="absolute inset-[2px]"
                  style={{
                    background: "#040507",
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                />
                <div
                  className="absolute inset-[3px]"
                  style={{
                    background: "linear-gradient(135deg, #10d48e, #00bcd4)",
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="text-base font-bold tracking-[0.25em] uppercase" style={{ color: "#f0ede8" }}>
                AUREX
              </span>
            </a>

            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "#6b7a8d" }}>
              The premier brokerage platform for high-net-worth individuals, institutions,
              and professional traders.
            </p>

            <div className="flex items-center gap-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "#10d48e" }}
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />
              <span className="text-xs" style={{ color: "#6b7a8d" }}>All systems operational</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <div className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#9fa8b4" }}>
                {category}
              </div>
              <ul className="space-y-3">
                {Object.entries(links).map(([label, href]) => (
                  <li key={label}>
                    <motion.a
                      href={href}
                      className="text-sm"
                      style={{ color: "#6b7a8d", display: "inline-block", transition: "color 0.2s" }}
                      whileHover={{ color: "#9fa8b4", x: 2 }}
                    >
                      {label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="w-full h-px mb-8"
          style={{ background: "linear-gradient(90deg, transparent, rgba(37,45,61,0.6), transparent)" }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs" style={{ color: "rgba(107,122,141,0.6)" }}>
            © 2026 AUREX Capital Markets Ltd. All rights reserved.
          </div>
          <div
            className="text-xs text-center md:text-right max-w-lg"
            style={{ color: "rgba(107,122,141,0.5)" }}
          >
            Trading involves substantial risk. Past performance is not indicative of future results.
            AUREX is regulated by the FCA (UK), SEC (US), and MAS (SG).
          </div>
        </div>
      </div>
    </footer>
  );
}
