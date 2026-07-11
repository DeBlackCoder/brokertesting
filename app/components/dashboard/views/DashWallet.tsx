"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPost } from "@/lib/useApi";
import { CardSkeleton, ErrorState } from "../Skeleton";

interface WalletData {
  liveBalance:    number;
  demoBalance:    number;
  depositAddress: string;
  transactions: {
    _id:       string;
    type:      string;
    amount:    number;
    status:    string;
    note?:     string;
    createdAt: string;
  }[];
}

const TX_COLOR: Record<string, string> = {
  deposit:    "#10d48e",
  credit:     "#10d48e",
  demo_topup: "#00bcd4",
  debit:      "#ef4444",
  withdrawal: "#ef4444",
};

const TX_SIGN: Record<string, string> = {
  debit: "-", withdrawal: "-",
};

export default function DashWallet() {
  const { data, loading, error, refetch } = useApi<WalletData>("/api/wallet");

  // Demo top-up
  const [topupAmt,     setTopupAmt]     = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg,     setTopupMsg]     = useState("");

  // Copy address
  const [copied, setCopied] = useState(false);

  // Deposit confirmation modal
  const [showDeposit, setShowDeposit] = useState(false);
  const [depAmt,      setDepAmt]      = useState("");
  const [depHash,     setDepHash]     = useState("");
  const [depNote,     setDepNote]     = useState("");
  const [depLoading,  setDepLoading]  = useState(false);
  const [depMsg,      setDepMsg]      = useState<{ text: string; ok: boolean } | null>(null);

  const handleTopup = async () => {
    if (!topupAmt || isNaN(Number(topupAmt)) || Number(topupAmt) <= 0) return;
    setTopupLoading(true); setTopupMsg("");
    const { data: res, error: err } = await apiPost<{ message: string }>("/api/wallet/fund-demo", { amount: Number(topupAmt) });
    setTopupLoading(false);
    if (err) { setTopupMsg(err); return; }
    setTopupMsg(res?.message ?? "Demo wallet topped up.");
    setTopupAmt("");
    refetch();
  };

  const copyAddress = () => {
    if (!data?.depositAddress) return;
    navigator.clipboard.writeText(data.depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const submitDeposit = async () => {
    if (!depAmt || isNaN(Number(depAmt)) || Number(depAmt) <= 0) {
      setDepMsg({ text: "Enter a valid amount.", ok: false }); return;
    }
    setDepLoading(true); setDepMsg(null);
    const { error: err } = await apiPost("/api/wallet", {
      amount: Number(depAmt),
      txHash: depHash || undefined,
      note:   depNote || undefined,
    });
    setDepLoading(false);
    if (err) { setDepMsg({ text: err, ok: false }); return; }
    setDepMsg({ text: "Deposit submitted. Admin will confirm within 1–24 hours.", ok: true });
    setDepAmt(""); setDepHash(""); setDepNote("");
    refetch();
    setTimeout(() => { setShowDeposit(false); setDepMsg(null); }, 3500);
  };

  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  const inp: React.CSSProperties = {
    background:"rgba(37,45,61,0.3)", border:"1px solid rgba(37,45,61,0.5)",
    borderRadius:4, color:"#f0ede8", padding:"9px 12px", fontSize:"0.82rem",
    outline:"none", width:"100%",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Wallet</h1>
        <p className="text-xs mt-1" style={{ color:"#4a5568" }}>Manage your live and demo trading funds.</p>
      </div>

      {/* ── Balance cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {loading ? <><CardSkeleton/><CardSkeleton/></> : (
          <>
            {/* Live wallet */}
            <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
              className="p-4 md:p-6 relative overflow-hidden"
              style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold tracking-widest uppercase" style={{ color:"#6b7a8d" }}>Live Balance</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background:"rgba(16,212,142,0.1)", color:"#10d48e" }}>$</div>
              </div>
              <div className="text-xl md:text-3xl font-bold tabular-nums mb-1" style={{ color:"#10d48e", letterSpacing:"-0.03em" }}>
                ${(data?.liveBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits:2 })}
              </div>
              <div className="text-xs mb-3" style={{ color:"#4a5568" }}>Available for live trading</div>
              <button onClick={() => setShowDeposit(true)}
                className="text-xs px-3 py-1.5 rounded font-semibold"
                style={{ background:"rgba(16,212,142,0.1)", border:"1px solid rgba(16,212,142,0.3)", color:"#10d48e" }}>
                + Deposit Funds
              </button>
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background:"linear-gradient(90deg,#10d48e,transparent)" }}/>
            </motion.div>

            {/* Demo wallet */}
            <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.07 }}
              className="p-4 md:p-6 relative overflow-hidden"
              style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold tracking-widest uppercase" style={{ color:"#6b7a8d" }}>Demo Balance</div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background:"rgba(0,188,212,0.1)", color:"#00bcd4" }}>◎</div>
              </div>
              <div className="text-xl md:text-3xl font-bold tabular-nums mb-1" style={{ color:"#00bcd4", letterSpacing:"-0.03em" }}>
                ${(data?.demoBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits:2 })}
              </div>
              <div className="text-xs mb-3" style={{ color:"#4a5568" }}>Paper trading funds — add anytime</div>
              <div className="flex gap-2">
                <input type="number" placeholder="Amount" value={topupAmt} onChange={e => setTopupAmt(e.target.value)}
                  className="flex-1 text-sm outline-none"
                  style={{ ...inp, width:"auto" }}
                  onFocus={e => (e.currentTarget.style.borderColor="rgba(0,188,212,0.5)")}
                  onBlur={e  => (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)")}/>
                <button onClick={handleTopup} disabled={topupLoading}
                  className="px-4 py-2 text-xs font-semibold rounded shrink-0"
                  style={{ background:"rgba(0,188,212,0.12)", color:"#00bcd4", border:"1px solid rgba(0,188,212,0.25)" }}>
                  {topupLoading ? "…" : "+ Add"}
                </button>
              </div>
              {topupMsg && (
                <p className="text-xs mt-2" style={{ color: topupMsg.includes("topped") ? "#10d48e" : "#ef4444" }}>
                  {topupMsg}
                </p>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background:"linear-gradient(90deg,#00bcd4,transparent)" }}/>
            </motion.div>
          </>
        )}
      </div>

      {/* ── Deposit address ── */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
        className="p-4 md:p-5"
        style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-bold" style={{ color:"#f0ede8" }}>Deposit Address</h2>
          {data?.depositAddress && (
            <button onClick={() => setShowDeposit(true)}
              className="text-xs px-3 py-1.5 rounded font-semibold"
              style={{ background:"rgba(16,212,142,0.1)", border:"1px solid rgba(16,212,142,0.3)", color:"#10d48e" }}>
              I've Sent Funds →
            </button>
          )}
        </div>
        <p className="text-xs mb-3" style={{ color:"#4a5568" }}>
          Send crypto to the address below, then click <strong style={{ color:"#f0ede8" }}>I've Sent Funds</strong> to notify our team.
        </p>
        {loading ? (
          <div className="h-10 animate-pulse rounded" style={{ background:"rgba(37,45,61,0.3)" }}/>
        ) : !data?.depositAddress ? (
          <div className="flex items-center gap-3 px-3 py-3 rounded" style={{ background:"rgba(37,45,61,0.2)", border:"1px dashed rgba(37,45,61,0.5)" }}>
            <span className="text-lg">⚙️</span>
            <p className="text-xs" style={{ color:"#6b7a8d" }}>Deposit address not configured yet. Contact support.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 px-3 py-2.5 rounded font-mono text-xs break-all"
                style={{ background:"rgba(37,45,61,0.3)", color:"#10d48e", border:"1px solid rgba(37,45,61,0.5)", wordBreak:"break-all" }}>
                {data.depositAddress}
              </div>
              <button onClick={copyAddress}
                className="shrink-0 px-3 py-2.5 text-xs font-semibold rounded"
                style={{ background: copied ? "rgba(16,212,142,0.15)" : "rgba(37,45,61,0.4)", color: copied ? "#10d48e" : "#9fa8b4", border:"1px solid rgba(37,45,61,0.5)" }}>
                {copied ? "✓" : "Copy"}
              </button>
            </div>
            <div className="flex items-start gap-2 px-3 py-2 rounded"
              style={{ background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.15)" }}>
              <span style={{ color:"#c9a84c", fontSize:11, marginTop:1, flexShrink:0 }}>⚠</span>
              <p className="text-xs" style={{ color:"#c9a84c" }}>
                Only send USDT (TRC-20). Other assets may be permanently lost.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Transaction history ── */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.22 }}
        className="p-4 md:p-5"
        style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
        <h2 className="text-sm font-bold mb-3 md:mb-4" style={{ color:"#f0ede8" }}>Transaction History</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({length:4}).map((_,i) => (
              <div key={i} className="h-10 animate-pulse rounded" style={{ background:"rgba(37,45,61,0.3)" }}/>
            ))}
          </div>
        ) : !data?.transactions.length ? (
          <p className="text-sm text-center py-8" style={{ color:"#4a5568" }}>No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(37,45,61,0.4)" }}>
                  {["Date","Type","Amount","Note","Status"].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-medium pr-5 whitespace-nowrap" style={{ color:"#4a5568" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.transactions.map(t => (
                  <tr key={t._id} style={{ borderBottom:"1px solid rgba(37,45,61,0.2)" }}>
                    <td className="py-2.5 pr-5 text-xs" style={{ color:"#6b7a8d" }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 pr-5">
                      <span className="text-xs px-2 py-0.5 rounded capitalize"
                        style={{ background:`${TX_COLOR[t.type] ?? "#6b7a8d"}18`, color: TX_COLOR[t.type] ?? "#6b7a8d" }}>
                        {t.type.replace("_"," ")}
                      </span>
                    </td>
                    <td className="py-2.5 pr-5 font-bold font-mono text-xs"
                      style={{ color: TX_COLOR[t.type] ?? "#9fa8b4" }}>
                      {TX_SIGN[t.type] ?? "+"} ${t.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-5 text-xs" style={{ color:"#6b7a8d", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {t.note ?? "—"}
                    </td>
                    <td className="py-2.5">
                      <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: t.status==="confirmed" ? "rgba(16,212,142,0.1)" : t.status==="pending" ? "rgba(201,168,76,0.1)" : "rgba(239,68,68,0.1)",
                          color:      t.status==="confirmed" ? "#10d48e"              : t.status==="pending" ? "#c9a84c"              : "#ef4444",
                        }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Deposit Confirmation Modal ── */}
      <AnimatePresence>
        {showDeposit && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50"
              style={{ background:"rgba(4,5,7,0.88)", backdropFilter:"blur(8px)" }}
              onClick={() => { setShowDeposit(false); setDepMsg(null); }}/>
            <motion.div
              initial={{ opacity:0, scale:0.95, y:20 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.95 }}
              className="fixed z-50 left-1/2 top-1/2 w-full max-w-md p-7"
              style={{ transform:"translate(-50%,-50%)", background:"rgba(13,15,20,0.99)", border:"1px solid rgba(37,45,61,0.55)", borderRadius:12 }}>

              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold" style={{ color:"#f0ede8" }}>Confirm Your Deposit</h2>
                <button onClick={() => { setShowDeposit(false); setDepMsg(null); }} style={{ color:"#4a5568", fontSize:20, lineHeight:1 }}>×</button>
              </div>
              <p className="text-xs mb-6" style={{ color:"#6b7a8d" }}>
                Tell us the amount you sent. Our team will verify and credit your account within 1–24 hours.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color:"#6b7a8d" }}>Amount Sent (USD) *</label>
                  <input type="number" value={depAmt} onChange={e => setDepAmt(e.target.value)}
                    placeholder="e.g. 500" style={inp}
                    onFocus={e => (e.currentTarget.style.borderColor="rgba(16,212,142,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)")}/>
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color:"#6b7a8d" }}>Transaction Hash <span style={{ color:"#4a5568" }}>(optional but speeds up verification)</span></label>
                  <input type="text" value={depHash} onChange={e => setDepHash(e.target.value)}
                    placeholder="0x..." style={inp}
                    onFocus={e => (e.currentTarget.style.borderColor="rgba(16,212,142,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)")}/>
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color:"#6b7a8d" }}>Note <span style={{ color:"#4a5568" }}>(optional)</span></label>
                  <input type="text" value={depNote} onChange={e => setDepNote(e.target.value)}
                    placeholder="Any notes for admin..." style={inp}
                    onFocus={e => (e.currentTarget.style.borderColor="rgba(16,212,142,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)")}/>
                </div>
              </div>

              {depMsg && (
                <div className="mt-4 px-3 py-2.5 rounded text-xs" style={{
                  background: depMsg.ok ? "rgba(16,212,142,0.08)" : "rgba(239,68,68,0.08)",
                  color:      depMsg.ok ? "#10d48e" : "#ef4444",
                  border:     `1px solid ${depMsg.ok ? "rgba(16,212,142,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}>
                  {depMsg.text}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowDeposit(false); setDepMsg(null); }}
                  className="flex-1 py-2.5 text-sm rounded font-semibold"
                  style={{ border:"1px solid rgba(37,45,61,0.5)", color:"#6b7a8d" }}>
                  Cancel
                </button>
                <button onClick={submitDeposit} disabled={depLoading}
                  className="flex-1 py-2.5 text-sm rounded font-bold"
                  style={{ background: depLoading ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)", color: depLoading ? "#6b7a8d" : "#040507" }}>
                  {depLoading ? "Submitting…" : "Submit Deposit"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
