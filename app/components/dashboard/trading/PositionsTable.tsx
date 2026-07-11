"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calcPnl, formatPrice } from "./instruments";
import { ToastType } from "./useToast";

interface Position {
  _id:        string;
  symbol:     string;
  side:       "buy" | "sell";
  lotSize:    number;
  entryPrice: number;
  stopLoss?:  number;
  takeProfit?:number;
  status:     string;
  openedAt:   string;
  pnl:        number;
}

interface Props {
  sessionId: string;
  prices:    Record<string, number>;
  onRefresh: () => void;
  positions: Position[];
  history:   Position[];
  onToast?:  (type: ToastType, title: string, msg: string) => void;
}

// Flash colour when PnL crosses a threshold
function PnlCell({ pnl, prev }: { pnl: number; prev: number }) {
  const [flash, setFlash] = useState<"up"|"down"|null>(null);
  useEffect(() => {
    if (pnl === prev) return;
    setFlash(pnl > prev ? "up" : "down");
    const id = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(id);
  }, [pnl, prev]);

  return (
    <motion.span
      className="font-mono font-bold"
      animate={{ color: flash === "up" ? "#00ff88" : flash === "down" ? "#ff4444" : pnl >= 0 ? "#10d48e" : "#ef4444" }}
      transition={{ duration:0.2 }}
      style={{ fontSize:12 }}
    >
      {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
    </motion.span>
  );
}

export default function PositionsTable({ prices, onRefresh, positions, history, onToast }: Props) {
  const [tab,     setTab]     = useState<"open"|"history">("open");
  const [closing, setClosing] = useState<string | null>(null);

  // Track previous PnL for flash animation
  const prevPnl = useRef<Record<string, number>>({});

  const closePosition = async (id: string, currentPrice: number, reason = "closed") => {
    setClosing(id);
    const token = localStorage.getItem("aurex_token") ?? "";
    const res   = await fetch(`/api/trade/close/${id}`, {
      method:  "POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body:    JSON.stringify({ exitPrice: currentPrice, reason }),
    });
    const json = await res.json();
    setClosing(null);
    if (res.ok) {
      const pnl = json.data?.pnl ?? 0;
      const pos = positions.find(p => p._id === id);
      if (pos) {
        if (reason === "sl_hit") {
          onToast?.("sl", "Stop Loss Hit", `${pos.symbol} closed at ${formatPrice(currentPrice)}. Loss: $${Math.abs(pnl).toFixed(2)}`);
        } else if (reason === "tp_hit") {
          onToast?.("tp", "Take Profit Hit!", `${pos.symbol} target reached at ${formatPrice(currentPrice)}. Profit: +$${pnl.toFixed(2)}`);
        } else if (pnl >= 0) {
          onToast?.("profit", "Position Closed — Profit", `${pos.symbol}: +$${pnl.toFixed(2)}`);
        } else {
          onToast?.("loss", "Position Closed — Loss", `${pos.symbol}: -$${Math.abs(pnl).toFixed(2)}`);
        }
      }
      onRefresh();
    }
  };

  // Auto SL/TP checker with alerts
  useEffect(() => {
    positions.forEach(pos => {
      const base  = pos.symbol.replace("/USD","");
      const price = prices[base];
      if (!price) return;

      // Alert when PnL crosses $50 thresholds
      const livePnl = calcPnl(pos.side, pos.entryPrice, price, pos.lotSize);
      const prev    = prevPnl.current[pos._id] ?? 0;
      prevPnl.current[pos._id] = livePnl;

      // Milestone alerts: every $100 profit
      if (Math.floor(livePnl / 100) > Math.floor(prev / 100) && livePnl > 0) {
        onToast?.("profit", "Profit Milestone! 🎉", `${pos.symbol} up $${livePnl.toFixed(2)}`);
      }
      // Loss warnings at -$50, -$100, -$200
      const lossThresholds = [-50, -100, -200, -500];
      lossThresholds.forEach(t => {
        if (livePnl <= t && prev > t) {
          onToast?.("warning", `Loss Warning`, `${pos.symbol} position down $${Math.abs(livePnl).toFixed(2)}`);
        }
      });

      if (pos.stopLoss) {
        const hit = pos.side === "buy" ? price <= pos.stopLoss : price >= pos.stopLoss;
        if (hit) closePosition(pos._id, price, "sl_hit");
      }
      if (pos.takeProfit) {
        const hit = pos.side === "buy" ? price >= pos.takeProfit : price <= pos.takeProfit;
        if (hit) closePosition(pos._id, price, "tp_hit");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  const th: React.CSSProperties = {
    color:"#4a5568", fontSize:11, fontWeight:600, textTransform:"uppercase",
    letterSpacing:"0.05em", paddingBottom:8, paddingRight:10, whiteSpace:"nowrap",
  };
  const td: React.CSSProperties = { paddingTop:10, paddingBottom:10, paddingRight:10, fontSize:12, fontFamily:"var(--font-mono, JetBrains Mono, monospace)" };

  // Totals row
  const totalLivePnl = positions.reduce((sum, pos) => {
    const base  = pos.symbol.replace("/USD","");
    const price = prices[base] ?? pos.entryPrice;
    return sum + calcPnl(pos.side, pos.entryPrice, price, pos.lotSize);
  }, 0);

  return (
    <div style={{ background:"rgba(14,17,24,0.85)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8, overflow:"hidden" }}>
      {/* Tab bar + summary */}
      <div className="flex items-center justify-between" style={{ borderBottom:"1px solid rgba(37,45,61,0.4)", padding:"0 16px" }}>
        <div className="flex">
          {[["open","Open Positions"],["history","History"]].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t as "open"|"history")}
              className="px-4 py-3 text-xs font-semibold uppercase tracking-widest relative"
              style={{ color: tab===t ? "#f0ede8" : "#6b7a8d" }}>
              {l}
              {tab===t && <motion.div layoutId="pos-tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background:"#10d48e" }}/>}
              {t==="open" && positions.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background:"rgba(16,212,142,0.15)", color:"#10d48e" }}>
                  {positions.length}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Live total PnL */}
        {tab === "open" && positions.length > 0 && (
          <div style={{ fontSize:12, fontFamily:"var(--font-mono, JetBrains Mono, monospace)" }}>
            Total P&L:{" "}
            <span style={{ fontWeight:700, color: totalLivePnl >= 0 ? "#10d48e" : "#ef4444" }}>
              {totalLivePnl >= 0 ? "+" : ""}{totalLivePnl.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Open positions */}
      {tab === "open" && (
        <div className="overflow-x-auto">
          {!positions.length ? (
            <div className="py-10 text-center text-xs" style={{ color:"#4a5568" }}>No open positions. Place a trade above.</div>
          ) : (
            <table className="w-full" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(37,45,61,0.3)" }}>
                  {["Symbol","Side","Lots","Entry","Current","Live PnL","SL","TP","Time",""].map((h,i) => (
                    <th key={i} style={{ ...th, paddingLeft: i===0?16:0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <AnimatePresence>
                <tbody>
                  {positions.map(pos => {
                    const base    = pos.symbol.replace("/USD","");
                    const current = prices[base] ?? pos.entryPrice;
                    const livePnl = calcPnl(pos.side, pos.entryPrice, current, pos.lotSize);
                    const prev    = prevPnl.current[pos._id] ?? livePnl;
                    const pnlPct  = ((livePnl / (pos.entryPrice * pos.lotSize)) * 100).toFixed(2);

                    // Background tint based on PnL
                    const rowBg = livePnl >= 0
                      ? "rgba(16,212,142,0.03)"
                      : "rgba(239,68,68,0.03)";

                    return (
                      <motion.tr key={pos._id} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        style={{ borderBottom:"1px solid rgba(37,45,61,0.2)", background: rowBg }}>
                        <td style={{ ...td, paddingLeft:16 }}>
                          <span className="font-mono font-bold" style={{ color:"#f0ede8" }}>{pos.symbol}</span>
                        </td>
                        <td style={td}>
                          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                            style={{ background: pos.side==="buy"?"rgba(16,212,142,0.12)":"rgba(239,68,68,0.12)", color: pos.side==="buy"?"#10d48e":"#ef4444" }}>
                            {pos.side}
                          </span>
                        </td>
                        <td style={{ ...td, color:"#9fa8b4" }}>{pos.lotSize}</td>
                        <td style={{ ...td, color:"#9fa8b4" }}>{formatPrice(pos.entryPrice)}</td>
                        <td style={{ ...td, color:"#f0ede8", fontWeight:600 }}>{formatPrice(current)}</td>
                        <td style={td}>
                          <div>
                            <PnlCell pnl={livePnl} prev={prev}/>
                            <div style={{ fontSize:10, color:"#4a5568" }}>{pnlPct}%</div>
                          </div>
                        </td>
                        <td style={td}>
                          {pos.stopLoss ? (
                            <span style={{ color:"#ef4444" }}>{formatPrice(pos.stopLoss)}</span>
                          ) : <span style={{ color:"#4a5568" }}>—</span>}
                        </td>
                        <td style={td}>
                          {pos.takeProfit ? (
                            <span style={{ color:"#10d48e" }}>{formatPrice(pos.takeProfit)}</span>
                          ) : <span style={{ color:"#4a5568" }}>—</span>}
                        </td>
                        <td style={{ ...td, color:"#4a5568", fontSize:11 }}>
                          {new Date(pos.openedAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                        </td>
                        <td style={td}>
                          <button onClick={() => closePosition(pos._id, current)}
                            disabled={closing === pos._id}
                            className="text-xs px-3 py-1.5 rounded font-semibold"
                            style={{ background:"rgba(239,68,68,0.1)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.2)" }}>
                            {closing === pos._id ? "…" : "Close"}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </AnimatePresence>
            </table>
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="overflow-x-auto">
          {!history.length ? (
            <div className="py-10 text-center text-xs" style={{ color:"#4a5568" }}>No closed positions yet.</div>
          ) : (
            <table className="w-full" style={{ minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(37,45,61,0.3)" }}>
                  {["Symbol","Side","Lots","Entry","Exit","PnL","Reason","Date"].map((h,i) => (
                    <th key={i} style={{ ...th, paddingLeft: i===0?16:0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(pos => {
                  const pnlPos = pos.pnl >= 0;
                  const ep     = (pos as unknown as Record<string,number>).exitPrice;
                  return (
                    <tr key={pos._id} style={{ borderBottom:"1px solid rgba(37,45,61,0.2)" }}>
                      <td style={{ ...td, paddingLeft:16 }}><span className="font-mono font-bold" style={{ color:"#f0ede8" }}>{pos.symbol}</span></td>
                      <td style={td}>
                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                          style={{ background: pos.side==="buy"?"rgba(16,212,142,0.12)":"rgba(239,68,68,0.12)", color: pos.side==="buy"?"#10d48e":"#ef4444" }}>
                          {pos.side}
                        </span>
                      </td>
                      <td style={{ ...td, color:"#9fa8b4" }}>{pos.lotSize}</td>
                      <td style={{ ...td, color:"#9fa8b4" }}>{formatPrice(pos.entryPrice)}</td>
                      <td style={{ ...td, color:"#9fa8b4" }}>{ep ? formatPrice(ep) : "—"}</td>
                      <td style={td}>
                        <span className="font-mono font-bold" style={{ color: pnlPos?"#10d48e":"#ef4444" }}>
                          {pnlPos?"+":""}{pos.pnl.toFixed(2)}
                        </span>
                      </td>
                      <td style={td}>
                        <span className="text-xs capitalize px-2 py-0.5 rounded"
                          style={{ background: pos.status==="tp_hit"?"rgba(16,212,142,0.1)":pos.status==="sl_hit"?"rgba(239,68,68,0.1)":"rgba(37,45,61,0.3)", color: pos.status==="tp_hit"?"#10d48e":pos.status==="sl_hit"?"#ef4444":"#6b7a8d" }}>
                          {pos.status.replace("_"," ")}
                        </span>
                      </td>
                      <td style={{ ...td, color:"#4a5568", fontSize:11 }}>{new Date(pos.openedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
