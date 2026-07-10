"use client";

import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { CardSkeleton, ErrorState } from "../Skeleton";

interface TradingAccount {
  _id: string;
  accountNumber: string;
  plan: string;
  status: string;
  phase: string;
  balance: number;
  equity: number;
  startBalance: number;
  profitTarget: number;
  maxOverallLoss: number;
  currentDrawdown: number;
  tradingDays: number;
  minTradingDays: number;
}

const STATUS_COLOR: Record<string, string> = {
  active:   "#10d48e",
  passed:   "#10d48e",
  funded:   "#10d48e",
  inactive: "#6b7a8d",
  failed:   "#ef4444",
  breached: "#ef4444",
};

function AccountCard({ a, i }: { a: TradingAccount; i: number }) {
  const color = STATUS_COLOR[a.status] ?? "#6b7a8d";
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}
      className="p-4 relative"
      style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold font-mono" style={{ color: "#f0ede8", fontSize: 15 }}>{a.accountNumber}</div>
          <div className="text-xs mt-0.5" style={{ color: "#4a5568" }}>{a.plan}</div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded font-bold capitalize"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
          {a.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[["Balance", `$${a.balance.toLocaleString()}`], ["Equity", `$${a.equity.toLocaleString()}`]].map(([l, v]) => (
          <div key={l} className="p-2 rounded" style={{ background: "rgba(37,45,61,0.25)" }}>
            <div className="text-xs mb-0.5" style={{ color: "#4a5568" }}>{l}</div>
            <div className="font-semibold text-sm" style={{ color: "#f0ede8" }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs">
        <div><span style={{ color: "#4a5568" }}>Target </span><span style={{ color: "#f0ede8", fontWeight: 600 }}>${a.profitTarget.toLocaleString()}</span></div>
        <div><span style={{ color: "#4a5568" }}>Phase </span><span style={{ color: "#f0ede8", fontWeight: 600 }}>{a.phase}</span></div>
        <div><span style={{ color: "#4a5568" }}>Max DD </span><span style={{ color: "#ef4444", fontWeight: 600 }}>${a.maxOverallLoss.toLocaleString()}</span></div>
      </div>

      {/* Drawdown bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-xs" style={{ color: "#4a5568" }}>Drawdown</span>
          <span className="text-xs" style={{ color: "#ef4444" }}>{((a.currentDrawdown / a.startBalance) * 100).toFixed(1)}%</span>
        </div>
        <div className="h-1 rounded-full" style={{ background: "rgba(37,45,61,0.5)" }}>
          <motion.div className="h-full rounded-full"
            style={{ background: "#ef4444", maxWidth: "100%" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((a.currentDrawdown / a.startBalance) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}/>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-2 text-xs font-semibold rounded"
          style={{ border: "1px solid rgba(37,45,61,0.5)", color: "#9fa8b4" }}>
          Credentials
        </button>
        <button className="flex-1 py-2 text-xs font-semibold rounded"
          style={{ border: "1px solid rgba(16,212,142,0.3)", color: "#10d48e", background: "rgba(16,212,142,0.07)" }}>
          Dashboard
        </button>
      </div>
    </motion.div>
  );
}

export default function DashMyAccount() {
  const { data: accounts, loading, error, refetch } = useApi<TradingAccount[]>("/api/dashboard/accounts");

  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>My Account</h1>
          <p className="text-xs mt-1" style={{ color: "#4a5568" }}>Manage your active challenges and funded accounts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded"
          style={{ background: "rgba(16,212,142,0.1)", border: "1px solid rgba(16,212,142,0.3)", color: "#10d48e" }}>
          + New Challenge
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i}/>)
          : !accounts?.length
            ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-24"
                style={{ border: "1px dashed rgba(37,45,61,0.4)", borderRadius: 8 }}>
                <div className="text-3xl mb-3" style={{ color: "#252d3d" }}>◎</div>
                <p className="text-sm mb-4" style={{ color: "#4a5568" }}>No trading accounts yet.</p>
                <button className="px-5 py-2 text-sm font-semibold rounded"
                  style={{ background: "rgba(16,212,142,0.1)", border: "1px solid rgba(16,212,142,0.3)", color: "#10d48e" }}>
                  Start a Challenge
                </button>
              </div>
            )
            : accounts.map((a, i) => <AccountCard key={a._id} a={a} i={i}/>)
        }
      </div>
    </div>
  );
}
