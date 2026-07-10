"use client";

import { motion } from "framer-motion";
import { useApi } from "@/lib/useApi";
import { CardSkeleton, ErrorState } from "../Skeleton";

interface StatsData {
  users:        { total: number; verified: number; pendingKyc: number; approvedKyc: number; newLast30Days: number };
  applications: { total: number; pending: number; byStatus: { _id: string; count: number }[] };
  accounts:     { total: number; active: number };
  trades:       { total: number; open: number };
  payouts:      { pending: number; totalPaidOut: number };
  wallets?:     { totalLive: number; totalDemo: number; pendingDeposits: number; pendingDepositsTotal: number };
}

export default function AdminStats() {
  const { data, loading, error, refetch } = useApi<StatsData>("/api/admin/stats");
  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  const CARDS = [
    { label: "Total Users",        value: data?.users.total            ?? "—", sub: `+${data?.users.newLast30Days ?? 0} last 30 days`,        color: "#10d48e" },
    { label: "Email Verified",     value: data?.users.verified         ?? "—", sub: "Confirmed accounts",                                     color: "#10d48e" },
    { label: "Pending KYC",        value: data?.users.pendingKyc       ?? "—", sub: "Awaiting review",                                        color: "#c9a84c" },
    { label: "KYC Approved",       value: data?.users.approvedKyc      ?? "—", sub: "Active traders",                                         color: "#10d48e" },
    { label: "Applications",       value: data?.applications.total     ?? "—", sub: `${data?.applications.pending ?? 0} pending`,             color: "#00bcd4" },
    { label: "Trading Accounts",   value: data?.accounts.total         ?? "—", sub: `${data?.accounts.active ?? 0} active`,                   color: "#10d48e" },
    { label: "Total Trades",       value: data?.trades.total           ?? "—", sub: `${data?.trades.open ?? 0} open`,                         color: "#9b59b6" },
    { label: "Total Paid Out",     value: data ? `$${data.payouts.totalPaidOut.toLocaleString()}` : "—", sub: `${data?.payouts.pending ?? 0} pending`, color: "#c9a84c" },
    { label: "Total Live Funds",   value: data?.wallets ? `$${Math.round(data.wallets.totalLive).toLocaleString()}` : "—", sub: "Across all live wallets", color: "#10d48e" },
    { label: "Total Demo Funds",   value: data?.wallets ? `$${Math.round(data.wallets.totalDemo).toLocaleString()}` : "—", sub: "Across all demo wallets", color: "#00bcd4" },
    { label: "Pending Deposits",   value: data?.wallets?.pendingDeposits  ?? "—", sub: data?.wallets ? `$${data.wallets.pendingDepositsTotal.toLocaleString()} total` : "Awaiting confirmation", color: "#c9a84c" },
    { label: "New Users (30d)",    value: data?.users.newLast30Days    ?? "—", sub: "Registrations this month",                               color: "#9b59b6" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Platform Statistics</h1>
        <p className="text-xs mt-1" style={{ color: "#4a5568" }}>Real-time overview across all users and accounts.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i}/>)
          : CARDS.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}
              className="p-4 relative overflow-hidden"
              style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
              <div className="text-xs mb-1.5" style={{ color: "#4a5568" }}>{c.label}</div>
              <div className="text-xl md:text-2xl font-bold tabular-nums mb-1" style={{ color: c.color, letterSpacing: "-0.02em" }}>{c.value}</div>
              <div className="text-xs" style={{ color: "#4a5568" }}>{c.sub}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${c.color},transparent)` }}/>
            </motion.div>
          ))
        }
      </div>

      {/* Application breakdown */}
      {!loading && data?.applications.byStatus.length ? (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          className="p-5" style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#f0ede8" }}>Applications by Status</h2>
          <div className="flex flex-wrap gap-4">
            {data.applications.byStatus.map(s => (
              <div key={s._id} className="px-4 py-3 rounded" style={{ background: "rgba(37,45,61,0.3)" }}>
                <div className="text-xs capitalize mb-1" style={{ color: "#6b7a8d" }}>{s._id.replace("_"," ")}</div>
                <div className="text-xl font-bold" style={{ color: "#f0ede8" }}>{s.count}</div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
