"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPost } from "@/lib/useApi";
import { INSTRUMENTS, formatPrice } from "../trading/instruments";
import { useLivePrice, useWatchlist } from "../trading/useLivePrice";
import PriceChart         from "../trading/PriceChart";
import OrderPanel         from "../trading/OrderPanel";
import PositionsTable     from "../trading/PositionsTable";
import PriceAlerts        from "../trading/PriceAlerts";
import ToastNotifications from "../trading/ToastNotifications";
import { useToast }       from "../trading/useToast";

interface Session { _id:string; type:"demo"|"live"; status:string; startBalance:number; currentBalance:number; totalPnl:number; }
interface WalletData { liveBalance:number; demoBalance:number; }
interface Position { _id:string; symbol:string; side:"buy"|"sell"; lotSize:number; entryPrice:number; stopLoss?:number; takeProfit?:number; status:string; openedAt:string; pnl:number; }

const WATCHLIST_BASES = INSTRUMENTS.map(i => i.base);

export default function DashTrade() {
  const { data: sessions, loading: sLoad, refetch: refetchSessions } = useApi<Session[]>("/api/wallet/sessions");
  const { data: wallet,   refetch: refetchWallet }                   = useApi<WalletData>("/api/wallet");

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [startLoading, setStartLoading]     = useState(false);
  const [startError, setStartError]         = useState("");

  const [selectedBase, setSelectedBase] = useState("BTC");
  const activeInstrument = INSTRUMENTS.find(i => i.base === selectedBase) ?? INSTRUMENTS[0];

  const livePrice  = useLivePrice(selectedBase, 500);
  const watchlist  = useWatchlist(WATCHLIST_BASES.slice(0, 8), 1500);

  const [openPositions,   setOpenPositions]   = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  const [stealth, setStealth] = useState(false); // hide DEMO labels when true

  // ── Toast system ────────────────────────────────────────────────────────
  const { toasts, add: addToast, dismiss } = useToast();

  // Market movement alerts — fires when price moves >2% between ticks
  const prevPriceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!livePrice) return;
    const prev = prevPriceRef.current;
    if (prev !== null && prev > 0) {
      const pct = ((livePrice.price - prev) / prev) * 100;
      if (Math.abs(pct) >= 2) {
        const dir = pct > 0 ? "▲" : "▼";
        addToast(
          "market",
          `${activeInstrument.symbol} Market Move ${dir}`,
          `Price moved ${pct > 0 ? "+" : ""}${pct.toFixed(2)}% to ${livePrice.price.toFixed(2)}`
        );
      }
    }
    prevPriceRef.current = livePrice.price;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livePrice?.price]);

  // Pick most recent active session on load
  useEffect(() => {
    if (sessions) {
      const active = sessions.find(s => s.status === "active");
      if (active && !activeSession) setActiveSession(active);
    }
  }, [sessions]);

  const fetchPositions = useCallback(async () => {
    if (!activeSession) return;
    const token = localStorage.getItem("aurex_token") ?? "";
    const [openRes, histRes] = await Promise.all([
      fetch(`/api/trade/positions?sessionId=${activeSession._id}&status=open`,   { headers:{ Authorization:`Bearer ${token}` } }),
      fetch(`/api/trade/positions?sessionId=${activeSession._id}&status=all`,    { headers:{ Authorization:`Bearer ${token}` } }),
    ]);
    if (openRes.ok)  { const j = await openRes.json();  setOpenPositions(j.data ?? []); }
    if (histRes.ok)  { const j = await histRes.json();  setClosedPositions((j.data ?? []).filter((p:Position) => p.status !== "open")); }
  }, [activeSession]);

  useEffect(() => { fetchPositions(); }, [activeSession, fetchPositions]);

  // Prices map for position SL/TP checker
  const priceMap: Record<string, number> = {};
  WATCHLIST_BASES.forEach(b => { if (watchlist[b]?.price) priceMap[b] = watchlist[b].price; });
  if (livePrice) priceMap[selectedBase] = livePrice.price;

  const startSession = async (type: "demo"|"live") => {
    setStartLoading(true); setStartError("");
    const { error } = await apiPost("/api/wallet/start-trade", { type });
    setStartLoading(false);
    if (error) { setStartError(error); return; }
    setShowStartModal(false);
    refetchSessions();
    refetchWallet();
  };

  const change = livePrice?.change24h ?? 0;
  const changePos = change >= 0;

  // ── No active session ────────────────────────────────────────────────────
  if (!sLoad && !activeSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Trade</h1>
            <p className="text-xs mt-1" style={{ color:"#4a5568" }}>Start a session to begin trading.</p>
          </div>
          <button onClick={() => setShowStartModal(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded"
            style={{ background:"rgba(16,212,142,0.1)", border:"1px solid rgba(16,212,142,0.3)", color:"#10d48e" }}>
            + New Trade
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-24"
          style={{ border:"1px dashed rgba(37,45,61,0.4)", borderRadius:8 }}>
          <div className="text-3xl mb-3" style={{ color:"#252d3d" }}>◎</div>
          <p className="text-sm mb-4" style={{ color:"#4a5568" }}>No active trading session.</p>
          <button onClick={() => setShowStartModal(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded"
            style={{ background:"rgba(16,212,142,0.1)", border:"1px solid rgba(16,212,142,0.3)", color:"#10d48e" }}>
            Start a Trade
          </button>
        </div>

        {/* Start modal */}
        <AnimatePresence>
          {showStartModal && <StartModal wallet={wallet} starting={startLoading} error={startError}
            onStart={startSession} onClose={() => setShowStartModal(false)}/>}
        </AnimatePresence>
      </div>
    );
  }

  // ── Full trading terminal ────────────────────────────────────────────────
  const balance = activeSession?.type === "live" ? (wallet?.liveBalance ?? 0) : (wallet?.demoBalance ?? 0);

  return (
    <div className="space-y-4 w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Trading Terminal</h1>
          {activeSession && !stealth && (
            <span className="text-xs px-2 py-0.5 rounded font-bold uppercase"
              style={{ background: activeSession.type==="live"?"rgba(16,212,142,0.12)":"rgba(0,188,212,0.12)", color: activeSession.type==="live"?"#10d48e":"#00bcd4" }}>
              {activeSession.type}
            </span>
          )}
          {stealth && activeSession?.type === "demo" && (
            <span className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ background:"rgba(201,168,76,0.1)", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.2)" }}>
              👁 Stealth
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs font-mono" style={{ color:"#f0ede8" }}>
            <span style={{ color:"#4a5568" }}>Bal </span>
            <span style={{ color:"#10d48e" }}>${balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          </div>
          {activeSession?.type === "demo" && (
            <button onClick={() => setStealth(s => !s)}
              title={stealth ? "Show demo labels" : "Stealth mode"}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded font-semibold"
              style={{
                background: stealth ? "rgba(201,168,76,0.12)" : "rgba(37,45,61,0.4)",
                color:      stealth ? "#c9a84c" : "#6b7a8d",
                border:     stealth ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(37,45,61,0.5)",
                minHeight:"unset", minWidth:"unset",
              }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                {stealth
                  ? <><path d="M6 2C3.5 2 1.5 4 1.5 6s2 4 4.5 4 4.5-2 4.5-4-2-4-4.5-4z" stroke="currentColor" strokeWidth="1"/><line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>
                  : <><path d="M6 2C3.5 2 1.5 4 1.5 6s2 4 4.5 4 4.5-2 4.5-4-2-4-4.5-4z" stroke="currentColor" strokeWidth="1"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/></>
                }
              </svg>
              <span className="hidden sm:inline">{stealth ? "Stealth" : "Stealth"}</span>
            </button>
          )}
          <button onClick={() => { setShowStartModal(true); setStartError(""); }}
            className="text-xs px-2.5 py-1 rounded font-semibold"
            style={{ background:"rgba(37,45,61,0.4)", color:"#9fa8b4", border:"1px solid rgba(37,45,61,0.5)", minHeight:"unset", minWidth:"unset" }}>
            + Session
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* ── Price header bar ── */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
          <div className="flex items-center gap-5">
            <div>
              <div className="text-xl font-bold font-mono" style={{ color:"#f0ede8" }}>
                {livePrice ? formatPrice(livePrice.price) : "—"}
              </div>
              <div className="text-xs" style={{ color:"#4a5568" }}>{activeInstrument.symbol} · {activeInstrument.name}</div>
            </div>
            {livePrice && (
              <>
                <div className="hidden sm:block">
                  <div className="text-xs mb-0.5" style={{ color:"#4a5568" }}>24h Change</div>
                  <div className="text-sm font-semibold" style={{ color: changePos?"#10d48e":"#ef4444" }}>
                    {changePos?"+":""}{livePrice.change24h.toFixed(2)}%
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-xs mb-0.5" style={{ color:"#4a5568" }}>Ask</div>
                  <div className="text-xs font-mono" style={{ color:"#10d48e" }}>{formatPrice(livePrice.ask)}</div>
                </div>
                <div className="hidden md:block">
                  <div className="text-xs mb-0.5" style={{ color:"#4a5568" }}>Bid</div>
                  <div className="text-xs font-mono" style={{ color:"#ef4444" }}>{formatPrice(livePrice.bid)}</div>
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs mb-0.5" style={{ color:"#4a5568" }}>Spread</div>
                  <div className="text-xs font-mono" style={{ color:"#9fa8b4" }}>{formatPrice(livePrice.ask - livePrice.bid)}</div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Instrument selector */}
            <select value={selectedBase} onChange={e => setSelectedBase(e.target.value)}
              className="text-xs px-3 py-1.5 outline-none appearance-none"
              style={{ background:"rgba(37,45,61,0.4)", border:"1px solid rgba(37,45,61,0.5)", borderRadius:4, color:"#f0ede8" }}>
              {INSTRUMENTS.map(i => <option key={i.base} value={i.base} style={{ background:"#0e1118" }}>{i.symbol}</option>)}
            </select>
            <div className="flex items-center gap-1.5">
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background:"#10d48e" }}
                animate={{ scale:[1,1.5,1], opacity:[1,0.4,1] }} transition={{ duration:2, repeat:Infinity }} aria-hidden="true"/>
              <span className="text-xs" style={{ color:"#10d48e" }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* ── Full-width chart — 280px on mobile, 500px on desktop ── */}
        <div style={{
          background:"rgba(14,17,24,0.8)",
          border:"1px solid rgba(37,45,61,0.45)",
          borderRadius:8,
          padding:"12px 8px",
          height:"clamp(260px, 35vw, 500px)",
          overflow:"hidden",
        }}>
          <PriceChart
            base={selectedBase}
            currentPrice={livePrice?.price ?? null}
            openPositions={openPositions
              .filter(p => p.symbol === activeInstrument.symbol)
              .map(p => ({ id: p._id, price: p.entryPrice, side: p.side }))}
          />
        </div>

        {/* ── Order panel + mini watchlist ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order panel */}
          {activeSession ? (
            <div className="lg:col-span-2 p-4 md:p-5"
              style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
              <OrderPanel
                instrument={activeInstrument}
                price={livePrice}
                sessionId={activeSession._id}
                sessionType={stealth ? "live" : activeSession.type}
                balance={balance}
                onOrderPlaced={() => { fetchPositions(); refetchWallet(); }}
              />
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center p-8"
              style={{ background:"rgba(14,17,24,0.6)", border:"1px dashed rgba(37,45,61,0.4)", borderRadius:8 }}>
              <button onClick={() => setShowStartModal(true)}
                className="px-6 py-3 text-sm font-semibold rounded"
                style={{ background:"rgba(16,212,142,0.1)", border:"1px solid rgba(16,212,142,0.3)", color:"#10d48e" }}>
                Start a session to trade
              </button>
            </div>
          )}

          {/* Mini watchlist — horizontal scroll on mobile, vertical on desktop */}
          <div style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8, padding:12 }}>
            <div className="text-xs font-bold tracking-widest uppercase mb-3 px-1" style={{ color:"#6b7a8d" }}>Watchlist</div>
            {/* Mobile: horizontal scroll row; desktop: vertical list */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:overflow-x-visible lg:max-h-96 lg:overflow-y-auto">
              {INSTRUMENTS.map(inst => {
                const pd  = watchlist[inst.base];
                const sel = selectedBase === inst.base;
                const chg = pd?.change24h ?? 0;
                return (
                  <button key={inst.base} onClick={() => setSelectedBase(inst.base)}
                    className="flex-shrink-0 lg:flex-shrink lg:w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all text-left"
                    style={{
                      minWidth: 120,
                      background: sel?"rgba(16,212,142,0.08)":"rgba(37,45,61,0.25)",
                      border: sel?"1px solid rgba(16,212,142,0.3)":"1px solid rgba(37,45,61,0.4)",
                    }}>
                    <div>
                      <div className="text-xs font-bold whitespace-nowrap" style={{ color: sel?"#10d48e":"#9fa8b4" }}>{inst.base}</div>
                      <div className="text-xs" style={{ color: chg>=0?"#10d48e":"#ef4444" }}>{chg>=0?"+":""}{chg.toFixed(1)}%</div>
                    </div>
                    <div className="text-xs font-mono font-bold ml-2 whitespace-nowrap" style={{ color: sel?"#f0ede8":"#6b7a8d" }}>
                      {pd ? formatPrice(pd.price) : "—"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Positions table ── */}
        {activeSession && (
          <PositionsTable
            sessionId={activeSession._id}
            prices={priceMap}
            onRefresh={() => { fetchPositions(); refetchWallet(); refetchSessions(); }}
            positions={openPositions}
            history={closedPositions}
            onToast={addToast}
          />
        )}

        {/* ── Price alerts ── */}
        <PriceAlerts prices={priceMap} onToast={addToast} />
      </div>

      {/* New session modal */}
      <AnimatePresence>
        {showStartModal && <StartModal wallet={wallet} starting={startLoading} error={startError}
          onStart={startSession} onClose={() => setShowStartModal(false)}/>}
      </AnimatePresence>

      {/* Toast notifications */}
      <ToastNotifications toasts={toasts} onDismiss={dismiss}/>
    </div>
  );
}

/* ── Start session modal ─────────────────────────────────────────────────── */
function StartModal({ wallet, starting, error, onStart, onClose }: {
  wallet: WalletData | null; starting: boolean; error: string;
  onStart: (t:"demo"|"live") => void; onClose: () => void;
}) {
  return (
    <>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50" style={{ background:"rgba(4,5,7,0.85)", backdropFilter:"blur(8px)" }}
        onClick={onClose}/>
      {/* Centering shell */}
      <div style={{ position:"fixed", inset:0, zIndex:51, display:"flex", alignItems:"center", justifyContent:"center", padding:16, pointerEvents:"none" }}>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
          style={{ pointerEvents:"auto", width:"100%", maxWidth:420, background:"rgba(13,15,20,0.98)", border:"1px solid rgba(37,45,61,0.5)", borderRadius:12, padding:28 }}>
          <h2 className="text-xl font-bold mb-2" style={{ color:"#f0ede8" }}>Start a Trade</h2>
          <p className="text-sm mb-6" style={{ color:"#6b7a8d" }}>Choose your account type.</p>
          {error && <div className="mb-4 px-4 py-3 text-sm rounded" style={{ background:"rgba(239,68,68,0.08)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.2)" }}>{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onStart("demo")} disabled={starting}
              className="flex flex-col items-center gap-2 p-5 rounded-lg"
              style={{ border:"1px solid rgba(0,188,212,0.3)", background:"rgba(0,188,212,0.05)", minHeight:"unset" }}>
              <div className="text-2xl" style={{ color:"#00bcd4" }}>◎</div>
              <div className="font-bold text-sm" style={{ color:"#f0ede8" }}>Demo</div>
              <div className="text-xs" style={{ color:"#4a5568" }}>Paper money</div>
              <div className="text-xs font-mono font-bold" style={{ color:"#00bcd4" }}>
                ${(wallet?.demoBalance ?? 0).toLocaleString()}
              </div>
            </button>
            <button onClick={() => onStart("live")} disabled={starting}
              className="flex flex-col items-center gap-2 p-5 rounded-lg"
              style={{ border:"1px solid rgba(16,212,142,0.3)", background:"rgba(16,212,142,0.05)", minHeight:"unset" }}>
              <div className="text-2xl" style={{ color:"#10d48e" }}>$</div>
              <div className="font-bold text-sm" style={{ color:"#f0ede8" }}>Live</div>
              <div className="text-xs" style={{ color:"#4a5568" }}>Real funds</div>
              <div className="text-xs font-mono font-bold" style={{ color: (wallet?.liveBalance??0)>0?"#10d48e":"#ef4444" }}>
                ${(wallet?.liveBalance ?? 0).toLocaleString()}
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
