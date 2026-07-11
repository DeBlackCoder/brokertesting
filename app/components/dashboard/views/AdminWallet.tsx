"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPatch } from "@/lib/useApi";
import { ErrorState } from "../Skeleton";

/* ── Types ─────────────────────────────────────────────────── */
interface WalletSettingsData { depositAddress: string; }

interface UserRow {
  _id:       string;
  email:     string;
  firstName: string;
  lastName:  string;
  role:      string;
  kycStatus: string;
  isActive:  boolean;
  createdAt: string;
}

interface UserWallet {
  liveBalance:  number;
  demoBalance:  number;
  transactions: {
    _id:       string;
    type:      string;
    amount:    number;
    status:    string;
    note?:     string;
    createdAt: string;
  }[];
}

type ActionType = "credit" | "debit" | "bonus";

/* ── helpers ────────────────────────────────────────────────── */
const TX_COLOR: Record<string, string> = {
  credit: "#10d48e", deposit: "#10d48e", bonus: "#c9a84c",
  debit: "#ef4444", withdrawal: "#ef4444", demo_topup: "#00bcd4",
};

const inp: React.CSSProperties = {
  background:"rgba(37,45,61,0.25)", border:"1px solid rgba(37,45,61,0.5)",
  borderRadius:4, color:"#f0ede8", padding:"10px 12px", fontSize:"0.8rem",
  outline:"none", width:"100%",
};
const focusGreen = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.currentTarget.style.borderColor = "rgba(16,212,142,0.4)");
const blurGreen  = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)");

/* ── Main component ─────────────────────────────────────────── */
export default function AdminWallet() {
  /* deposit address */
  const { data: settings, loading: sLoad, error: sErr, refetch: refetchSettings } =
    useApi<WalletSettingsData>("/api/admin/wallet-settings");
  const [address,    setAddress]    = useState("");
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrMsg,    setAddrMsg]    = useState("");

  /* user list */
  const [search,  setSearch]  = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: usersData, loading: uLoad, error: uErr, refetch: refetchUsers } =
    useApi<{ users: UserRow[]; total: number }>(`/api/admin/users?limit=100&search=${debouncedSearch}`, [debouncedSearch]);

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  /* selected user modal */
  const [selectedUser,   setSelectedUser]   = useState<UserRow | null>(null);
  const [walletData,     setWalletData]     = useState<UserWallet | null>(null);
  const [walletLoading,  setWalletLoading]  = useState(false);

  /* action form */
  const [actionType, setActionType] = useState<ActionType>("credit");
  const [amount,     setAmount]     = useState("");
  const [note,       setNote]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txMsg,      setTxMsg]      = useState<{ text: string; ok: boolean } | null>(null);

  /* load wallet when user is selected */
  const loadWallet = useCallback(async (userId: string) => {
    setWalletLoading(true);
    setWalletData(null);
    setTxMsg(null);
    setAmount(""); setNote(""); setActionType("credit");
    const token = localStorage.getItem("aurex_token") ?? "";
    const res   = await fetch(`/api/admin/wallet/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json  = await res.json();
    setWalletLoading(false);
    if (res.ok) setWalletData(json.data);
  }, []);

  const openModal = (user: UserRow) => {
    setSelectedUser(user);
    loadWallet(user._id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setWalletData(null);
    setTxMsg(null);
  };

  /* submit action */
  const submitTx = async () => {
    if (!selectedUser) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setTxMsg({ text:"Enter a valid amount.", ok: false }); return;
    }
    setSubmitting(true); setTxMsg(null);
    const token = localStorage.getItem("aurex_token") ?? "";
    const res   = await fetch(`/api/admin/wallet/${selectedUser._id}`, {
      method:  "PATCH",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body:    JSON.stringify({ action: actionType, amount: Number(amount), note }),
    });
    const json  = await res.json();
    setSubmitting(false);
    if (!res.ok) { setTxMsg({ text: json.error ?? "Failed", ok: false }); return; }
    setTxMsg({ text: json.data?.message ?? "Done", ok: true });
    setAmount(""); setNote("");
    loadWallet(selectedUser._id); // refresh wallet inside modal
    refetchUsers();
  };

  /* deposit address save */
  const saveAddress = async () => {
    if (!address.trim()) return;
    setSavingAddr(true); setAddrMsg("");
    const { error } = await apiPatch("/api/admin/wallet-settings", { depositAddress: address.trim() });
    setSavingAddr(false);
    setAddrMsg(error ?? "Deposit address updated.");
    if (!error) { setAddress(""); refetchSettings(); }
  };

  const users = usersData?.users ?? [];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Wallet Management</h1>
        <p className="text-xs mt-1" style={{ color:"#4a5568" }}>Manage deposit address, credit/debit users, and award trading bonuses.</p>
      </div>

      {/* ── Deposit address ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="p-5" style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
        <h2 className="text-sm font-bold mb-1" style={{ color:"#f0ede8" }}>Global Deposit Address</h2>
        <p className="text-xs mb-4" style={{ color:"#4a5568" }}>Shown to all users as the deposit destination.</p>
        {sErr && <ErrorState message={sErr}/>}
        {!sLoad && settings?.depositAddress && (
          <div className="px-4 py-3 rounded mb-4 font-mono text-xs break-all"
            style={{ background:"rgba(37,45,61,0.3)", color:"#10d48e", border:"1px solid rgba(37,45,61,0.5)" }}>
            Current: {settings.depositAddress}
          </div>
        )}
        <div className="flex gap-3">
          <input value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Enter new deposit address"
            style={{ ...inp, flex:1 }} onFocus={focusGreen} onBlur={blurGreen}/>
          <button onClick={saveAddress} disabled={savingAddr}
            className="px-5 py-2 text-sm font-semibold rounded shrink-0"
            style={{ background:"rgba(16,212,142,0.1)", color:"#10d48e", border:"1px solid rgba(16,212,142,0.3)" }}>
            {savingAddr ? "…" : "Save"}
          </button>
        </div>
        {addrMsg && (
          <p className="text-xs mt-2" style={{ color: addrMsg.includes("updated") ? "#10d48e" : "#ef4444" }}>
            {addrMsg}
          </p>
        )}
      </motion.div>

      {/* ── User list ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="p-5" style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>

        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-sm font-bold" style={{ color:"#f0ede8" }}>
            All Users
            {usersData && (
              <span className="ml-2 text-xs font-normal" style={{ color:"#4a5568" }}>
                ({usersData.total} total)
              </span>
            )}
          </h2>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ ...inp, width:220 }}
            onFocus={focusGreen} onBlur={blurGreen}/>
        </div>

        {uErr && <ErrorState message={uErr}/>}

        {uLoad ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded" style={{ background:"rgba(37,45,61,0.2)" }}/>
            ))}
          </div>
        ) : !users.length ? (
          <p className="text-sm text-center py-8" style={{ color:"#4a5568" }}>No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(37,45,61,0.4)" }}>
                  {["User","Email","Role","KYC","Status","Joined","Action"].map((h,i) => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold pr-4 whitespace-nowrap"
                      style={{ color:"#4a5568", paddingLeft: i===0?0:0 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u._id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.02 }}
                    style={{ borderBottom:"1px solid rgba(37,45,61,0.2)" }}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background:"rgba(16,212,142,0.1)", color:"#10d48e" }}>
                          {(u.firstName?.[0] ?? u.email[0]).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold" style={{ color:"#f0ede8" }}>
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs font-mono" style={{ color:"#6b7a8d" }}>{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs px-2 py-0.5 rounded font-bold capitalize"
                        style={{
                          background: u.role==="super_admin" ? "rgba(16,212,142,0.12)" : u.role==="admin" ? "rgba(201,168,76,0.12)" : "rgba(37,45,61,0.4)",
                          color:      u.role==="super_admin" ? "#10d48e"               : u.role==="admin" ? "#c9a84c"               : "#9fa8b4",
                        }}>
                        {u.role.replace("_"," ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs px-2 py-0.5 rounded capitalize"
                        style={{
                          background: u.kycStatus==="approved" ? "rgba(16,212,142,0.1)" : u.kycStatus==="rejected" ? "rgba(239,68,68,0.1)" : "rgba(201,168,76,0.1)",
                          color:      u.kycStatus==="approved" ? "#10d48e"              : u.kycStatus==="rejected" ? "#ef4444"             : "#c9a84c",
                        }}>
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: u.isActive ? "#10d48e" : "#ef4444" }}/>
                        <span className="text-xs" style={{ color: u.isActive ? "#10d48e" : "#ef4444" }}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color:"#4a5568" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <button onClick={() => openModal(u)}
                        className="text-xs px-3 py-1.5 rounded font-semibold transition-all"
                        style={{ background:"rgba(16,212,142,0.08)", color:"#10d48e", border:"1px solid rgba(16,212,142,0.25)" }}
                        onMouseEnter={e => (e.currentTarget.style.background="rgba(16,212,142,0.18)")}
                        onMouseLeave={e => (e.currentTarget.style.background="rgba(16,212,142,0.08)")}>
                        Manage Wallet
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── User wallet modal ── */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{
                position:       "fixed",
                inset:          0,
                zIndex:         9998,
                background:     "rgba(4,5,7,0.88)",
                backdropFilter: "blur(8px)",
              }}
              onClick={closeModal}/>

            {/* Full-screen flex centring shell — never transformed */}
            <div style={{
              position:       "fixed",
              inset:          0,
              zIndex:         9999,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              pointerEvents:  "none",   /* clicks fall through to backdrop */
              padding:        "16px",
            }}>
              {/* Animated card — pointerEvents re-enabled */}
              <motion.div
                initial={{ opacity:0, scale:0.95, y:24 }}
                animate={{ opacity:1, scale:1,    y:0  }}
                exit={{    opacity:0, scale:0.95, y:16 }}
                transition={{ type:"spring", stiffness:320, damping:28 }}
                style={{
                  pointerEvents: "auto",
                  width:         "100%",
                  maxWidth:      520,
                  maxHeight:     "88vh",
                  overflowY:     "auto",
                  background:    "rgba(13,15,20,0.99)",
                  border:        "1px solid rgba(37,45,61,0.55)",
                  borderRadius:  12,
                  boxShadow:     "0 32px 80px rgba(0,0,0,0.7)",
                }}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom:"1px solid rgba(37,45,61,0.4)", position:"sticky", top:0, background:"rgba(13,15,20,0.98)", zIndex:1 }}>
                <div>
                  <div className="font-bold" style={{ color:"#f0ede8" }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="text-xs font-mono mt-0.5" style={{ color:"#4a5568" }}>{selectedUser.email}</div>
                </div>
                <button onClick={closeModal} style={{ color:"#4a5568", fontSize:22, lineHeight:1 }}>×</button>
              </div>

              <div className="p-6 space-y-6">
                {/* Balances */}
                {walletLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[0,1].map(i => <div key={i} className="h-20 animate-pulse rounded" style={{ background:"rgba(37,45,61,0.2)" }}/>)}
                  </div>
                ) : walletData && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l:"Live Balance", v: walletData.liveBalance,  c:"#10d48e" },
                      { l:"Demo Balance", v: walletData.demoBalance,   c:"#00bcd4" },
                    ].map(b => (
                      <div key={b.l} className="p-4 rounded" style={{ background:"rgba(37,45,61,0.2)", border:"1px solid rgba(37,45,61,0.4)" }}>
                        <div className="text-xs mb-1" style={{ color:"#4a5568" }}>{b.l}</div>
                        <div className="text-2xl font-bold tabular-nums" style={{ color:b.c }}>
                          ${b.v.toLocaleString("en-US",{ minimumFractionDigits:2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Action form ── */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#6b7a8d" }}>
                    Wallet Action
                  </div>

                  {/* Action type pills */}
                  <div className="flex gap-2 mb-4">
                    {([
                      { id:"credit", label:"+ Credit",       color:"#10d48e", bg:"rgba(16,212,142,0.12)",  border:"rgba(16,212,142,0.35)" },
                      { id:"debit",  label:"− Debit",        color:"#ef4444", bg:"rgba(239,68,68,0.12)",   border:"rgba(239,68,68,0.35)"  },
                      { id:"bonus",  label:"🎁 Bonus",       color:"#c9a84c", bg:"rgba(201,168,76,0.12)",  border:"rgba(201,168,76,0.35)" },
                    ] as const).map(a => (
                      <button key={a.id} onClick={() => setActionType(a.id)}
                        className="flex-1 py-2 text-xs font-bold rounded transition-all"
                        style={{
                          background: actionType===a.id ? a.bg : "rgba(37,45,61,0.2)",
                          color:      actionType===a.id ? a.color : "#6b7a8d",
                          border:     actionType===a.id ? `1px solid ${a.border}` : "1px solid rgba(37,45,61,0.4)",
                        }}>
                        {a.label}
                      </button>
                    ))}
                  </div>

                  {/* Description of selected action */}
                  <div className="text-xs mb-4 px-3 py-2 rounded" style={{ background:"rgba(37,45,61,0.2)" }}>
                    {actionType === "credit" && <span style={{ color:"#10d48e" }}>Credits funds directly to the user's live wallet balance.</span>}
                    {actionType === "debit"  && <span style={{ color:"#ef4444" }}>Removes funds from the user's live wallet balance.</span>}
                    {actionType === "bonus"  && <span style={{ color:"#c9a84c" }}>Awards a trading bonus — appears as "Trading bonus gained" in the user's transaction history.</span>}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>Amount (USD) *</label>
                      <input type="number" placeholder="e.g. 500" value={amount} onChange={e => setAmount(e.target.value)}
                        style={inp} onFocus={focusGreen} onBlur={blurGreen}/>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>
                        Note {actionType==="bonus" ? <span style={{ color:"#4a5568" }}>(shown to user)</span> : <span style={{ color:"#4a5568" }}>(optional)</span>}
                      </label>
                      <input type="text"
                        placeholder={actionType==="bonus" ? "e.g. Welcome bonus, Referral reward…" : "Optional note"}
                        value={note} onChange={e => setNote(e.target.value)}
                        style={inp} onFocus={focusGreen} onBlur={blurGreen}/>
                    </div>
                  </div>

                  {txMsg && (
                    <div className="mt-3 px-3 py-2.5 text-xs rounded" style={{
                      background: txMsg.ok ? "rgba(16,212,142,0.08)" : "rgba(239,68,68,0.08)",
                      color:      txMsg.ok ? "#10d48e" : "#ef4444",
                      border:     `1px solid ${txMsg.ok ? "rgba(16,212,142,0.2)" : "rgba(239,68,68,0.2)"}`,
                    }}>
                      {txMsg.ok ? "✓ " : "✗ "}{txMsg.text}
                    </div>
                  )}

                  <button onClick={submitTx} disabled={submitting}
                    className="w-full mt-4 py-3 text-sm font-bold rounded"
                    style={{
                      background: submitting ? "rgba(37,45,61,0.4)"
                        : actionType==="credit" ? "linear-gradient(135deg,#10d48e,#00bcd4)"
                        : actionType==="debit"  ? "linear-gradient(135deg,#ef4444,#c0392b)"
                        : "linear-gradient(135deg,#c9a84c,#e6b84c)",
                      color: submitting ? "#6b7a8d" : "#040507",
                    }}>
                    {submitting ? "Processing…"
                      : actionType==="credit" ? `Credit $${amount||"0"}`
                      : actionType==="debit"  ? `Debit $${amount||"0"}`
                      : `Award $${amount||"0"} Bonus`}
                  </button>
                </div>

                {/* ── Recent transactions ── */}
                {walletData && walletData.transactions.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#6b7a8d" }}>
                      Recent Transactions
                    </div>
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {walletData.transactions.slice(0, 20).map(t => (
                        <div key={t._id} className="flex items-center justify-between px-3 py-2 rounded"
                          style={{ background:"rgba(37,45,61,0.2)" }}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs px-2 py-0.5 rounded capitalize shrink-0"
                              style={{ background:`${TX_COLOR[t.type]??="#6b7a8d"}18`, color: TX_COLOR[t.type]??"#9fa8b4" }}>
                              {t.type === "bonus" ? "🎁 bonus" : t.type.replace("_"," ")}
                            </span>
                            <span className="text-xs truncate" style={{ color:"#6b7a8d" }}>
                              {t.note ?? ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="font-mono text-xs font-bold"
                              style={{ color: ["debit","withdrawal"].includes(t.type) ? "#ef4444" : TX_COLOR[t.type]??"#9fa8b4" }}>
                              {["debit","withdrawal"].includes(t.type) ? "−" : "+"}${t.amount.toLocaleString()}
                            </span>
                            <span className="text-xs" style={{ color:"#4a5568" }}>
                              {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </div>{/* end centering shell */}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
