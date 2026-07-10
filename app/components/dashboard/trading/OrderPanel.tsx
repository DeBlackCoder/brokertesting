"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Instrument, formatPrice } from "./instruments";
import { PriceData } from "./useLivePrice";

interface OrderPanelProps {
  instrument:    Instrument;
  price:         PriceData | null;
  sessionId:     string;
  sessionType:   "demo" | "live";
  balance:       number;
  onOrderPlaced: () => void;
}

const LEVERAGES = [1, 10, 25, 50, 100, 200];

const inp: React.CSSProperties = {
  background:"rgba(37,45,61,0.3)", border:"1px solid rgba(37,45,61,0.5)",
  borderRadius:4, color:"#f0ede8", padding:"9px 12px", fontSize:"0.8rem",
  outline:"none", width:"100%",
};
const onF = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.currentTarget.style.borderColor = "rgba(16,212,142,0.4)");
const onB = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)");

function MetricPill({ label, value, color = "#9fa8b4" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded"
      style={{ background:"rgba(37,45,61,0.2)", flex:1 }}>
      <div className="text-xs mb-0.5 whitespace-nowrap" style={{ color:"#4a5568" }}>{label}</div>
      <div className="text-xs font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  );
}

export default function OrderPanel({
  instrument, price, sessionId, sessionType, balance, onOrderPlaced,
}: OrderPanelProps) {
  const [side,     setSide]    = useState<"buy"|"sell">("buy");
  const [lotSize,  setLot]     = useState(String(instrument.minLot));
  const [leverage, setLev]     = useState(100);
  const [sl,       setSl]      = useState("");
  const [tp,       setTp]      = useState("");
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [success,  setSuccess] = useState("");

  const execPrice  = price ? (side === "buy" ? price.ask : price.bid) : null;
  const lots       = Math.max(0, Number(lotSize) || 0);
  const notional   = execPrice ? lots * execPrice : 0;        // full position value
  const margin     = notional / leverage;                      // required margin
  const freeMargin = Math.max(0, balance - margin);
  const marginPct  = balance > 0 ? (margin / balance) * 100 : 0;

  // Estimated pip value (simplified: 1 pip = 0.0001 × lots × price for crypto)
  const pipValue = execPrice ? lots * execPrice * 0.001 : 0;

  const place = async () => {
    if (!execPrice)                                              { setError("Waiting for price…"); return; }
    if (!lots || lots < instrument.minLot)                       { setError(`Minimum lot size is ${instrument.minLot}`); return; }
    if (margin > balance)                                        { setError(`Insufficient margin. Need $${margin.toFixed(2)}`); return; }

    setLoading(true); setError(""); setSuccess("");
    const token = localStorage.getItem("aurex_token") ?? "";
    const res = await fetch("/api/trade/open", {
      method:  "POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({
        sessionId,
        symbol:     instrument.symbol,
        side,
        lotSize:    lots,
        entryPrice: execPrice,
        leverage,
        stopLoss:   sl ? Number(sl)   : undefined,
        takeProfit: tp ? Number(tp)   : undefined,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Order failed"); return; }
    setSuccess(`${side.toUpperCase()} ${lots} ${instrument.symbol} @ ${formatPrice(execPrice)}`);
    setSl(""); setTp("");
    onOrderPlaced();
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg" style={{ background:"rgba(37,45,61,0.3)" }}>
        {(["buy","sell"] as const).map(s => (
          <button key={s} onClick={() => setSide(s)}
            className="py-2.5 text-sm font-bold uppercase rounded-md transition-all"
            style={{
              background: side===s ? (s==="buy"?"#10d48e":"#ef4444") : "transparent",
              color:      side===s ? "#040507" : "#6b7a8d",
            }}>
            {s==="buy" ? "▲ BUY" : "▼ SELL"}
          </button>
        ))}
      </div>

      {/* Bid / Ask */}
      <div className="grid grid-cols-2 gap-2">
        {[["BID", price?.bid], ["ASK", price?.ask]].map(([l, v]) => (
          <div key={l} className="p-3 rounded text-center"
            style={{ background:"rgba(37,45,61,0.25)", border:"1px solid rgba(37,45,61,0.4)" }}>
            <div className="text-xs mb-1" style={{ color:"#4a5568" }}>{l}</div>
            <div className="font-mono font-bold text-sm" style={{ color: l==="BID"?"#ef4444":"#10d48e" }}>
              {v ? formatPrice(v as number) : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Lot size */}
      <div>
        <label className="block text-xs mb-1.5 font-medium uppercase tracking-widest" style={{ color:"#6b7a8d" }}>
          Lot Size ({instrument.base})
        </label>
        <div className="flex gap-2">
          <input type="number" value={lotSize} onChange={e => setLot(e.target.value)}
            step={instrument.lotStep} min={instrument.minLot} style={inp} onFocus={onF} onBlur={onB}/>
          <div className="flex flex-col gap-1">
            <button onClick={() => setLot(v => String(+(Number(v)+instrument.lotStep).toFixed(8)))}
              className="w-7 h-5 text-xs rounded" style={{ background:"rgba(37,45,61,0.5)", color:"#9fa8b4" }}>+</button>
            <button onClick={() => setLot(v => String(Math.max(instrument.minLot,+(Number(v)-instrument.lotStep).toFixed(8))))}
              className="w-7 h-5 text-xs rounded" style={{ background:"rgba(37,45,61,0.5)", color:"#9fa8b4" }}>-</button>
          </div>
        </div>
      </div>

      {/* Leverage */}
      <div>
        <label className="block text-xs mb-1.5 font-medium uppercase tracking-widest" style={{ color:"#6b7a8d" }}>
          Leverage
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {LEVERAGES.map(lev => (
            <button key={lev} onClick={() => setLev(lev)}
              className="text-xs px-2.5 py-1.5 rounded font-bold transition-all"
              style={{
                background: leverage===lev ? "rgba(16,212,142,0.15)" : "rgba(37,45,61,0.3)",
                color:      leverage===lev ? "#10d48e"               : "#6b7a8d",
                border:     leverage===lev ? "1px solid rgba(16,212,142,0.35)" : "1px solid rgba(37,45,61,0.4)",
              }}>
              1:{lev}
            </button>
          ))}
        </div>
      </div>

      {/* Margin metrics row */}
      <div className="flex gap-2">
        <MetricPill
          label="Notional"
          value={`$${notional.toLocaleString("en-US",{maximumFractionDigits:2})}`}
        />
        <MetricPill
          label="Margin Req."
          value={`$${margin.toFixed(2)}`}
          color={margin > balance ? "#ef4444" : "#c9a84c"}
        />
        <MetricPill
          label="Free Margin"
          value={`$${freeMargin.toLocaleString("en-US",{maximumFractionDigits:2})}`}
          color={freeMargin < margin ? "#ef4444" : "#10d48e"}
        />
        <MetricPill
          label="Margin %"
          value={`${marginPct.toFixed(1)}%`}
          color={marginPct > 80 ? "#ef4444" : marginPct > 50 ? "#c9a84c" : "#9fa8b4"}
        />
      </div>

      {/* Pip value hint */}
      {execPrice && lots > 0 && (
        <div className="text-xs px-3 py-2 rounded flex items-center justify-between"
          style={{ background:"rgba(37,45,61,0.2)", color:"#6b7a8d" }}>
          <span>Est. pip value</span>
          <span className="font-mono" style={{ color:"#9fa8b4" }}>${pipValue.toFixed(4)}</span>
        </div>
      )}

      {/* SL / TP */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1.5 uppercase tracking-widest" style={{ color:"#6b7a8d" }}>Stop Loss</label>
          <input type="number" placeholder="Optional" value={sl} onChange={e => setSl(e.target.value)}
            style={inp} onFocus={onF} onBlur={onB}/>
          {sl && execPrice && (
            <div className="text-xs mt-1" style={{ color:"#ef4444" }}>
              Risk: ${(Math.abs(Number(sl) - execPrice) * lots).toFixed(2)}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs mb-1.5 uppercase tracking-widest" style={{ color:"#6b7a8d" }}>Take Profit</label>
          <input type="number" placeholder="Optional" value={tp} onChange={e => setTp(e.target.value)}
            style={inp} onFocus={onF} onBlur={onB}/>
          {tp && execPrice && (
            <div className="text-xs mt-1" style={{ color:"#10d48e" }}>
              Reward: ${(Math.abs(Number(tp) - execPrice) * lots).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* R:R ratio */}
      {sl && tp && execPrice && (
        <div className="text-xs px-3 py-2 rounded flex items-center justify-between"
          style={{ background:"rgba(16,212,142,0.05)", border:"1px solid rgba(16,212,142,0.1)" }}>
          <span style={{ color:"#6b7a8d" }}>Risk : Reward</span>
          <span className="font-mono font-bold" style={{ color:"#10d48e" }}>
            1 : {(Math.abs(Number(tp)-execPrice) / Math.max(0.0001,Math.abs(Number(sl)-execPrice))).toFixed(2)}
          </span>
        </div>
      )}

      {/* Error / success */}
      {error   && <p className="text-xs px-3 py-2 rounded" style={{ background:"rgba(239,68,68,0.08)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.2)" }}>{error}</p>}
      {success && <p className="text-xs px-3 py-2 rounded" style={{ background:"rgba(16,212,142,0.08)", color:"#10d48e", border:"1px solid rgba(16,212,142,0.2)" }}>✓ Opened: {success}</p>}

      {/* Place order */}
      <motion.button onClick={place} disabled={loading || !price}
        whileHover={!loading && !!price ? { scale:1.02 } : {}}
        whileTap={!loading && !!price ? { scale:0.98 } : {}}
        className="w-full py-3.5 text-sm font-bold uppercase tracking-widest"
        style={{
          background: loading || !price ? "rgba(37,45,61,0.35)"
            : side==="buy" ? "linear-gradient(135deg,#10d48e,#00bcd4)"
            : "linear-gradient(135deg,#ef4444,#c0392b)",
          color:      loading || !price ? "#6b7a8d" : "#040507",
          borderRadius:4, transition:"all 0.2s",
        }}>
        {loading ? "Placing…" : `${side==="buy"?"▲ BUY":"▼ SELL"} ${instrument.symbol}`}
      </motion.button>

      {/* Session badge */}
      <div className="text-center">
        <span className="text-xs px-3 py-1 rounded uppercase font-bold"
          style={{
            background: sessionType==="live" ? "rgba(16,212,142,0.1)" : "rgba(0,188,212,0.1)",
            color:      sessionType==="live" ? "#10d48e" : "#00bcd4",
          }}>
          {sessionType} account · 1:{leverage}
        </span>
      </div>
    </div>
  );
}
