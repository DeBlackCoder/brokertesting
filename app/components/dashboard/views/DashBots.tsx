"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPost } from "@/lib/useApi";

interface Bot {
  _id:         string;
  name:        string;
  description: string;
  price:       number;
  monthlyFee:  number;
  risk:        "low" | "medium" | "high";
  features:    string[];
  returns:     string;
  badge?:      string;
  owned:       boolean;
  ownerStatus: "active" | "paused" | null;
  purchasedAt: string | null;
}

interface WalletData { liveBalance: number; }

const RISK_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  low:    { color:"#10d48e", bg:"rgba(16,212,142,0.1)",  label:"Low Risk"    },
  medium: { color:"#c9a84c", bg:"rgba(201,168,76,0.1)",  label:"Medium Risk" },
  high:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)",   label:"High Risk"   },
};

export default function DashBots() {
  const { data: bots,   loading: bLoad, refetch: refetchBots } = useApi<Bot[]>("/api/bots");
  const { data: wallet, refetch: refetchWallet }               = useApi<WalletData>("/api/wallet");

  const [buying,   setBuying]   = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id:string; text:string; ok:boolean } | null>(null);
  const [selected, setSelected] = useState<Bot | null>(null);

  const buyBot = async (bot: Bot) => {
    setBuying(bot._id); setFeedback(null);
    const { data, error } = await apiPost<{ message:string; liveBalance:number }>("/api/bots/buy", { botId: bot._id });
    setBuying(null);
    if (error) { setFeedback({ id:bot._id, text:error, ok:false }); return; }
    setFeedback({ id:bot._id, text:data?.message ?? "Bot activated!", ok:true });
    refetchBots(); refetchWallet();
    setSelected(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const toggleBot = async (userBotId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    const token = localStorage.getItem("aurex_token") ?? "";
    await fetch("/api/bots/my", {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ userBotId, status: newStatus }),
    });
    refetchBots();
  };

  const balance = wallet?.liveBalance ?? 0;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Trading Bots</h1>
          <p className="text-xs mt-1" style={{ color:"#4a5568" }}>
            Automated strategies that trade on your behalf 24/7.
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1.5 rounded"
          style={{ background:"rgba(16,212,142,0.08)", border:"1px solid rgba(16,212,142,0.2)", color:"#10d48e" }}>
          Balance: ${balance.toLocaleString("en-US",{ minimumFractionDigits:2 })}
        </div>
      </div>

      {/* Bot grid */}
      {bLoad ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:3}).map((_,i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg" style={{ background:"rgba(37,45,61,0.2)" }}/>
          ))}
        </div>
      ) : !bots?.length ? (
        <div className="py-20 text-center">
          <div className="text-3xl mb-3">🤖</div>
          <p className="text-sm" style={{ color:"#4a5568" }}>No trading bots available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot, i) => {
            const risk    = RISK_STYLE[bot.risk] ?? RISK_STYLE.medium;
            const canAfford = balance >= bot.price;
            return (
              <motion.div key={bot._id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                className="relative flex flex-col cursor-pointer"
                style={{
                  background:    bot.owned ? "rgba(16,212,142,0.04)" : "rgba(14,17,24,0.8)",
                  border:        bot.owned ? "1px solid rgba(16,212,142,0.25)" : "1px solid rgba(37,45,61,0.45)",
                  borderRadius:  10,
                  overflow:      "hidden",
                  transition:    "border-color 0.2s",
                }}
                onClick={() => setSelected(bot)}
                onMouseEnter={e => { if (!bot.owned) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(16,212,142,0.2)"; }}
                onMouseLeave={e => { if (!bot.owned) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(37,45,61,0.45)"; }}
              >
                {/* Top accent */}
                <div className="h-0.5 w-full" style={{ background: bot.owned ? "#10d48e" : `rgba(${bot.risk==="low"?"16,212,142":bot.risk==="medium"?"201,168,76":"239,68,68"},0.6)` }}/>

                <div className="p-5 flex flex-col flex-1">
                  {/* Badge */}
                  {bot.badge && (
                    <span className="self-start text-xs px-2 py-0.5 rounded font-bold mb-3"
                      style={{ background:"rgba(201,168,76,0.15)", color:"#c9a84c" }}>
                      {bot.badge}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base" style={{ color:"#f0ede8" }}>{bot.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold shrink-0"
                      style={{ background:risk.bg, color:risk.color }}>
                      {risk.label}
                    </span>
                  </div>

                  <p className="text-xs mb-4 leading-relaxed" style={{ color:"#6b7a8d" }}>{bot.description}</p>

                  {bot.returns && (
                    <div className="text-sm font-bold mb-4" style={{ color:"#10d48e" }}>
                      {bot.returns} <span className="text-xs font-normal" style={{ color:"#4a5568" }}>est. returns</span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-1 mb-5 flex-1">
                    {bot.features.slice(0,4).map((f,fi) => (
                      <li key={fi} className="flex items-start gap-1.5 text-xs" style={{ color:"#9fa8b4" }}>
                        <span style={{ color:"#10d48e", flexShrink:0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>

                  {/* Price + action */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xl font-bold" style={{ color:"#f0ede8" }}>
                          ${bot.price.toLocaleString()}
                        </span>
                        {bot.monthlyFee > 0 && (
                          <span className="text-xs ml-1" style={{ color:"#4a5568" }}>
                            + ${bot.monthlyFee}/mo
                          </span>
                        )}
                      </div>
                      {bot.owned && (
                        <span className="text-xs px-2 py-0.5 rounded font-bold"
                          style={{ background:"rgba(16,212,142,0.1)", color:"#10d48e" }}>
                          ✓ Owned
                        </span>
                      )}
                    </div>

                    {feedback?.id === bot._id && (
                      <div className="mb-2 text-xs px-2 py-1.5 rounded" style={{
                        background: feedback.ok ? "rgba(16,212,142,0.08)" : "rgba(239,68,68,0.08)",
                        color:      feedback.ok ? "#10d48e" : "#ef4444",
                        border:     `1px solid ${feedback.ok ? "rgba(16,212,142,0.2)" : "rgba(239,68,68,0.2)"}`,
                      }}>
                        {feedback.text}
                      </div>
                    )}

                    {bot.owned ? (
                      <div className="flex gap-2">
                        <div className="flex-1 text-xs text-center py-2 rounded font-semibold"
                          style={{ background:"rgba(16,212,142,0.08)", color:"#10d48e", border:"1px solid rgba(16,212,142,0.2)" }}>
                          Active Bot
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); buyBot(bot); }}
                        disabled={buying === bot._id || !canAfford}
                        className="w-full py-2.5 text-sm font-bold rounded"
                        style={{
                          background: !canAfford ? "rgba(37,45,61,0.3)" : buying===bot._id ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)",
                          color:      !canAfford ? "#4a5568" : buying===bot._id ? "#6b7a8d" : "#040507",
                          cursor:     !canAfford ? "not-allowed" : "pointer",
                        }}>
                        {buying===bot._id ? "Processing…" : !canAfford ? "Insufficient Balance" : `Buy — $${bot.price.toLocaleString()}`}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bot detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(4,5,7,0.88)", backdropFilter:"blur(8px)" }}
              onClick={() => setSelected(null)}/>
            <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16, pointerEvents:"none" }}>
              <motion.div
                initial={{ opacity:0, scale:0.95, y:20 }}
                animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:0.95 }}
                style={{ pointerEvents:"auto", width:"100%", maxWidth:480, maxHeight:"88vh", overflowY:"auto", background:"rgba(13,15,20,0.99)", border:"1px solid rgba(37,45,61,0.55)", borderRadius:12, boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}>

                <div className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom:"1px solid rgba(37,45,61,0.4)", position:"sticky", top:0, background:"rgba(13,15,20,0.98)" }}>
                  <div>
                    <div className="font-bold" style={{ color:"#f0ede8" }}>{selected.name}</div>
                    <div className="text-xs mt-0.5" style={{ color:"#4a5568" }}>{RISK_STYLE[selected.risk]?.label}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ color:"#4a5568", fontSize:22, lineHeight:1 }}>×</button>
                </div>

                <div className="p-6 space-y-5">
                  <p className="text-sm leading-relaxed" style={{ color:"#9fa8b4" }}>{selected.description}</p>

                  {selected.returns && (
                    <div className="px-4 py-3 rounded" style={{ background:"rgba(16,212,142,0.06)", border:"1px solid rgba(16,212,142,0.15)" }}>
                      <div className="text-xs mb-0.5" style={{ color:"#4a5568" }}>Estimated Returns</div>
                      <div className="text-lg font-bold" style={{ color:"#10d48e" }}>{selected.returns}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#6b7a8d" }}>Features</div>
                    <ul className="space-y-2">
                      {selected.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color:"#9fa8b4" }}>
                          <span style={{ color:"#10d48e", flexShrink:0, marginTop:2 }}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-2xl font-bold" style={{ color:"#f0ede8" }}>${selected.price.toLocaleString()}</div>
                      {selected.monthlyFee > 0 && <div className="text-xs" style={{ color:"#4a5568" }}>+ ${selected.monthlyFee}/month</div>}
                    </div>
                    <div className="text-sm" style={{ color:"#6b7a8d" }}>
                      Your balance: <span style={{ color: balance >= selected.price ? "#10d48e" : "#ef4444" }}>${balance.toLocaleString()}</span>
                    </div>
                  </div>

                  {feedback?.id === selected._id && (
                    <div className="px-3 py-2.5 rounded text-xs" style={{
                      background: feedback.ok ? "rgba(16,212,142,0.08)" : "rgba(239,68,68,0.08)",
                      color:      feedback.ok ? "#10d48e" : "#ef4444",
                      border:     `1px solid ${feedback.ok ? "rgba(16,212,142,0.2)" : "rgba(239,68,68,0.2)"}`,
                    }}>
                      {feedback.ok ? "✓ " : "✗ "}{feedback.text}
                    </div>
                  )}

                  {selected.owned ? (
                    <div className="py-3 text-center text-sm font-bold rounded"
                      style={{ background:"rgba(16,212,142,0.08)", color:"#10d48e", border:"1px solid rgba(16,212,142,0.2)" }}>
                      ✓ You own this bot — it's actively trading for you
                    </div>
                  ) : (
                    <button
                      onClick={() => buyBot(selected)}
                      disabled={buying === selected._id || balance < selected.price}
                      className="w-full py-3.5 text-sm font-bold rounded"
                      style={{
                        background: balance < selected.price ? "rgba(37,45,61,0.3)" : buying===selected._id ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)",
                        color:      balance < selected.price ? "#4a5568" : buying===selected._id ? "#6b7a8d" : "#040507",
                      }}>
                      {buying===selected._id ? "Processing…" : balance < selected.price ? `Need $${(selected.price - balance).toFixed(2)} more` : `Activate Bot — $${selected.price.toLocaleString()}`}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
