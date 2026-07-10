"use client";

import { motion } from "framer-motion";

const BG       = "#0a0907"; // matches HeroSection ink background
const PAPER    = "#f3ead8";
const AMBER    = "#ffb200";
const MUTED    = "#8a8071";
const UP       = "#5fa377";
const DOWN     = "#c1573f";
const HAIRLINE = "rgba(138,128,113,0.22)";
const SEPARATOR = "rgba(138,128,113,0.4)"; // was rgba(37,45,61,0.7) — nearly invisible on dark bg

const TICKER_ITEMS = [
  { symbol: "AAPL",    price: "214.83",   change: "+2.14%", up: true  },
  { symbol: "BTC/USD", price: "67,340",   change: "+1.82%", up: true  },
  { symbol: "XAUUSD",  price: "2,389.40", change: "+0.43%", up: true  },
  { symbol: "EUR/USD", price: "1.0842",   change: "-0.21%", up: false },
  { symbol: "NVDA",    price: "924.18",   change: "+3.67%", up: true  },
  { symbol: "SPX500",  price: "5,308.13", change: "+0.87%", up: true  },
  { symbol: "GBP/USD", price: "1.2719",   change: "-0.14%", up: false },
  { symbol: "ETH/USD", price: "3,512.90", change: "+2.03%", up: true  },
  { symbol: "TSLA",    price: "248.50",   change: "+1.55%", up: true  },
  { symbol: "CRUDE",   price: "78.34",    change: "-0.62%", up: false },
];

export default function TickerBar() {
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      role="region"
      aria-label="Live market ticker"
      className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden hidden-on-dash-mobile"
      style={{
        borderTop: `1px solid ${HAIRLINE}`,
        background: `${BG}e0`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.3333%); }
        }
        .ticker-track {
          animation: ticker-scroll 35s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

      {/* Screen-reader summary — the scrolling track below is a decorative,
          tripled-up visual loop of the same data, so it's marked aria-hidden
          and this static list carries the actual content for assistive tech. */}
      <span className="sr-only">
        {TICKER_ITEMS.map((item) => `${item.symbol} ${item.price}, ${item.up ? "up" : "down"} ${item.change}`).join("; ")}
      </span>

      <div className="ticker-track flex whitespace-nowrap py-2.5" aria-hidden="true">
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <div key={i} className="flex items-center shrink-0">
            <span className="mx-5 text-xs select-none" style={{ color: SEPARATOR }}>
              ·
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: MUTED }}>
                {item.symbol}
              </span>
              <span className="text-xs font-mono tabular-nums" style={{ color: PAPER }}>
                {item.price}
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: item.up ? UP : DOWN }}
              >
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-12 pointer-events-none"
        style={{ background: `linear-gradient(90deg, ${BG}e0, transparent)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-12 pointer-events-none"
        style={{ background: `linear-gradient(-90deg, ${BG}e0, transparent)` }}
      />
    </motion.div>
  );
}