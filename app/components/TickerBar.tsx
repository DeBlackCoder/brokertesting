"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/useAuth";

const BG        = "#0a0907"; // matches HeroSection ink background
const PAPER     = "#f3ead8";
const AMBER     = "#ffb200";
const MUTED     = "#8a8071";
const UP        = "#5fa377";
const DOWN      = "#c1573f";
const HAIRLINE  = "rgba(138,128,113,0.22)";
const SEPARATOR = "rgba(138,128,113,0.4)";

// Speed is defined as pixels per second, not a fixed animation-duration.
// A fixed duration (e.g. "11.7s") travels the SAME time but a DIFFERENT
// distance on every screen, because the track's rendered width changes
// with viewport width, font metrics, and OS text scaling — so mobile and
// desktop visibly scrolled at different speeds even though the number in
// the CSS was identical. Deriving duration from the actual measured
// track width fixes that: duration = width / PIXELS_PER_SECOND, so the
// dots move across the screen at the same real-world speed everywhere.
const PIXELS_PER_SECOND = 140;

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
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const { loaded } = useAuth();

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      const setWidth = el.scrollWidth / 3;
      if (setWidth > 0) setDuration(setWidth / PIXELS_PER_SECOND);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [loaded]);

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      role="region"
      aria-label="Live market ticker"
      className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
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
        @keyframes live-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255,178,0,0.5); }
          50%      { opacity: 0.6; box-shadow: 0 0 0 3px rgba(255,178,0,0); }
        }
        .ticker-track {
          animation-name: ticker-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .ticker-track:hover,
        .ticker-track:focus-within {
          animation-play-state: paused;
        }
        .ticker-item {
          transition: background-color 0.15s ease;
          border-radius: 6px;
        }
        .ticker-item:hover {
          background-color: rgba(243,234,216,0.05);
        }
        .live-dot {
          animation: live-pulse 1.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .live-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* Top accent line — thin amber gradient, echoes the live-data feel without adding weight */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${AMBER}55 20%, ${AMBER}55 80%, transparent)`,
        }}
      />

      {/* Screen-reader summary — the scrolling track below is a decorative,
          tripled-up visual loop of the same data, so it's marked aria-hidden
          and this static list carries the actual content for assistive tech. */}
      <span className="sr-only">
        {TICKER_ITEMS.map((item) => `${item.symbol} ${item.price}, ${item.up ? "up" : "down"} ${item.change}`).join("; ")}
      </span>

      {/* Live badge — fixed pill at the left edge, sits above the scrolling track */}
      <div
        className="absolute left-3 top-1/2 z-10 flex items-center"
        style={{
          transform: "translateY(-50%)",
          gap: 5,
          padding: "3px 8px 3px 7px",
          borderRadius: 999,
          border: `1px solid ${AMBER}33`,
          background: "rgba(10,9,7,0.9)",
        }}
        aria-hidden="true"
      >
        <span
          className="live-dot"
          style={{ width: 5, height: 5, borderRadius: "50%", background: AMBER }}
        />
        <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: AMBER }}>
          LIVE
        </span>
      </div>

      <div
        ref={trackRef}
        className="ticker-track flex whitespace-nowrap py-2.5 pl-20"
        style={duration ? { animationDuration: `${duration}s` } : { visibility: "hidden" }}
        aria-hidden="true"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <div key={i} className="ticker-item flex items-center shrink-0 px-1.5">
            <span className="mx-4 text-xs select-none" style={{ color: SEPARATOR }}>
              ·
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: MUTED }}>
                {item.symbol}
              </span>
              <span className="text-xs font-mono tabular-nums" style={{ color: PAPER }}>
                {item.price}
              </span>
              <span
                className="flex items-center gap-1 text-xs font-mono font-semibold tabular-nums"
                style={{ color: item.up ? UP : DOWN }}
              >
                <svg
                  width="7" height="7" viewBox="0 0 10 10"
                  style={{ transform: item.up ? "none" : "rotate(180deg)" }}
                >
                  <path d="M5 0L10 8H0Z" fill={item.up ? UP : DOWN} />
                </svg>
                {item.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-20 pointer-events-none"
        style={{ background: `linear-gradient(90deg, ${BG}e0, transparent)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-12 pointer-events-none"
        style={{ background: `linear-gradient(-90deg, ${BG}e0, transparent)` }}
      />
    </motion.div>
  );
}