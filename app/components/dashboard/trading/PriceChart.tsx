"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { generateHistory, SimCandle } from "./priceEngine";
import { formatPrice } from "./instruments";

interface Marker { id: string; price: number; side: "buy" | "sell"; }

interface Props {
  base:           string;
  currentPrice:   number | null;
  openPositions?: Marker[];
}

const CANDLE_MS   = 2000;
const MAX_CANDLES = 200; // pack tightly → ultra-thin bars
const UP_COL      = "#00e5c8"; // teal/cyan — matches inspo
const DN_COL      = "#e53935"; // warm red — matches inspo
const BG          = "#050810"; // very dark navy

export default function PriceChart({ base, currentPrice, openPositions = [] }: Props) {
  const [candles, setCandles] = useState<SimCandle[]>([]);
  const prevBase   = useRef("");
  const bucketRef  = useRef(0);
  const hiRef      = useRef(0);
  const loRef      = useRef(Infinity);

  // Seed history when instrument changes
  useEffect(() => {
    if (prevBase.current === base) return;
    prevBase.current = base;
    const hist = generateHistory(base, MAX_CANDLES, CANDLE_MS);
    setCandles(hist);
    bucketRef.current = 0;
    hiRef.current     = 0;
    loRef.current     = Infinity;
  }, [base]);

  // Aggregate ticks into live candles
  useEffect(() => {
    if (currentPrice == null || candles.length === 0) return;
    const bucket = Math.floor(Date.now() / CANDLE_MS) * CANDLE_MS;

    if (bucket !== bucketRef.current) {
      bucketRef.current = bucket;
      hiRef.current     = currentPrice;
      loRef.current     = currentPrice;
      setCandles(prev => [
        ...prev.slice(-(MAX_CANDLES - 1)),
        { t: bucket, o: currentPrice, h: currentPrice, l: currentPrice, c: currentPrice, vol: 0 },
      ]);
    } else {
      if (currentPrice > hiRef.current) hiRef.current = currentPrice;
      if (currentPrice < loRef.current) loRef.current = currentPrice;
      setCandles(prev => {
        if (!prev.length) return prev;
        const next = [...prev];
        next[next.length - 1] = {
          ...next[next.length - 1],
          h: hiRef.current,
          l: loRef.current,
          c: currentPrice,
        };
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice]);

  const visible = candles.slice(-MAX_CANDLES);

  // MA lines — computed unconditionally, before any early return, so hook
  // order stays identical across renders (Rules of Hooks).
  const ma20 = useMemo(() => {
    return visible.map((_, i) => {
      if (i < 19) return null;
      const slice = visible.slice(i - 19, i + 1);
      return slice.reduce((s, c) => s + c.c, 0) / 20;
    });
  }, [visible]);

  const ma50 = useMemo(() => {
    return visible.map((_, i) => {
      if (i < 49) return null;
      const slice = visible.slice(i - 49, i + 1);
      return slice.reduce((s, c) => s + c.c, 0) / 50;
    });
  }, [visible]);

  // ── SVG dimensions ───────────────────────────────────────────────────────
  const W = 900, H = 468;  // fixed height matching 500px container - 32px padding
  const PAD_L = 0, PAD_R = 110, PAD_T = 12, PAD_B = 8;
  const chartW = W - PAD_L - PAD_R;

  if (visible.length < 2) {
    return (
      <div style={{ width:"100%", height:"100%", background:BG, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
        <motion.div style={{ width:8, height:8, borderRadius:"50%", background:UP_COL, boxShadow:`0 0 12px ${UP_COL}` }}
          animate={{ scale:[1,1.8,1], opacity:[1,0.3,1] }} transition={{ duration:1.2, repeat:Infinity }}/>
        <span style={{ color:"#2a3a5a", fontSize:11, fontFamily:"var(--font-mono, JetBrains Mono, monospace)" }}>Loading chart…</span>
      </div>
    );
  }

  // Y range with generous padding so candles use most of the vertical space.
  // currentPrice is only folded in when it actually exists, rather than
  // relying on 0 / Infinity as silent sentinel values.
  const allH = visible.map(c => c.h);
  const allL = visible.map(c => c.l);
  const extra = currentPrice != null ? [currentPrice] : [];
  const rawMax = Math.max(...allH, ...extra);
  const rawMin = Math.min(...allL, ...extra);
  const yPad   = (rawMax - rawMin) * 0.12;
  const yMax   = rawMax + yPad;
  const yMin   = rawMin - yPad;

  const toY = (v: number) =>
    PAD_T + ((yMax - v) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  // Candle geometry — ultra-slim 1–1.5px bars
  const gap      = 3;
  const totalW   = chartW / MAX_CANDLES;
  const candleW  = Math.max(1, Math.min(1.5, totalW - gap));
  const xOf      = (i: number) => PAD_L + i * totalW + (totalW - candleW) / 2;

  // Build smooth curved paths for MA lines using cubic bezier interpolation
  function smoothPath(pts: string[]): string {
    if (pts.length < 2) return "";
    const coords = pts.map(p => { const [x,y] = p.split(",").map(Number); return { x, y }; });
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cpx  = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }

  const ma20pts = ma20
    .map((v, i) => v != null ? `${xOf(i) + candleW / 2},${toY(v)}` : null)
    .filter((p): p is string => p != null);
  const ma50pts = ma50
    .map((v, i) => v != null ? `${xOf(i) + candleW / 2},${toY(v)}` : null)
    .filter((p): p is string => p != null);

  const ma20path = smoothPath(ma20pts);
  const ma50path = smoothPath(ma50pts);

  const priceY  = currentPrice != null ? toY(currentPrice) : toY(visible[visible.length - 1]?.c ?? 0);
  const latestUp = visible.length > 0 && visible[visible.length-1].c >= visible[visible.length-1].o;

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: BG,
      overflowX: "auto",
      overflowY: "hidden",
      touchAction: "pan-x pinch-zoom",
      position: "relative",
      borderRadius: 4,
    }}>
      {/* Fixed 900px wide on all screens — scrolls on mobile, fills on desktop */}
      <div style={{
        width: "max(100%, 900px)",
        height: "100%",
        position: "relative",
        flexShrink: 0,
      }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "100%", display: "block" }}
          preserveAspectRatio="none"
        >
        <defs>
          {/* Glow filters */}
          <filter id="glow-up" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-dn" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Subtle background radial for depth */}
          <radialGradient id="bg-depth" cx="50%" cy="60%" r="70%">
            <stop offset="0%"   stopColor="#0a1428" stopOpacity="1"/>
            <stop offset="100%" stopColor="#050810" stopOpacity="1"/>
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width={W} height={H} fill="url(#bg-depth)"/>

        {/* Very subtle horizontal grid */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i}
            x1={0} y1={PAD_T + f * (H - PAD_T - PAD_B)}
            x2={W - PAD_R} y2={PAD_T + f * (H - PAD_T - PAD_B)}
            stroke="rgba(255,255,255,0.025)" strokeWidth={1}/>
        ))}

        {/* MA lines — smooth cubic bezier curves, thin, spanning full chart */}
        {ma20path && (
          <path d={ma20path} fill="none"
            stroke="#4f8ef7" strokeWidth={0.7} opacity={0.75}
            strokeLinejoin="round" strokeLinecap="round"/>
        )}
        {ma50path && (
          <path d={ma50path} fill="none"
            stroke="#22d3ee" strokeWidth={0.5} opacity={0.45}
            strokeLinejoin="round" strokeLinecap="round"/>
        )}

        {/* Candles */}
        {visible.map((c, i) => {
          const x   = xOf(i);
          const up  = c.c >= c.o;
          const col = up ? UP_COL : DN_COL;
          const bTop = toY(Math.max(c.o, c.c));
          const bBot = toY(Math.min(c.o, c.c));
          const bH   = Math.max(1.5, bBot - bTop);
          const cx   = x + candleW / 2;
          const isLast = i === visible.length - 1;

          return (
            <g key={c.t} filter={isLast ? (up?"url(#glow-up)":"url(#glow-dn)") : undefined}>
              {/* Wick */}
              <line
                x1={cx} y1={toY(c.h)}
                x2={cx} y2={toY(c.l)}
                stroke={col}
                strokeWidth={0.8}
                opacity={0.65}
              />
              {/* Body */}
              <rect
                x={x} y={bTop}
                width={candleW} height={bH}
                fill={col}
                opacity={isLast ? 1 : 0.85}
              />
            </g>
          );
        })}

        {/* Open position lines */}
        {openPositions.map(pos => {
          const yPos = toY(pos.price);
          if (yPos < PAD_T || yPos > H - PAD_B) return null;
          const col = pos.side === "buy" ? UP_COL : DN_COL;
          return (
            <line key={pos.id}
              x1={0} y1={yPos} x2={W - PAD_R} y2={yPos}
              stroke={col} strokeWidth={1} strokeDasharray="5,5" opacity={0.45}/>
          );
        })}

        {/* Current price dashed crosshair line — inside SVG */}
        {currentPrice != null && (
          <line
            x1={0} y1={priceY} x2={W - PAD_R} y2={priceY}
            stroke={latestUp ? UP_COL : DN_COL}
            strokeWidth={0.8}
            strokeDasharray="4,5"
            opacity={0.5}
          />
        )}

        {/* Y-axis price levels — right side, readable */}
        {[0.15, 0.5, 0.85].map((f, i) => {
          const v = yMin + (1 - f) * (yMax - yMin);
          const y = toY(v);
          return (
            <text key={i}
              x={W - PAD_R + 5} y={y + 5}
              fill="#3a5080" fontSize={13} fontFamily="var(--font-mono, JetBrains Mono, monospace)" fontWeight="500">
              {formatPrice(v)}
            </text>
          );
        })}
      </svg>

      {/* ── Price label — DOM overlay, not inside SVG, so font renders crisply ── */}
      {currentPrice != null && (
        <div style={{
          position:   "absolute",
          right:      0,
          top:        `${(priceY / H) * 100}%`,
          transform:  "translateY(-50%)",
          pointerEvents: "none",
          zIndex:     10,
          display:    "flex",
          alignItems: "center",
          gap:        6,
        }}>
          {/* Dot */}
          <motion.div style={{
            width:8, height:8, borderRadius:"50%", flexShrink:0,
            background:   latestUp ? UP_COL : DN_COL,
            boxShadow:    `0 0 10px ${latestUp ? UP_COL : DN_COL}`,
          }}
            animate={{ scale:[1,2,1], opacity:[1,0.2,1] }}
            transition={{ duration:1.4, repeat:Infinity }}/>
          {/* Label pill */}
          <div style={{
            background:   latestUp ? UP_COL : DN_COL,
            borderRadius: 4,
            padding:      "4px 10px",
            fontSize:     13,
            fontWeight:   700,
            fontFamily:   "var(--font-mono, JetBrains Mono, monospace)",
            color:        "#fff",
            letterSpacing:"0.03em",
            whiteSpace:   "nowrap",
            boxShadow:    `0 0 12px ${latestUp ? UP_COL : DN_COL}66`,
          }}>
            {formatPrice(currentPrice)}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}