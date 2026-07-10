"use client";

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

function EquityLine({ curve }: { curve: OverviewData["equityCurve"] }) {
  if (!curve.length) return <div className="h-32 flex items-center justify-center" style={{ color: "#4a5568" }}>No data yet</div>;
  const vals = curve.map(c => c.balance);
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const W = 500, H = 110;
  const pts = vals.map((v, i) => ({ x: (i / (vals.length - 1)) * W, y: H - ((v - min) / range) * (H - 16) - 8 }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fillD = `${pathD} L${W},${H} L0,${H}Z`;

  return (
    <div style={{ width: "100%", height: 140 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 120 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="eq-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10d48e" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#10d48e" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#eq-g)"/>
        <motion.path d={pathD} stroke="#10d48e" strokeWidth="2" fill="none"
          style={{ filter: "drop-shadow(0 0 4px #10d48e88)" }}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}/>
        {pts.filter((_, i) => i % Math.ceil(pts.length / 7) === 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10d48e" style={{ filter: "drop-shadow(0 0 3px #10d48e)" }}/>
        ))}
      </svg>
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

  const STAT_CARDS = [
    { label: "Current Balance",  value: s ? `$${fmt(s.totalBalance)}` : "—", change: "", up: true,  icon: "$",  accent: "#10d48e" },
    { label: "Daily PnL",        value: s ? `${s.dailyPnl >= 0 ? "+" : ""}$${fmt(Math.abs(s.dailyPnl))}` : "—", change: "", up: (s?.dailyPnl ?? 0) >= 0, icon: "↗", accent: (s?.dailyPnl ?? 0) >= 0 ? "#10d48e" : "#ef4444" },
    { label: "Max Drawdown",     value: s ? `$${fmt(s.maxDrawdown)}` : "—", change: "", up: false, icon: "⚡", accent: "#ef4444" },
    { label: "Open Positions",   value: s ? String(s.openPositions) : "—", change: "", up: true,  icon: "◎",  accent: "#00bcd4" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Welcome back 👋</h1>
        <p className="text-xs mt-1" style={{ color: "#4a5568" }}>Here's what's happening with your account today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i}/>)
          : STAT_CARDS.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
              className="p-4 relative overflow-hidden"
              style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(37,45,61,0.5)", color: c.accent }}>{c.icon}</div>
              </div>
              <div className="text-xs mb-1" style={{ color: "#4a5568" }}>{c.label}</div>
              <div className="text-xl font-bold tabular-nums" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>{c.value}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${c.accent}, transparent)` }}/>
            </motion.div>
          ))
        }
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        className="p-5"
        style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#f0ede8" }}>Equity Curve</h2>
        {loading
          ? <div className="h-36 animate-pulse rounded" style={{ background: "rgba(37,45,61,0.3)" }}/>
          : <EquityLine curve={data?.equityCurve ?? []}/>
        }
      </motion.div>

      {/* Recent trades */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
        className="p-5"
        style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#f0ede8" }}>Recent Trades</h2>
        {loading
          ? <TableSkeleton rows={5}/>
          : !data?.recentTrades.length
            ? <p className="text-sm text-center py-8" style={{ color: "#4a5568" }}>No closed trades yet.</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
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
                        <td className="py-2.5 pr-4 font-mono text-xs" style={{ color: "#9fa8b4" }}>{t.volume}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs" style={{ color: "#9fa8b4" }}>{t.openPrice}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs" style={{ color: "#9fa8b4" }}>{t.closePrice}</td>
                        <td className="py-2.5 pr-4 text-xs" style={{ color: "#4a5568" }}>{t.closeTime ? new Date(t.closeTime).toLocaleString() : "—"}</td>
                        <td className="py-2.5 font-bold font-mono text-xs" style={{ color: t.profit >= 0 ? "#10d48e" : "#ef4444" }}>
                          {t.profit >= 0 ? "+" : ""}${fmt(Math.abs(t.profit))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </motion.div>
    </div>
  );
}
