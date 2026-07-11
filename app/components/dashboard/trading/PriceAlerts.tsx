"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPost } from "@/lib/useApi";
import { INSTRUMENTS, formatPrice } from "./instruments";
import { ToastType } from "./useToast";

interface Alert {
  _id:       string;
  symbol:    string;
  base:      string;
  price:     number;
  direction: "above" | "below";
  status:    "active" | "triggered" | "cancelled";
  note?:     string;
  createdAt: string;
}

interface Props {
  prices:  Record<string, number>;   // live prices map base→price
  onToast: (type: ToastType, title: string, msg: string) => void;
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  active:    { color:"#10d48e",  bg:"rgba(16,212,142,0.1)"  },
  triggered: { color:"#c9a84c",  bg:"rgba(201,168,76,0.1)"  },
  cancelled: { color:"#6b7a8d",  bg:"rgba(37,45,61,0.3)"    },
};

export default function PriceAlerts({ prices, onToast }: Props) {
  const { data: alerts, refetch } = useApi<Alert[]>("/api/alerts");
  const [open,      setOpen]      = useState(false);
  const [base,      setBase]      = useState("BTC");
  const [price,     setPrice]     = useState("");
  const [dir,       setDir]       = useState<"above"|"below">("above");
  const [note,      setNote]      = useState("");
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState("");

  // Track already-fired alerts to avoid duplicate toasts
  const firedRef = useRef<Set<string>>(new Set());

  // Check price against active alerts on every tick
  useEffect(() => {
    if (!alerts) return;
    alerts.forEach(a => {
      if (a.status !== "active") return;
      if (firedRef.current.has(a._id)) return;
      const current = prices[a.base];
      if (!current) return;
      const hit = a.direction === "above" ? current >= a.price : current <= a.price;
      if (!hit) return;

      firedRef.current.add(a._id);
      onToast(
        "alert",
        `Price Alert: ${a.symbol}`,
        `${a.symbol} is ${a.direction} ${formatPrice(a.price)}${a.note ? ` · ${a.note}` : ""}`,
      );

      // Mark triggered on server
      const token = localStorage.getItem("aurex_token") ?? "";
      fetch("/api/notifications", {
        method:  "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:    JSON.stringify({ action:"mark_all_read" }),
      }).catch(() => {});

      refetch();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  const addAlert = async () => {
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setFormErr("Enter a valid price."); return;
    }
    setSaving(true); setFormErr("");
    const inst = INSTRUMENTS.find(i => i.base === base)!;
    const { error } = await apiPost("/api/alerts", {
      symbol: inst.symbol, base, price: Number(price), direction: dir, note,
    });
    setSaving(false);
    if (error) { setFormErr(error); return; }
    setPrice(""); setNote("");
    refetch();
  };

  const cancel = async (id: string) => {
    const token = localStorage.getItem("aurex_token") ?? "";
    await fetch(`/api/alerts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    refetch();
  };

  const activeAlerts = (alerts ?? []).filter(a => a.status === "active");
  const pastAlerts   = (alerts ?? []).filter(a => a.status !== "active").slice(0, 10);

  const inp: React.CSSProperties = {
    background:"rgba(37,45,61,0.3)", border:"1px solid rgba(37,45,61,0.5)",
    borderRadius:4, color:"#f0ede8", padding:"7px 10px", fontSize:"0.78rem",
    outline:"none", width:"100%",
  };

  return (
    <div style={{ background:"rgba(14,17,24,0.85)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8, overflow:"hidden" }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3"
        style={{ borderBottom: open ? "1px solid rgba(37,45,61,0.4)" : "none" }}>
        <div className="flex items-center gap-2.5">
          <span className="text-base">⚡</span>
          <span className="text-sm font-bold" style={{ color:"#f0ede8" }}>Price Alerts</span>
          {activeAlerts.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background:"rgba(201,168,76,0.15)", color:"#c9a84c" }}>
              {activeAlerts.length} active
            </span>
          )}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration:0.2 }}
          style={{ color:"#4a5568", fontSize:12 }}>▼</motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height:0, opacity:0 }}
            animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }}
            transition={{ duration:0.22 }}
            style={{ overflow:"hidden" }}>
            <div className="p-5 space-y-5">

              {/* ── Add new alert form ── */}
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#6b7a8d" }}>
                  New Alert
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {/* Symbol */}
                  <select value={base} onChange={e => setBase(e.target.value)} style={{ ...inp, appearance:"none" }}>
                    {INSTRUMENTS.map(i => (
                      <option key={i.base} value={i.base} style={{ background:"#0e1118" }}>{i.symbol}</option>
                    ))}
                  </select>

                  {/* Direction */}
                  <select value={dir} onChange={e => setDir(e.target.value as "above"|"below")} style={{ ...inp, appearance:"none" }}>
                    <option value="above" style={{ background:"#0e1118" }}>▲ Above</option>
                    <option value="below" style={{ background:"#0e1118" }}>▼ Below</option>
                  </select>

                  {/* Price */}
                  <input type="number" placeholder={`Price (${prices[base] ? formatPrice(prices[base]) : "—"})`}
                    value={price} onChange={e => setPrice(e.target.value)} style={inp}
                    onFocus={e => (e.currentTarget.style.borderColor="rgba(201,168,76,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)")}/>

                  {/* Note */}
                  <input type="text" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)}
                    style={inp}
                    onFocus={e => (e.currentTarget.style.borderColor="rgba(201,168,76,0.5)")}
                    onBlur={e  => (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)")}/>
                </div>

                {/* Current price hint */}
                {prices[base] && (
                  <div className="text-xs mb-2" style={{ color:"#4a5568" }}>
                    Current {INSTRUMENTS.find(i=>i.base===base)?.symbol}: <span style={{ color:"#9fa8b4", fontFamily:"var(--font-mono, JetBrains Mono, monospace)" }}>{formatPrice(prices[base])}</span>
                  </div>
                )}

                {formErr && <p className="text-xs mb-2" style={{ color:"#ef4444" }}>{formErr}</p>}

                <button onClick={addAlert} disabled={saving}
                  className="text-xs px-4 py-2 rounded font-bold"
                  style={{
                    background: saving ? "rgba(37,45,61,0.4)" : "rgba(201,168,76,0.12)",
                    color:      saving ? "#6b7a8d" : "#c9a84c",
                    border: "1px solid rgba(201,168,76,0.3)",
                  }}>
                  {saving ? "Adding…" : "+ Add Alert"}
                </button>
              </div>

              {/* ── Active alerts ── */}
              {activeAlerts.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:"#6b7a8d" }}>
                    Active
                  </div>
                  <div className="space-y-1.5">
                    {activeAlerts.map(a => {
                      const current = prices[a.base];
                      const dist    = current ? ((a.price - current) / current * 100) : null;
                      return (
                        <div key={a._id} className="flex items-center justify-between px-3 py-2.5 rounded"
                          style={{ background:"rgba(37,45,61,0.25)", border:"1px solid rgba(37,45,61,0.4)" }}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold" style={{ color:"#c9a84c" }}>
                              {a.direction === "above" ? "▲" : "▼"}
                            </span>
                            <div>
                              <div className="text-xs font-semibold" style={{ color:"#f0ede8" }}>
                                {a.symbol} {a.direction} <span className="font-mono">{formatPrice(a.price)}</span>
                              </div>
                              {a.note && <div className="text-xs" style={{ color:"#4a5568" }}>{a.note}</div>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {dist !== null && (
                              <span className="text-xs font-mono" style={{ color: Math.abs(dist) < 2 ? "#c9a84c" : "#6b7a8d" }}>
                                {dist > 0 ? "+" : ""}{dist.toFixed(2)}%
                              </span>
                            )}
                            <button onClick={() => cancel(a._id)}
                              className="text-xs px-2 py-1 rounded"
                              style={{ color:"#ef4444", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Past alerts ── */}
              {pastAlerts.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:"#4a5568" }}>
                    Recent History
                  </div>
                  <div className="space-y-1">
                    {pastAlerts.map(a => {
                      const s = STATUS_STYLE[a.status] ?? STATUS_STYLE.cancelled;
                      return (
                        <div key={a._id} className="flex items-center justify-between px-3 py-2 rounded"
                          style={{ background:"rgba(37,45,61,0.15)" }}>
                          <span className="text-xs" style={{ color:"#6b7a8d" }}>
                            {a.symbol} {a.direction} <span className="font-mono">{formatPrice(a.price)}</span>
                            {a.note ? ` · ${a.note}` : ""}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded font-semibold"
                            style={{ background: s.bg, color: s.color }}>
                            {a.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!activeAlerts.length && !pastAlerts.length && (
                <p className="text-xs text-center py-4" style={{ color:"#4a5568" }}>
                  No alerts set. Add one above to get notified.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
