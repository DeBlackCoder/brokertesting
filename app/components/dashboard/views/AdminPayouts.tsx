"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPost } from "@/lib/useApi";
import { ErrorState } from "../Skeleton";

/* ── types ────────────────────────────────────────────────── */
interface PayoutUser { email: string; firstName: string; lastName: string; }
interface Payout {
  _id:             string;
  userId:          PayoutUser | string;
  amount:          number;
  method:          string;
  methodDetails?:  string;
  status:          string;
  rejectionReason?:string;
  createdAt:       string;
  paidAt?:         string;
}
interface PayoutsData {
  payouts:      Payout[];
  total:        number;
  page:         number;
  pages:        number;
  totalPending: number;
  totalPaid:    number;
}
interface Deposit {
  walletId:  string;
  userId:    string;
  userEmail: string;
  userName:  string;
  txId:      string;
  amount:    number;
  txHash?:   string;
  note:      string;
  createdAt: string;
}

/* ── helpers ──────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, { color:string; bg:string }> = {
  pending:      { color:"#c9a84c", bg:"rgba(201,168,76,0.12)"  },
  under_review: { color:"#00bcd4", bg:"rgba(0,188,212,0.12)"   },
  paid:         { color:"#10d48e", bg:"rgba(16,212,142,0.12)"  },
  rejected:     { color:"#ef4444", bg:"rgba(239,68,68,0.12)"   },
};
const inp: React.CSSProperties = {
  background:"rgba(37,45,61,0.25)", border:"1px solid rgba(37,45,61,0.5)",
  borderRadius:4, color:"#f0ede8", padding:"9px 12px", fontSize:"0.8rem", outline:"none", width:"100%",
};
const fG = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor="rgba(16,212,142,0.4)");
const bG = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)");

function userName(u: PayoutUser | string): string {
  if (typeof u === "string") return u;
  return `${u.firstName} ${u.lastName} · ${u.email}`;
}

/* ── main ─────────────────────────────────────────────────── */
export default function AdminPayouts() {
  const [tab, setTab] = useState<"payouts"|"deposits"|"broadcast">("payouts");

  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>
          Finance & Comms
        </h1>
        <p className="text-xs mt-1" style={{ color:"#4a5568" }}>
          Manage payout requests, confirm deposits, and broadcast messages.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background:"rgba(37,45,61,0.3)", width:"fit-content" }}>
        {([
          ["payouts",   "💸 Payouts"      ],
          ["deposits",  "📥 Deposits"     ],
          ["broadcast", "📣 Broadcast"    ],
        ] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 text-xs font-semibold rounded-md transition-all"
            style={{
              background: tab===id ? "rgba(16,212,142,0.15)" : "transparent",
              color:      tab===id ? "#10d48e" : "#6b7a8d",
              border:     tab===id ? "1px solid rgba(16,212,142,0.3)" : "1px solid transparent",
            }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "payouts"   && <PayoutsTab/>}
      {tab === "deposits"  && <DepositsTab/>}
      {tab === "broadcast" && <BroadcastTab/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAYOUTS TAB
═══════════════════════════════════════════════════════════ */
function PayoutsTab() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState<Payout | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [saving,       setSaving]       = useState(false);
  const [feedback,     setFeedback]     = useState<{text:string;ok:boolean}|null>(null);

  const q = new URLSearchParams({ page:String(page), limit:"20" });
  if (statusFilter) q.set("status", statusFilter);

  const { data, loading, error, refetch } =
    useApi<PayoutsData>(`/api/admin/payouts?${q}`, [statusFilter, page]);

  const action = async (status: string) => {
    if (!selected) return;
    setSaving(true); setFeedback(null);
    const token = localStorage.getItem("aurex_token") ?? "";
    const res = await fetch(`/api/admin/payouts/${selected._id}`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ status, rejectionReason: rejectReason }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setFeedback({ text:json.error??"Failed", ok:false }); return; }
    setFeedback({ text:json.data?.message??"Done", ok:true });
    setSelected(null); setRejectReason("");
    refetch();
  };

  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  return (
    <>
      {/* Summary */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { l:"Pending Value",    v:`$${data.totalPending.toLocaleString()}`, c:"#c9a84c" },
            { l:"Total Paid Out",   v:`$${data.totalPaid.toLocaleString()}`,    c:"#10d48e" },
            { l:"Total Requests",   v:String(data.total),                        c:"#f0ede8" },
          ].map(s => (
            <div key={s.l} className="p-4 rounded" style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)" }}>
              <div className="text-xs mb-1" style={{ color:"#4a5568" }}>{s.l}</div>
              <div className="text-xl font-bold" style={{ color:s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["","pending","under_review","paid","rejected"].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded font-semibold"
            style={{
              background: statusFilter===s ? "rgba(16,212,142,0.12)" : "rgba(37,45,61,0.3)",
              color:      statusFilter===s ? "#10d48e" : "#6b7a8d",
              border:     statusFilter===s ? "1px solid rgba(16,212,142,0.3)" : "1px solid rgba(37,45,61,0.4)",
            }}>
            {s ? s.replace("_"," ") : "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8, overflow:"hidden" }}>
        {loading ? (
          <div className="p-8 text-center text-xs" style={{ color:"#4a5568" }}>Loading…</div>
        ) : !data?.payouts.length ? (
          <div className="p-8 text-center text-xs" style={{ color:"#4a5568" }}>No payouts found.</div>
        ) : (
          <table className="w-full" style={{ minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(37,45,61,0.4)" }}>
                {["User","Amount","Method","Status","Requested",""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color:"#4a5568" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.payouts.map((p,i) => {
                const s = STATUS_STYLE[p.status] ?? STATUS_STYLE.pending;
                return (
                  <motion.tr key={p._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.025 }}
                    style={{ borderBottom:"1px solid rgba(37,45,61,0.2)" }}>
                    <td className="px-5 py-3">
                      <div className="text-xs font-semibold" style={{ color:"#f0ede8" }}>
                        {typeof p.userId === "object" ? `${p.userId.firstName} ${p.userId.lastName}` : "—"}
                      </div>
                      <div className="text-xs font-mono" style={{ color:"#4a5568" }}>
                        {typeof p.userId === "object" ? p.userId.email : String(p.userId)}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-bold font-mono text-sm" style={{ color:"#10d48e" }}>
                      ${p.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color:"#9fa8b4" }}>
                      <div>{p.method}</div>
                      {p.methodDetails && <div style={{ color:"#4a5568" }}>{p.methodDetails.slice(0,24)}…</div>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-bold capitalize"
                        style={{ background:s.bg, color:s.color }}>
                        {p.status.replace("_"," ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color:"#4a5568" }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {p.status !== "paid" && p.status !== "rejected" && (
                        <button onClick={() => { setSelected(p); setRejectReason(""); setFeedback(null); }}
                          className="text-xs px-3 py-1.5 rounded font-semibold"
                          style={{ background:"rgba(37,45,61,0.3)", color:"#9fa8b4", border:"1px solid rgba(37,45,61,0.5)" }}>
                          Review →
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color:"#4a5568" }}>Page {data.page} of {data.pages}</span>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}
              className="text-xs px-3 py-1.5 rounded"
              style={{ border:"1px solid rgba(37,45,61,0.5)", color:"#6b7a8d", opacity:page<=1?0.4:1 }}>← Prev</button>
            <button disabled={page>=(data.pages??1)} onClick={()=>setPage(p=>p+1)}
              className="text-xs px-3 py-1.5 rounded"
              style={{ border:"1px solid rgba(37,45,61,0.5)", color:"#6b7a8d", opacity:page>=(data.pages??1)?0.4:1 }}>Next →</button>
          </div>
        </div>
      )}

      {/* Review modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{ position:"fixed",inset:0,zIndex:9998,background:"rgba(4,5,7,0.88)",backdropFilter:"blur(8px)" }}
              onClick={()=>setSelected(null)}/>
            <div style={{ position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,pointerEvents:"none" }}>
              <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
                transition={{type:"spring",stiffness:320,damping:28}}
                style={{ pointerEvents:"auto",width:"100%",maxWidth:480,background:"rgba(13,15,20,0.99)",border:"1px solid rgba(37,45,61,0.55)",borderRadius:12,boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid rgba(37,45,61,0.4)" }}>
                  <h3 className="font-bold" style={{ color:"#f0ede8" }}>Review Payout</h3>
                  <button onClick={()=>setSelected(null)} style={{ color:"#4a5568",fontSize:22,lineHeight:1 }}>×</button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["User",   userName(selected.userId)],
                      ["Amount", `$${selected.amount.toLocaleString()}`],
                      ["Method", selected.method],
                      ["Details",selected.methodDetails||"—"],
                      ["Status", selected.status],
                      ["Date",   new Date(selected.createdAt).toLocaleDateString()],
                    ].map(([l,v])=>(
                      <div key={l} className="p-3 rounded" style={{ background:"rgba(37,45,61,0.2)" }}>
                        <div className="text-xs mb-0.5" style={{ color:"#4a5568" }}>{l}</div>
                        <div className="text-xs font-semibold capitalize" style={{ color:"#f0ede8" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>Rejection reason (if rejecting)</label>
                    <input type="text" value={rejectReason} onChange={e=>setRejectReason(e.target.value)}
                      placeholder="Optional reason for user…" style={inp} onFocus={fG} onBlur={bG}/>
                  </div>
                  {feedback && (
                    <div className="px-3 py-2 text-xs rounded" style={{
                      background:feedback.ok?"rgba(16,212,142,0.08)":"rgba(239,68,68,0.08)",
                      color:feedback.ok?"#10d48e":"#ef4444",
                      border:`1px solid ${feedback.ok?"rgba(16,212,142,0.2)":"rgba(239,68,68,0.2)"}`,
                    }}>
                      {feedback.text}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={()=>action("under_review")} disabled={saving}
                      className="flex-1 py-2.5 text-xs font-bold rounded"
                      style={{ background:"rgba(0,188,212,0.1)",color:"#00bcd4",border:"1px solid rgba(0,188,212,0.3)" }}>
                      Under Review
                    </button>
                    <button onClick={()=>action("paid")} disabled={saving}
                      className="flex-1 py-2.5 text-xs font-bold rounded"
                      style={{ background:"rgba(16,212,142,0.12)",color:"#10d48e",border:"1px solid rgba(16,212,142,0.3)" }}>
                      Mark Paid ✓
                    </button>
                    <button onClick={()=>action("rejected")} disabled={saving}
                      className="flex-1 py-2.5 text-xs font-bold rounded"
                      style={{ background:"rgba(239,68,68,0.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.25)" }}>
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   DEPOSITS TAB
═══════════════════════════════════════════════════════════ */
function DepositsTab() {
  const { data: deposits, loading, error, refetch } = useApi<Deposit[]>("/api/admin/deposits");
  const [processing, setProcessing] = useState<string|null>(null);
  const [rejectNote, setRejectNote] = useState<Record<string,string>>({});
  const [results,    setResults]    = useState<Record<string,{text:string;ok:boolean}>>({});

  const act = async (dep: Deposit, action: "confirm"|"reject") => {
    setProcessing(dep.txId);
    const token = localStorage.getItem("aurex_token") ?? "";
    const res = await fetch("/api/admin/deposits", {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ walletId:dep.walletId, txId:dep.txId, action, note:rejectNote[dep.txId] }),
    });
    const json = await res.json();
    setProcessing(null);
    setResults(r => ({ ...r, [dep.txId]:{ text:json.data?.message??json.error??"Done", ok:res.ok } }));
    if (res.ok) refetch();
  };

  if (error)   return <ErrorState message={error} onRetry={refetch}/>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs" style={{ color:"#4a5568" }}>
          Pending deposits submitted by users awaiting confirmation.
        </p>
        <button onClick={refetch} className="text-xs px-3 py-1.5 rounded"
          style={{ border:"1px solid rgba(37,45,61,0.5)", color:"#6b7a8d" }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({length:4}).map((_,i)=>(
          <div key={i} className="h-16 animate-pulse rounded" style={{ background:"rgba(37,45,61,0.2)" }}/>
        ))}</div>
      ) : !deposits?.length ? (
        <div className="py-16 text-center">
          <div className="text-2xl mb-2">📥</div>
          <p className="text-xs" style={{ color:"#4a5568" }}>No pending deposits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deposits.map(dep => (
            <div key={dep.txId} className="p-4 rounded"
              style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-sm font-bold" style={{ color:"#f0ede8" }}>
                    ${dep.amount.toLocaleString()}
                    <span className="ml-2 text-xs font-normal" style={{ color:"#c9a84c" }}>pending</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color:"#6b7a8d" }}>
                    {dep.userName} · <span style={{ fontFamily:"var(--font-mono, JetBrains Mono, monospace)" }}>{dep.userEmail}</span>
                  </div>
                  {dep.txHash && (
                    <div className="text-xs mt-1 font-mono break-all" style={{ color:"#4a5568" }}>
                      TX: {dep.txHash}
                    </div>
                  )}
                  {dep.note && <div className="text-xs mt-1" style={{ color:"#4a5568" }}>{dep.note}</div>}
                  <div className="text-xs mt-1" style={{ color:"#4a5568" }}>
                    {new Date(dep.createdAt).toLocaleString()}
                  </div>
                </div>
                {results[dep.txId] ? (
                  <span className="text-xs px-3 py-1.5 rounded font-semibold"
                    style={{ background:results[dep.txId].ok?"rgba(16,212,142,0.1)":"rgba(239,68,68,0.1)", color:results[dep.txId].ok?"#10d48e":"#ef4444" }}>
                    {results[dep.txId].text}
                  </span>
                ) : (
                  <div className="flex flex-col gap-2 items-end">
                    <input type="text" placeholder="Reject note…"
                      value={rejectNote[dep.txId]??""} onChange={e=>setRejectNote(r=>({...r,[dep.txId]:e.target.value}))}
                      style={{ ...inp, width:180, padding:"6px 10px", fontSize:"0.75rem" }} onFocus={fG} onBlur={bG}/>
                    <div className="flex gap-2">
                      <button onClick={()=>act(dep,"confirm")} disabled={processing===dep.txId}
                        className="text-xs px-4 py-1.5 rounded font-bold"
                        style={{ background:"rgba(16,212,142,0.12)",color:"#10d48e",border:"1px solid rgba(16,212,142,0.3)" }}>
                        {processing===dep.txId?"…":"Confirm ✓"}
                      </button>
                      <button onClick={()=>act(dep,"reject")} disabled={processing===dep.txId}
                        className="text-xs px-4 py-1.5 rounded font-bold"
                        style={{ background:"rgba(239,68,68,0.08)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.2)" }}>
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BROADCAST TAB
═══════════════════════════════════════════════════════════ */
function BroadcastTab() {
  const [title,      setTitle]      = useState("");
  const [message,    setMessage]    = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [sending,    setSending]    = useState(false);
  const [result,     setResult]     = useState<{text:string;ok:boolean}|null>(null);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true); setResult(null);
    const { data, error } = await apiPost<{ sent:number; message:string }>("/api/admin/broadcast", {
      title, message, targetRole: targetRole || undefined,
    });
    setSending(false);
    if (error) { setResult({ text:error, ok:false }); return; }
    setResult({ text:data?.message ?? "Sent!", ok:true });
    setTitle(""); setMessage(""); setTargetRole("");
  };

  return (
    <div className="max-w-lg space-y-5">
      <div className="p-5 rounded" style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)" }}>
        <h2 className="text-sm font-bold mb-1" style={{ color:"#f0ede8" }}>Broadcast Notification</h2>
        <p className="text-xs mb-5" style={{ color:"#4a5568" }}>
          Send an in-app notification to all users or a specific role. It appears in every recipient's notification bell immediately.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>Target Audience</label>
            <select value={targetRole} onChange={e=>setTargetRole(e.target.value)}
              style={{ ...inp, appearance:"none" }} onFocus={fG} onBlur={bG}>
              <option value="">Everyone (all users)</option>
              <option value="user">Regular users only</option>
              <option value="admin">Admins only</option>
              <option value="super_admin">Super admins only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>Title *</label>
            <input value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="e.g. Platform maintenance, New feature…"
              style={inp} onFocus={fG} onBlur={bG}/>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>Message *</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)}
              placeholder="Write your broadcast message…" rows={4}
              style={{ ...inp, resize:"none" }} onFocus={fG} onBlur={bG}/>
          </div>

          {result && (
            <div className="px-3 py-2.5 text-xs rounded" style={{
              background:result.ok?"rgba(16,212,142,0.08)":"rgba(239,68,68,0.08)",
              color:result.ok?"#10d48e":"#ef4444",
              border:`1px solid ${result.ok?"rgba(16,212,142,0.2)":"rgba(239,68,68,0.2)"}`,
            }}>
              {result.ok?"✓ ":"✗ "}{result.text}
            </div>
          )}

          <button onClick={send} disabled={sending||!title.trim()||!message.trim()}
            className="w-full py-3 text-sm font-bold rounded"
            style={{
              background: sending||!title.trim()||!message.trim() ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)",
              color:      sending||!title.trim()||!message.trim() ? "#6b7a8d" : "#040507",
            }}>
            {sending ? "Sending…" : "📣 Send Broadcast"}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="px-4 py-3 rounded text-xs flex items-start gap-2"
        style={{ background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.15)", color:"#c9a84c" }}>
        <span>⚠</span>
        <span>Broadcasts are sent immediately and cannot be recalled. All recipients will see the message in their notification bell.</span>
      </div>
    </div>
  );
}
