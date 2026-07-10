"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { CardSkeleton, ErrorState } from "../Skeleton";

interface PerfData {
  stats: {
    totalTrades: number; wins: number; losses: number;
    winRate: number; profitFactor: number; avgRR: number;
    avgWin: number; avgLoss: number; bestTrade: number; worstTrade: number;
    expectancy: number; totalCommission: number;
    longsWon: number; longsTotal: number; shortsWon: number; shortsTotal: number;
    totalVolume: number; tradesPerDay: number | null;
  };
  dailyPnl: { date: string; pnl: number; balance: number }[];
}

function WinLossDonut({ win }: { win: number }) {
  const r = 48, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  const winArc = (win / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(37,45,61,0.5)" strokeWidth={12}/>
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#10d48e" strokeWidth={12}
          strokeDasharray={`${winArc} ${circ - winArc}`}
          style={{ transformOrigin: `${cx}px ${cy}px`, transform: "rotate(-90deg)", filter: "drop-shadow(0 0 5px #10d48e66)" }}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${winArc} ${circ - winArc}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}/>
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#f0ede8" fontSize="18" fontWeight="700">{win}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#4a5568" fontSize="9">Win rate</text>
      </svg>
      <div className="flex gap-4 mt-1">
        {[["Win","#10d48e"],["Loss","rgba(37,45,61,0.8)"]].map(([l,c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: c }}/>
            <span className="text-xs" style={{ color: "#6b7a8d" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyPnlChart({ data }: { data: PerfData["dailyPnl"] }) {
  if (!data.length) return <div className="h-32 flex items-center justify-center text-sm" style={{ color: "#4a5568" }}>No data</div>;
  const vals = data.map(d => d.pnl);
  const max  = Math.max(...vals.map(Math.abs), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140, padding: "0 2px" }}>
      {data.map((d, i) => {
        const h    = (Math.abs(d.pnl) / max) * 120 + 4;
        const up   = d.pnl >= 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5" style={{ minWidth: 6 }}>
            <motion.div style={{
              height: h, width: "100%", borderRadius: "3px 3px 0 0",
              background: up ? "linear-gradient(180deg,#10d48e,rgba(16,212,142,0.3))" : "linear-gradient(180deg,#ef4444,rgba(239,68,68,0.3))",
              boxShadow: up ? "0 0 6px rgba(16,212,142,0.3)" : "0 0 6px rgba(239,68,68,0.2)",
            }}
              initial={{ height: 0 }} animate={{ height: h }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: "easeOut" }}/>
            <span style={{ color: "#4a5568", fontSize: 8 }}>
              {new Date(d.date).getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashPerformance() {
  const [period, setPeriod] = useState<"week"|"month"|"all">("week");
  const { data, loading, error, refetch } = useApi<PerfData>(`/api/dashboard/performance?period=${period}`, [period]);

  if (error) return <ErrorState message={error} onRetry={refetch}/>;
  const st = data?.stats;

  const CARDS = [
    { label: "Win Rate",      value: st ? `${st.winRate}%`          : "—", badge: st?.winRate ? (st.winRate > 60 ? "Top 15%" : "Active") : "—" },
    { label: "Avg R:R",       value: st ? `1:${st.avgRR}`           : "—", badge: st?.avgRR ? (st.avgRR >= 2 ? "Excellent" : "Good") : "—" },
    { label: "Profit Factor", value: st ? String(st.profitFactor)   : "—", badge: st?.profitFactor ? (st.profitFactor >= 1.5 ? "Healthy" : "Active") : "—" },
    { label: "Total Trades",  value: st ? String(st.totalTrades)    : "—", badge: st?.tradesPerDay ? `${st.tradesPerDay}/day` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Performance Analytics</h1>
          <p className="text-xs mt-1" style={{ color: "#4a5568" }}>Deep dive into your trading metrics and habits.</p>
        </div>
        <div className="flex gap-1">
          {(["week","month","all"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className="text-xs px-3 py-1.5 rounded capitalize font-medium"
              style={{ background: period===p ? "rgba(16,212,142,0.12)" : "rgba(37,45,61,0.3)", color: period===p ? "#10d48e" : "#6b7a8d", border: period===p ? "1px solid rgba(16,212,142,0.3)" : "1px solid transparent" }}>
              {p === "all" ? "All time" : p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({length:4}).map((_,i) => <CardSkeleton key={i}/>) : CARDS.map((c,i) => (
          <motion.div key={c.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
            className="p-4 relative overflow-hidden"
            style={{background:"rgba(14,17,24,0.8)",border:"1px solid rgba(37,45,61,0.45)",borderRadius:8}}>
            <div className="text-xl md:text-2xl font-bold mb-1" style={{color:"#f0ede8",letterSpacing:"-0.02em"}}>{c.value}</div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{color:"#4a5568"}}>{c.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{background:"rgba(16,212,142,0.12)",color:"#10d48e"}}>{c.badge}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{background:"linear-gradient(90deg,#10d48e,transparent)"}}/>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
          className="lg:col-span-2 p-5"
          style={{background:"rgba(14,17,24,0.8)",border:"1px solid rgba(37,45,61,0.45)",borderRadius:8}}>
          <h2 className="text-sm font-bold mb-4" style={{color:"#f0ede8"}}>Daily PnL</h2>
          {loading ? <div className="h-36 animate-pulse rounded" style={{background:"rgba(37,45,61,0.3)"}}/> : <DailyPnlChart data={data?.dailyPnl ?? []}/>}
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.38}}
          className="p-5 flex flex-col items-center justify-center"
          style={{background:"rgba(14,17,24,0.8)",border:"1px solid rgba(37,45,61,0.45)",borderRadius:8}}>
          <h2 className="text-sm font-bold mb-4 self-start" style={{color:"#f0ede8"}}>Win/Loss Ratio</h2>
          {loading ? <div className="w-24 h-24 rounded-full animate-pulse" style={{background:"rgba(37,45,61,0.3)"}}/> : <WinLossDonut win={st?.winRate ?? 0}/>}
        </motion.div>
      </div>

      {/* Detailed stats */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45}}
        className="p-5"
        style={{background:"rgba(14,17,24,0.8)",border:"1px solid rgba(37,45,61,0.45)",borderRadius:8}}>
        <h2 className="text-sm font-bold mb-4" style={{color:"#f0ede8"}}>Detailed Statistics</h2>
        {loading
          ? <div className="h-12 animate-pulse rounded" style={{background:"rgba(37,45,61,0.3)"}}/>
          : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-4">
              {[
                {l:"Average Win",    v:`$${(st?.avgWin??0).toFixed(2)}`,    c:"#10d48e"},
                {l:"Average Loss",   v:`$${(st?.avgLoss??0).toFixed(2)}`,   c:"#ef4444"},
                {l:"Best Trade",     v:`$${(st?.bestTrade??0).toFixed(2)}`, c:"#10d48e"},
                {l:"Longs Won",      v:`${st?.longsWon??0} (${st?.longsTotal ? Math.round((st.longsWon/st.longsTotal)*100) : 0}%)`, c:"#f0ede8"},
                {l:"Shorts Won",     v:`${st?.shortsWon??0} (${st?.shortsTotal ? Math.round((st.shortsWon/st.shortsTotal)*100) : 0}%)`, c:"#f0ede8"},
                {l:"Lots Traded",    v:(st?.totalVolume??0).toFixed(2),     c:"#f0ede8"},
                {l:"Commissions",    v:`$${(st?.totalCommission??0).toFixed(2)}`, c:"#f0ede8"},
                {l:"Expectancy",     v:`$${(st?.expectancy??0).toFixed(2)}`, c:"#10d48e"},
                {l:"Total Trades",   v:String(st?.totalTrades??0),          c:"#f0ede8"},
              ].map(s => (
                <div key={s.l}>
                  <div className="text-xs mb-1" style={{color:"#4a5568"}}>{s.l}</div>
                  <div className="text-sm font-bold" style={{color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
          )
        }
      </motion.div>
    </div>
  );
}
