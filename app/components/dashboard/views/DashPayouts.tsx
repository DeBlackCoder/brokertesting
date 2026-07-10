"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApi, apiPost } from "@/lib/useApi";
import { CardSkeleton, ErrorState } from "../Skeleton";

interface Payout {
  _id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  accountNumber?: string;
}
interface PayoutsData {
  payouts: Payout[];
  totalPaid: number;
  totalPending: number;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  paid:         { bg: "rgba(16,212,142,0.12)",  color: "#10d48e" },
  pending:      { bg: "rgba(201,168,76,0.12)",  color: "#c9a84c" },
  under_review: { bg: "rgba(0,188,212,0.12)",   color: "#00bcd4" },
  rejected:     { bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
};

export default function DashPayouts() {
  const { data, loading, error, refetch } = useApi<PayoutsData>("/api/dashboard/payouts");
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount]     = useState("");
  const [method, setMethod]     = useState("Bank Transfer");
  const [methodDetails, setMethodDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");

  const handleRequest = async () => {
    if (!amount || isNaN(Number(amount))) { setFormError("Enter a valid amount"); return; }
    setSubmitting(true); setFormError("");
    const { error: err } = await apiPost("/api/dashboard/payouts", { amount: Number(amount), method, methodDetails });
    setSubmitting(false);
    if (err) { setFormError(err); return; }
    setShowForm(false); setAmount(""); setMethodDetails("");
    refetch();
  };

  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  const inputStyle: React.CSSProperties = {
    background: "rgba(37,45,61,0.2)", border: "1px solid rgba(37,45,61,0.5)",
    borderRadius: 4, color: "#f0ede8", padding: "10px 12px", fontSize: "0.8rem", outline: "none", width: "100%",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Payouts</h1>
          <p className="text-xs mt-1" style={{ color: "#4a5568" }}>Your payout history and upcoming payments.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="px-4 py-2 text-sm font-semibold rounded"
          style={{ background: "rgba(16,212,142,0.1)", border: "1px solid rgba(16,212,142,0.3)", color: "#10d48e" }}>
          {showForm ? "Cancel" : "Request Payout"}
        </button>
      </div>

      {/* Request form */}
      {showForm && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="p-5" style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(16,212,142,0.2)", borderRadius: 8 }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#f0ede8" }}>New Payout Request</h2>
          {formError && <div className="mb-3 text-xs px-3 py-2 rounded" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>{formError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6b7a8d" }}>Amount (USD) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" style={inputStyle}/>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6b7a8d" }}>Method *</label>
              <select value={method} onChange={e => setMethod(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                {["Bank Transfer","Crypto (USDT)","Crypto (USDC)","PayPal"].map(m => <option key={m} style={{ background: "#0e1118" }}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#6b7a8d" }}>Details (optional)</label>
              <input type="text" value={methodDetails} onChange={e => setMethodDetails(e.target.value)} placeholder="Wallet address / Account number" style={inputStyle}/>
            </div>
          </div>
          <button onClick={handleRequest} disabled={submitting}
            className="px-6 py-2 text-sm font-semibold rounded"
            style={{ background: submitting ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)", color: submitting ? "#6b7a8d" : "#040507" }}>
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </motion.div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i}/>)
          : [
              { label: "Total Paid Out",  value: `$${(data?.totalPaid ?? 0).toLocaleString()}`,    color: "#10d48e" },
              { label: "Pending",         value: `$${(data?.totalPending ?? 0).toLocaleString()}`,  color: "#c9a84c" },
              { label: "Payout Count",    value: String(data?.payouts.filter(p => p.status === "paid").length ?? 0), color: "#f0ede8" },
            ].map((c, i) => (
              <motion.div key={c.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
                className="p-5" style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
                <div className="text-xs mb-2" style={{ color: "#4a5568" }}>{c.label}</div>
                <div className="text-2xl font-bold" style={{ color: c.color, letterSpacing: "-0.02em" }}>{c.value}</div>
              </motion.div>
            ))
        }
      </div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
        className="p-5" style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8 }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#f0ede8" }}>Payout History</h2>
        {loading
          ? <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="h-10 animate-pulse rounded" style={{background:"rgba(37,45,61,0.3)"}}/>)}</div>
          : !data?.payouts.length
            ? <p className="text-sm text-center py-8" style={{ color: "#4a5568" }}>No payouts yet.</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(37,45,61,0.4)" }}>
                      {["Date","Account","Amount","Method","Status"].map(h => (
                        <th key={h} className="pb-3 text-left font-medium text-xs pr-5" style={{ color: "#4a5568" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.payouts.map((p) => {
                      const s = STATUS_STYLES[p.status] ?? STATUS_STYLES.pending;
                      return (
                        <tr key={p._id} style={{ borderBottom: "1px solid rgba(37,45,61,0.2)" }}>
                          <td className="py-3 pr-5 text-xs" style={{ color: "#6b7a8d" }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 pr-5 text-xs font-mono" style={{ color: "#9fa8b4" }}>{p.accountNumber ?? "—"}</td>
                          <td className="py-3 pr-5 font-bold text-xs" style={{ color: "#10d48e" }}>${p.amount.toLocaleString()}</td>
                          <td className="py-3 pr-5 text-xs" style={{ color: "#9fa8b4" }}>{p.method}</td>
                          <td className="py-3">
                            <span className="text-xs px-2 py-0.5 rounded font-semibold capitalize" style={{ background: s.bg, color: s.color }}>
                              {p.status.replace("_"," ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
        }
      </motion.div>
    </div>
  );
}
