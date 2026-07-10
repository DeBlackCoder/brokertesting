"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  {
    id: "equities",
    name: "Equities",
    description: "Access 10,000+ global equity instruments with direct market access to the world's major exchanges.",
    accent: "#10d48e",
    stat: "10,000+",
    statLabel: "Instruments",
    spread: "From 0.01%",
    leverage: "Up to 1:20",
    hours: "Exchange hours",
    markets: [
      { name: "US Equities", exchanges: "NYSE, NASDAQ, AMEX", instruments: "5,000+", minSpread: "0.01%" },
      { name: "European Equities", exchanges: "LSE, XETRA, Euronext", instruments: "2,500+", minSpread: "0.02%" },
      { name: "Asian Equities", exchanges: "TSE, HKEX, SGX", instruments: "1,500+", minSpread: "0.03%" },
      { name: "ETFs", exchanges: "Global", instruments: "1,000+", minSpread: "0.01%" },
    ],
    features: ["Direct Market Access", "Pre & Post-market trading", "Fractional shares", "Corporate actions", "Dividend reinvestment"],
  },
  {
    id: "forex",
    name: "Forex",
    description: "Trade 130+ currency pairs with institutional-grade spreads starting from 0.0 pips on majors.",
    accent: "#c9a84c",
    stat: "130+",
    statLabel: "Currency pairs",
    spread: "From 0.0 pips",
    leverage: "Up to 1:500",
    hours: "24/5",
    markets: [
      { name: "Major Pairs", exchanges: "Global FX", instruments: "28", minSpread: "0.0 pips" },
      { name: "Minor Pairs", exchanges: "Global FX", instruments: "42", minSpread: "0.2 pips" },
      { name: "Exotic Pairs", exchanges: "Global FX", instruments: "60+", minSpread: "1.0 pips" },
      { name: "Precious Metals FX", exchanges: "Global FX", instruments: "4", minSpread: "0.1 pips" },
    ],
    features: ["Raw interbank spreads", "No dealing desk", "Negative balance protection", "Swap-free accounts available", "Institutional liquidity"],
  },
  {
    id: "derivatives",
    name: "Derivatives",
    description: "Futures, options, and swaps across every major asset class with institutional execution.",
    accent: "#00bcd4",
    stat: "500+",
    statLabel: "Contracts",
    spread: "From $0.25",
    leverage: "Up to 1:200",
    hours: "Near 24/5",
    markets: [
      { name: "Index Futures", exchanges: "CME, EUREX, SGX", instruments: "40+", minSpread: "$0.25" },
      { name: "Commodity Futures", exchanges: "CME, ICE, LME", instruments: "80+", minSpread: "$0.50" },
      { name: "Options", exchanges: "CBOE, CME", instruments: "200+", minSpread: "Variable" },
      { name: "Interest Rate Swaps", exchanges: "OTC", instruments: "On request", minSpread: "Negotiated" },
    ],
    features: ["Physical & cash settlement", "Options strategies", "Portfolio margining", "Block trading", "Prime brokerage"],
  },
  {
    id: "digital",
    name: "Digital Assets",
    description: "200+ crypto instruments including perpetuals, options, and DeFi indices — 24/7 trading.",
    accent: "#9b59b6",
    stat: "200+",
    statLabel: "Instruments",
    spread: "From 0.01%",
    leverage: "Up to 1:100",
    hours: "24/7",
    markets: [
      { name: "BTC Products", exchanges: "AUREX", instruments: "12", minSpread: "0.01%" },
      { name: "ETH Products", exchanges: "AUREX", instruments: "8", minSpread: "0.02%" },
      { name: "Altcoin CFDs", exchanges: "AUREX", instruments: "120+", minSpread: "0.05%" },
      { name: "DeFi Indices", exchanges: "AUREX", instruments: "10", minSpread: "0.10%" },
    ],
    features: ["Perpetual contracts", "Quarterly futures", "Options", "Crypto indices", "Institutional custody"],
  },
  {
    id: "commodities",
    name: "Commodities",
    description: "Trade energy, metals, and agricultural commodities with direct access to global futures markets.",
    accent: "#e67e22",
    stat: "50+",
    statLabel: "Commodities",
    spread: "From $0.03",
    leverage: "Up to 1:100",
    hours: "Near 24/5",
    markets: [
      { name: "Energy", exchanges: "CME, ICE", instruments: "8", minSpread: "$0.03" },
      { name: "Precious Metals", exchanges: "COMEX, LME", instruments: "6", minSpread: "$0.10" },
      { name: "Base Metals", exchanges: "LME", instruments: "8", minSpread: "$0.50" },
      { name: "Agricultural", exchanges: "CBOT, ICE", instruments: "20+", minSpread: "$0.25" },
    ],
    features: ["Spot & futures", "CFDs & physical", "Seasonal analysis tools", "Supply & demand data", "Weather analytics"],
  },
];

function accentRgb(hex: string) {
  const map: Record<string, string> = {
    "#10d48e": "16,212,142",
    "#c9a84c": "201,168,76",
    "#00bcd4": "0,188,212",
    "#9b59b6": "155,89,182",
    "#e67e22": "230,126,34",
  };
  return map[hex] ?? "16,212,142";
}

export default function MarketsPageContent() {
  const [active, setActive] = useState(0);
  const cat = CATEGORIES[active];

  return (
    <div style={{ background: "#080a0f" }} className="pb-32">
      {/* Category tabs */}
      <div
        className="sticky top-20 z-30 px-6"
        style={{
          background: "rgba(8,10,15,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(37,45,61,0.4)",
        }}
      >
        <div className="max-w-7xl mx-auto flex gap-0 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 px-5 py-5 text-sm font-medium tracking-widest uppercase whitespace-nowrap shrink-0 relative"
              style={{
                color: active === i ? c.accent : "#6b7a8d",
                transition: "color 0.2s",
              }}
            >
              {c.name}
              {active === i && (
                <motion.div
                  layoutId="market-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: c.accent }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="max-w-7xl mx-auto px-6 pt-20"
        >
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-16"
            style={{ border: "1px solid rgba(37,45,61,0.35)", borderRadius: "4px", overflow: "hidden" }}
          >
            {[
              { label: "Instruments", value: cat.stat },
              { label: "Min Spread", value: cat.spread },
              { label: "Max Leverage", value: cat.leverage },
              { label: "Trading Hours", value: cat.hours },
            ].map((item, i) => (
              <div
                key={item.label}
                className="p-6"
                style={{ borderRight: i < 3 ? "1px solid rgba(37,45,61,0.35)" : "none" }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: cat.accent, letterSpacing: "-0.02em" }}>
                  {item.value}
                </div>
                <div className="text-xs uppercase tracking-widest" style={{ color: "#6b7a8d" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Markets table + features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table */}
            <div className="lg:col-span-2">
              <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#9fa8b4" }}>
                Available Markets
              </div>
              <div
                style={{
                  border: "1px solid rgba(37,45,61,0.4)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  className="grid grid-cols-4 px-6 py-3 text-xs font-bold tracking-widest uppercase"
                  style={{
                    color: "#6b7a8d",
                    background: "rgba(14,17,24,0.8)",
                    borderBottom: "1px solid rgba(37,45,61,0.4)",
                  }}
                >
                  <span>Market</span>
                  <span>Exchange</span>
                  <span>Instruments</span>
                  <span>Min Spread</span>
                </div>
                {cat.markets.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="grid grid-cols-4 px-6 py-4 text-sm"
                    style={{
                      borderBottom: i < cat.markets.length - 1 ? "1px solid rgba(37,45,61,0.3)" : "none",
                      background: "rgba(14,17,24,0.4)",
                    }}
                  >
                    <span style={{ color: "#f0ede8", fontWeight: 500 }}>{m.name}</span>
                    <span style={{ color: "#6b7a8d" }}>{m.exchanges}</span>
                    <span style={{ color: cat.accent }}>{m.instruments}</span>
                    <span style={{ color: "#9fa8b4", fontFamily: "monospace" }}>{m.minSpread}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#9fa8b4" }}>
                Key Features
              </div>
              <div
                className="p-6"
                style={{
                  border: "1px solid rgba(37,45,61,0.4)",
                  background: `rgba(${accentRgb(cat.accent)},0.04)`,
                  borderRadius: "4px",
                }}
              >
                <div className="space-y-4">
                  {cat.features.map((f, i) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.accent }} />
                      <span className="text-sm" style={{ color: "#9fa8b4" }}>{f}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(37,45,61,0.4)" }}>
                  <a
                    href="/auth/open-account"
                    className="block w-full text-center py-3 text-sm font-semibold tracking-widest uppercase"
                    style={{
                      background: `linear-gradient(135deg, ${cat.accent}, #00bcd4)`,
                      color: "#040507",
                      borderRadius: "2px",
                    }}
                  >
                    Start Trading
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
