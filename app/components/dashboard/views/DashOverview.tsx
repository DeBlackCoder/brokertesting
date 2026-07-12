"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { CardSkeleton, TableSkeleton, ErrorState } from "../Skeleton";

interface OverviewData {
  summary: {
    totalBalance: number;
    totalEquity: number;
    dailyPnl: number;
    maxDrawdown: number;
    openPositions: number;
  };
  equityCurve: { date: string; balance: number; equity: number; dailyPnl: number }[];
  recentTrades: {
    symbol: string; type: string; volume: number;
    openPrice: number; closePrice: number; closeTime: string;
    profit: number; accountNumber: string;
  }[];
  accountCount: number;
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* ── Icon set — same stroke language used across the rest of the app,
     replacing the mix of "$"/"↗"/emoji glyphs that used to sit here ── */
function DollarIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  );
}
function TrendUpIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l3.5-4 2.5 2.5L13 4"/><path d="M9.5 4H13v3.5"/>
    </svg>
  );
}
function AlertTriangleIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L14.5 13.5H1.5L8 2z"/><path d="M8 6.7v3"/><path d="M8 11.6h.01"/>
    </svg>
  );
}
function LayersIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  );
}

function EquityLine({ curve }: { curve: OverviewData["equityCurve"] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (!curve.length) return <div className="h-32 flex items-center justify-center" style={{ color: "#4a5568" }}>No data yet</div>;

  const balVals = curve.map(c => c.balance);
  const eqVals  = curve.map(c => c.equity);
  const allVals = [...balVals, ...eqVals];
  const max = Math.max(...allVals), min = Math.min(...allVals);
  const range = max - min || 1;
  const W = 500, H = 110;

  const toPts = (vals: number[]) => vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 16) - 8,
  }));
  const balPts = toPts(balVals);
  const eqPts  = toPts(eqVals);
  const pathOf = (pts: { x:number; y:number }[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const balPathD = pathOf(balPts);
  const eqPathD  = pathOf(eqPts);
  const fillD    = `${balPathD} L${W},${H} L0,${H}Z`;

  const handleMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const idx  = Math.round(relX * (curve.length - 1));
    setHover(Math.min(Math.max(idx, 0), curve.length - 1));
  };

  const hp = hover !== null ? curve[hover] : null;
  const hoverXPct = hover !== null ? (balPts[hover].x / W) * 100 : 0;
  const tooltipLeftPct = Math.min(Math.max(hoverXPct, 14), 86);

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <span style={{ width:10, height:2, background:"#10d48e", display:"inline-block", borderRadius:1 }}/>
          <span className="text-xs" style={{ color:"#6b7a8d" }}>Balance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ width:10, height:0, borderTop:"2px dashed #00bcd4", display:"inline-block" }}/>
          <span className="text-xs" style={{ color:"#6b7a8d" }}>Equity</span>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ width: "100%", height: 140, position: "relative" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 120 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="eq-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10d48e" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#10d48e" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={fillD} fill="url(#eq-g)"/>

          {/* Equity — secondary reference line: dashed, cooler color, drawn
              first so the balance line sits visually on top of it */}
          <motion.path d={eqPathD} stroke="#00bcd4" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity={0.75}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}/>

          <motion.path d={balPathD} stroke="#10d48e" strokeWidth="2" fill="none"
            style={{ filter: "drop-shadow(0 0 4px #10d48e88)" }}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}/>

          {balPts.filter((_, i) => i % Math.ceil(balPts.length / 7) === 0).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10d48e" style={{ filter: "drop-shadow(0 0 3px #10d48e)" }}/>
          ))}

          {/* Crosshair */}
          {hover !== null && (
            <>
              <line x1={balPts[hover].x} x2={balPts[hover].x} y1={0} y2={H}
                stroke="rgba(159,168,180,0.35)" strokeWidth="1" strokeDasharray="3 3"/>
              <circle cx={balPts[hover].x} cy={balPts[hover].y} r="4" fill="#10d48e" stroke="#0e1118" strokeWidth="1.5"/>
              <circle cx={eqPts[hover].x} cy={eqPts[hover].y} r="3.5" fill="#00bcd4" stroke="#0e1118" strokeWidth="1.5"/>
            </>
          )}
        </svg>

        {/* Tooltip */}
        {hp && (
          <div
            style={{
              position: "absolute", top: 0, left: `${tooltipLeftPct}%`, transform: "translateX(-50%)",
              background: "rgba(10,12,17,0.97)", border: "1px solid rgba(37,45,61,0.6)",
              borderRadius: 6, padding: "6px 10px", pointerEvents: "none", whiteSpace: "nowrap",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <div className="text-xs font-semibold mb-1" style={{ color:"#f0ede8" }}>
              {new Date(hp.date).toLocaleDateString("en-US", { month:"short", day:"numeric" })}
            </div>
            <div className="text-xs tabular-nums" style={{ color:"#10d48e" }}>Bal ${fmt(hp.balance)}</div>
            <div className="text-xs tabular-nums" style={{ color:"#00bcd4" }}>Eq ${fmt(hp.equity)}</div>
            <div className="text-xs tabular-nums" style={{ color: hp.dailyPnl >= 0 ? "#10d48e" : "#ef4444" }}>
              {hp.dailyPnl >= 0 ? "+" : ""}${fmt(Math.abs(hp.dailyPnl))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between px-1">
        {curve.filter((_, i) => i % Math.ceil(curve.length / 7) === 0).map((c, i) => (
          <span key={i} className="text-xs" style={{ color: "#4a5568", fontSize: 9 }}>
            {new Date(c.date).toLocaleDateString("en-US", { weekday: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DashOverview() {
  const { data, loading, error, refetch } = useApi<OverviewData>("/api/dashboard/overview");

  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  const s = data?.summary;
  const curve = data?.equityCurve ?? [];

  // Real deltas instead of the previously-unused/blank "change" field
  const balanceChangePct = curve.length >= 2 && curve[curve.length-2].balance > 0
    ? ((curve[curve.length-1].balance - curve[curve.length-2].balance) / curve[curve.length-2].balance) * 100
    : null;
  const dailyPnlPct = s && s.totalBalance > 0 ? (s.dailyPnl / s.totalBalance) * 100 : null;
  const drawdownPct = s && s.totalBalance > 0 ? (s.maxDrawdown / s.totalBalance) * 100 : null;

  const STAT_CARDS = [
    {
      label: "Current Balance", value: s ? `$${fmt(s.totalBalance)}` : "—", accent: "#10d48e",
      icon: <DollarIcon/>,
      sub: balanceChangePct !== null
        ? <span style={{ color: balanceChangePct >= 0 ? "#10d48e" : "#ef4444" }}>{balanceChangePct >= 0 ? "+" : ""}{balanceChangePct.toFixed(2)}% today</span>
        : null,
    },
    {
      label: "Daily PnL", value: s ? `${s.dailyPnl >= 0 ? "+" : ""}$${fmt(Math.abs(s.dailyPnl))}` : "—",
      accent: (s?.dailyPnl ?? 0) >= 0 ? "#10d48e" : "#ef4444",
      icon: <TrendUpIcon/>,
      sub: dailyPnlPct !== null
        ? <span style={{ color: dailyPnlPct >= 0 ? "#10d48e" : "#ef4444" }}>{dailyPnlPct >= 0 ? "+" : ""}{dailyPnlPct.toFixed(2)}% of balance</span>
        : null,
    },
    {
      label: "Max Drawdown", value: s ? `$${fmt(s.maxDrawdown)}` : "—", accent: "#ef4444",
      icon: <AlertTriangleIcon/>,
      sub: drawdownPct !== null ? <span style={{ color:"#8a94a3" }}>{drawdownPct.toFixed(2)}% of balance</span> : null,
    },
    {
      label: "Open Positions", value: s ? String(s.openPositions) : "—", accent: "#00bcd4",
      icon: <LayersIcon/>,
      sub: data?.accountCount ? <span style={{ color:"#8a94a3" }}>across {data.accountCount} account{data.accountCount !== 1 ? "s" : ""}</span> : null,
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Welcome back</h1>
        <p className="text-xs mt-1" style={{ color: "#4a5568" }}>Here's what's happening with your account today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i}/>)
          : STAT_CARDS.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
              className="p-3 md:p-4 relative overflow-hidden"
              style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(37,45,61,0.5)", color: c.accent }}>{c.icon}</div>
              </div>
              <div className="text-xs mb-1" style={{ color: "#4a5568" }}>{c.label}</div>
              <div className="text-base md:text-xl font-bold tabular-nums" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>{c.value}</div>
              {c.sub && <div className="text-xs mt-1 tabular-nums">{c.sub}</div>}
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }}/>
            </motion.div>
          ))
        }
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        className="p-3 md:p-5"
        style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
        <h2 className="text-sm font-bold mb-3 md:mb-4" style={{ color: "#f0ede8" }}>Equity Curve</h2>
        {loading
          ? <div className="h-36 animate-pulse rounded" style={{ background: "rgba(37,45,61,0.3)" }}/>
          : <EquityLine curve={curve}/>
        }
      </motion.div>

      {/* Recent trades */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
        className="p-4 md:p-5"
        style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#f0ede8" }}>Recent Trades</h2>
        {loading
          ? <TableSkeleton rows={5}/>
          : !data?.recentTrades.length
            ? <p className="text-sm text-center py-8" style={{ color: "#4a5568" }}>No closed trades yet.</p>
            : (
              <>
                {/* Mobile: card list — a 540px-wide table forces horizontal
                    scroll on every phone, so small screens get stacked cards. */}
                <div className="sm:hidden space-y-2">
                  {data.recentTrades.map((t, i) => (
                    <div key={i} className="p-3 rounded-lg" style={{ background:"rgba(37,45,61,0.15)", border:"1px solid rgba(37,45,61,0.3)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-xs" style={{ color:"#f0ede8" }}>{t.symbol}</span>
                          <span className="text-xs font-semibold capitalize px-1.5 py-0.5 rounded"
                            style={{ background: `${t.type === "buy" ? "#10d48e" : "#ef4444"}18`, color: t.type === "buy" ? "#10d48e" : "#ef4444" }}>
                            {t.type}
                          </span>
                        </div>
                        <span className="font-bold font-mono text-sm tabular-nums" style={{ color: t.profit >= 0 ? "#10d48e" : "#ef4444" }}>
                          {t.profit >= 0 ? "+" : ""}${fmt(Math.abs(t.profit))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs tabular-nums" style={{ color:"#6b7a8d" }}>
                        <span>{t.openPrice} → {t.closePrice}</span>
                        <span>{t.volume} lot{t.volume !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="text-xs mt-1.5 pt-1.5" style={{ color:"#4a5568", borderTop:"1px solid rgba(37,45,61,0.3)" }}>
                        {t.closeTime ? new Date(t.closeTime).toLocaleString() : "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop / tablet: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: 540 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(37,45,61,0.4)" }}>
                        {["Symbol","Type","Volume","Open","Close","Time","Profit"].map(h => (
                          <th key={h} className="pb-3 text-left font-medium text-xs pr-4 whitespace-nowrap" style={{ color: "#4a5568" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentTrades.map((t, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(37,45,61,0.2)" }}>
                          <td className="py-2.5 pr-4 font-semibold font-mono text-xs" style={{ color: "#f0ede8" }}>{t.symbol}</td>
                          <td className="py-2.5 pr-4 font-semibold text-xs capitalize" style={{ color: t.type === "buy" ? "#10d48e" : "#ef4444" }}>{t.type.charAt(0).toUpperCase()+t.type.slice(1)}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs tabular-nums" style={{ color: "#9fa8b4" }}>{t.volume}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs tabular-nums" style={{ color: "#9fa8b4" }}>{t.openPrice}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs tabular-nums" style={{ color: "#9fa8b4" }}>{t.closePrice}</td>
                          <td className="py-2.5 pr-4 text-xs" style={{ color: "#4a5568" }}>{t.closeTime ? new Date(t.closeTime).toLocaleString() : "—"}</td>
                          <td className="py-2.5 font-bold font-mono text-xs tabular-nums" style={{ color: t.profit >= 0 ? "#10d48e" : "#ef4444" }}>
                            {t.profit >= 0 ? "+" : ""}${fmt(Math.abs(t.profit))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
        }
      </motion.div>
    </div>
  );
}