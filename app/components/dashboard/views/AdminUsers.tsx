"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPatch } from "@/lib/useApi";
import { useAuth } from "@/lib/useAuth";
import { ErrorState } from "../Skeleton";

/* ── types ─────────────────────────────────────────────────── */
interface User {
  _id:           string;
  email:         string;
  firstName:     string;
  lastName:      string;
  role:          string;
  kycStatus:     string;
  isActive:      boolean;
  emailVerified: boolean;
  accountType:   string;
  phone?:        string;
  country?:      string;
  createdAt:     string;
  lastLoginAt?:  string;
}
interface UsersData { users: User[]; total: number; page: number; pages: number; }

/* ── colour maps ─────────────────────────────────────────────── */
const KYC_STYLE: Record<string, { color: string; bg: string }> = {
  pending:      { color:"#6b7a8d", bg:"rgba(37,45,61,0.3)"          },
  under_review: { color:"#00bcd4", bg:"rgba(0,188,212,0.1)"          },
  approved:     { color:"#10d48e", bg:"rgba(16,212,142,0.1)"         },
  rejected:     { color:"#ef4444", bg:"rgba(239,68,68,0.1)"          },
};
const ROLE_STYLE: Record<string, { color: string; bg: string }> = {
  user:        { color:"#9fa8b4",  bg:"rgba(37,45,61,0.4)"           },
  admin:       { color:"#c9a84c",  bg:"rgba(201,168,76,0.12)"        },
  super_admin: { color:"#10d48e",  bg:"rgba(16,212,142,0.12)"        },
};

/* ── helpers ─────────────────────────────────────────────────── */
const inp: React.CSSProperties = {
  background:"rgba(37,45,61,0.25)", border:"1px solid rgba(37,45,61,0.5)",
  borderRadius:4, color:"#f0ede8", padding:"9px 12px", fontSize:"0.8rem",
  outline:"none", width:"100%",
};
const focG = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = "rgba(16,212,142,0.4)");
const blrG = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) =>
  (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)");

function Badge({ label, style }: { label: string; style: { color:string; bg:string } }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded font-bold capitalize"
      style={{ background: style.bg, color: style.color }}>
      {label.replace(/_/g," ")}
    </span>
  );
}

function ActionBtn({
  label, onClick, disabled, color = "#9fa8b4", bg = "rgba(37,45,61,0.3)", border = "rgba(37,45,61,0.5)",
}: {
  label: string; onClick: () => void; disabled?: boolean;
  color?: string; bg?: string; border?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex-1 py-2 text-xs font-semibold rounded transition-all"
      style={{ background: bg, color, border:`1px solid ${border}`, opacity: disabled ? 0.5 : 1 }}>
      {label}
    </button>
  );
}

/* ── main ────────────────────────────────────────────────────── */
export default function AdminUsers() {
  const { isSuperAdmin } = useAuth();

  /* list state */
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [kycFilter,  setKycFilter]  = useState("");
  const [page,       setPage]       = useState(1);

  const params = new URLSearchParams({ page: String(page), limit:"20" });
  if (search)     params.set("search", search);
  if (roleFilter) params.set("role",   roleFilter);
  if (kycFilter)  params.set("kyc",    kycFilter);

  const { data, loading, error, refetch } =
    useApi<UsersData>(`/api/admin/users?${params}`, [search, roleFilter, kycFilter, page]);

  /* modal state */
  const [selected, setSelected] = useState<User | null>(null);
  const [saving,   setSaving]   = useState<string | null>(null); // key of operation in progress
  const [feedback, setFeedback] = useState<{ text:string; ok:boolean } | null>(null);

  /* message form */
  const [msgTitle,   setMsgTitle]   = useState("");
  const [msgBody,    setMsgBody]    = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const closeModal = () => { setSelected(null); setFeedback(null); setMsgTitle(""); setMsgBody(""); };

  /* generic patch */
  const patch = useCallback(async (key: string, body: Record<string, unknown>, successMsg: string) => {
    if (!selected) return;
    setSaving(key); setFeedback(null);
    const { error: err, data: d } = await apiPatch<User>(`/api/admin/users/${selected._id}`, body);
    setSaving(null);
    if (err) { setFeedback({ text: err, ok: false }); return; }
    setFeedback({ text: successMsg, ok: true });
    // Update selected user in place
    if (d) setSelected(d as unknown as User);
    refetch();
    setTimeout(() => setFeedback(null), 3500);
  }, [selected, refetch]);

  /* send notification */
  const sendNotification = async () => {
    if (!selected || !msgTitle.trim() || !msgBody.trim()) return;
    setSendingMsg(true); setFeedback(null);
    const token = localStorage.getItem("aurex_token") ?? "";
    const res   = await fetch(`/api/admin/notify/${selected._id}`, {
      method:  "POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body:    JSON.stringify({ title: msgTitle.trim(), message: msgBody.trim(), type:"system" }),
    });
    const json = await res.json();
    setSendingMsg(false);
    if (!res.ok) { setFeedback({ text: json.error ?? "Failed", ok: false }); return; }
    setFeedback({ text: "Notification sent to user.", ok: true });
    setMsgTitle(""); setMsgBody("");
    setTimeout(() => setFeedback(null), 3500);
  };

  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  const filterSel: React.CSSProperties = { ...inp, width:"auto", appearance:"none" };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Users</h1>
        <p className="text-xs mt-1" style={{ color:"#4a5568" }}>
          {data ? `${data.total} total` : "Loading…"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input placeholder="Search email or name…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inp, width:240 }}
          onFocus={focG} onBlur={blrG}/>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} style={filterSel}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select value={kycFilter} onChange={e => { setKycFilter(e.target.value); setPage(1); }} style={filterSel}>
          <option value="">All KYC</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto"
        style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
        {loading ? (
          <div className="p-10 text-center text-sm" style={{ color:"#4a5568" }}>Loading users…</div>
        ) : !data?.users.length ? (
          <div className="p-10 text-center text-sm" style={{ color:"#4a5568" }}>No users found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(37,45,61,0.4)" }}>
                {["User","Role","KYC","Status","Joined",""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color:"#4a5568" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users.map((u, i) => (
                <motion.tr key={u._id}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.025 }}
                  style={{ borderBottom:"1px solid rgba(37,45,61,0.2)" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background:"rgba(16,212,142,0.1)", color:"#10d48e" }}>
                        {(u.firstName?.[0] ?? u.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color:"#f0ede8" }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-xs font-mono" style={{ color:"#4a5568" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge label={u.role} style={ROLE_STYLE[u.role] ?? ROLE_STYLE.user}/>
                  </td>
                  <td className="px-5 py-3">
                    <Badge label={u.kycStatus.replace("_"," ")} style={KYC_STYLE[u.kycStatus] ?? KYC_STYLE.pending}/>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: u.isActive?"#10d48e":"#ef4444" }}/>
                      <span className="text-xs" style={{ color: u.isActive?"#10d48e":"#ef4444" }}>
                        {u.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color:"#4a5568" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelected(u)}
                      className="text-xs px-3 py-1.5 rounded font-semibold"
                      style={{ background:"rgba(37,45,61,0.3)", color:"#9fa8b4", border:"1px solid rgba(37,45,61,0.5)" }}
                      onMouseEnter={e => (e.currentTarget.style.background="rgba(16,212,142,0.08)")}
                      onMouseLeave={e => (e.currentTarget.style.background="rgba(37,45,61,0.3)")}>
                      Manage →
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color:"#4a5568" }}>Page {data.page} of {data.pages}</span>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={() => setPage(p=>p-1)}
              className="text-xs px-3 py-1.5 rounded"
              style={{ border:"1px solid rgba(37,45,61,0.5)", color:"#6b7a8d", opacity:page<=1?0.4:1 }}>← Prev</button>
            <button disabled={page>=data.pages} onClick={() => setPage(p=>p+1)}
              className="text-xs px-3 py-1.5 rounded"
              style={{ border:"1px solid rgba(37,45,61,0.5)", color:"#6b7a8d", opacity:page>=data.pages?0.4:1 }}>Next →</button>
          </div>
        </div>
      )}

      {/* ── User management modal ── */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:"fixed", inset:0, zIndex:9998, background:"rgba(4,5,7,0.88)", backdropFilter:"blur(8px)" }}
              onClick={closeModal}/>

            {/* Centering shell */}
            <div style={{
              position:"fixed", inset:0, zIndex:9999,
              display:"flex", alignItems:"center", justifyContent:"center",
              padding:16, pointerEvents:"none",
            }}>
              <motion.div
                initial={{ opacity:0, scale:0.95, y:20 }}
                animate={{ opacity:1, scale:1,    y:0  }}
                exit={{    opacity:0, scale:0.95, y:16 }}
                transition={{ type:"spring", stiffness:320, damping:28 }}
                style={{
                  pointerEvents:"auto",
                  width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto",
                  background:"rgba(13,15,20,0.99)",
                  border:"1px solid rgba(37,45,61,0.55)", borderRadius:12,
                  boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
                }}>

                {/* Sticky header */}
                <div className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom:"1px solid rgba(37,45,61,0.4)", position:"sticky", top:0, background:"rgba(13,15,20,0.98)", zIndex:1 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background:"rgba(16,212,142,0.12)", color:"#10d48e" }}>
                      {(selected.firstName?.[0] ?? selected.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold" style={{ color:"#f0ede8" }}>
                        {selected.firstName} {selected.lastName}
                      </div>
                      <div className="text-xs font-mono" style={{ color:"#4a5568" }}>{selected.email}</div>
                    </div>
                  </div>
                  <button onClick={closeModal} style={{ color:"#4a5568", fontSize:22, lineHeight:1 }}>×</button>
                </div>

                <div className="p-6 space-y-6">

                  {/* ── Info grid ── */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l:"Role",         v: selected.role.replace(/_/g," "),      s: ROLE_STYLE[selected.role] ?? ROLE_STYLE.user  },
                      { l:"KYC Status",   v: selected.kycStatus.replace(/_/g," "), s: KYC_STYLE[selected.kycStatus] ?? KYC_STYLE.pending },
                    ].map(item => (
                      <div key={item.l} className="p-3 rounded" style={{ background:"rgba(37,45,61,0.2)" }}>
                        <div className="text-xs mb-1" style={{ color:"#4a5568" }}>{item.l}</div>
                        <Badge label={item.v} style={item.s}/>
                      </div>
                    ))}
                    {[
                      { l:"Account Type", v: selected.accountType  },
                      { l:"Country",      v: selected.country || "—" },
                      { l:"Phone",        v: selected.phone    || "—" },
                      { l:"Email Verified", v: selected.emailVerified ? "✓ Yes" : "✗ No" },
                      { l:"Account Status", v: selected.isActive ? "Active" : "Suspended" },
                      { l:"Joined",         v: new Date(selected.createdAt).toLocaleDateString() },
                    ].map(item => (
                      <div key={item.l} className="p-3 rounded" style={{ background:"rgba(37,45,61,0.2)" }}>
                        <div className="text-xs mb-1" style={{ color:"#4a5568" }}>{item.l}</div>
                        <div className="text-sm font-semibold capitalize" style={{ color:"#f0ede8" }}>{item.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Feedback banner ── */}
                  <AnimatePresence>
                    {feedback && (
                      <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                        className="px-4 py-3 rounded text-xs"
                        style={{
                          background: feedback.ok ? "rgba(16,212,142,0.08)" : "rgba(239,68,68,0.08)",
                          color:      feedback.ok ? "#10d48e" : "#ef4444",
                          border:     `1px solid ${feedback.ok ? "rgba(16,212,142,0.25)" : "rgba(239,68,68,0.25)"}`,
                        }}>
                        {feedback.ok ? "✓ " : "✗ "}{feedback.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── KYC actions ── */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#6b7a8d" }}>
                      KYC Management
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <ActionBtn label="Approve KYC" disabled={saving==="kyc-approve" || selected.kycStatus==="approved"}
                        onClick={() => patch("kyc-approve", { kycStatus:"approved" }, "KYC approved.")}
                        color="#10d48e" bg="rgba(16,212,142,0.1)" border="rgba(16,212,142,0.3)"/>
                      <ActionBtn label="Under Review" disabled={saving==="kyc-review" || selected.kycStatus==="under_review"}
                        onClick={() => patch("kyc-review", { kycStatus:"under_review" }, "Status set to under review.")}
                        color="#00bcd4" bg="rgba(0,188,212,0.1)" border="rgba(0,188,212,0.3)"/>
                      <ActionBtn label="Reject KYC" disabled={saving==="kyc-reject" || selected.kycStatus==="rejected"}
                        onClick={() => patch("kyc-reject", { kycStatus:"rejected" }, "KYC rejected.")}
                        color="#ef4444" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.25)"/>
                      <ActionBtn label="Reset to Pending" disabled={saving==="kyc-reset" || selected.kycStatus==="pending"}
                        onClick={() => patch("kyc-reset", { kycStatus:"pending" }, "KYC reset to pending.")}
                        color="#6b7a8d" bg="rgba(37,45,61,0.3)" border="rgba(37,45,61,0.5)"/>
                    </div>
                  </div>

                  {/* ── Account actions ── */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#6b7a8d" }}>
                      Account Actions
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selected.isActive ? (
                        <ActionBtn label="Suspend Account" disabled={saving==="suspend"}
                          onClick={() => patch("suspend", { isActive:false }, "Account suspended.")}
                          color="#ef4444" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.25)"/>
                      ) : (
                        <ActionBtn label="Reactivate Account" disabled={saving==="activate"}
                          onClick={() => patch("activate", { isActive:true }, "Account reactivated.")}
                          color="#10d48e" bg="rgba(16,212,142,0.1)" border="rgba(16,212,142,0.3)"/>
                      )}
                      {!selected.emailVerified && (
                        <ActionBtn label="Force Verify Email" disabled={saving==="verify-email"}
                          onClick={() => patch("verify-email", { emailVerified:true }, "Email marked as verified.")}
                          color="#00bcd4" bg="rgba(0,188,212,0.08)" border="rgba(0,188,212,0.25)"/>
                      )}
                    </div>
                  </div>

                  {/* ── Role management — super_admin only ── */}
                  {isSuperAdmin && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color:"#c9a84c" }}>
                        Role Management
                        <span className="ml-2 text-xs font-normal normal-case" style={{ color:"#4a5568" }}>
                          (Super Admin only)
                        </span>
                      </div>
                      <p className="text-xs mb-3" style={{ color:"#4a5568" }}>
                        Current role: <Badge label={selected.role} style={ROLE_STYLE[selected.role] ?? ROLE_STYLE.user}/>
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {selected.role !== "user" && (
                          <ActionBtn label="Demote to User" disabled={saving==="role-user"}
                            onClick={() => patch("role-user", { role:"user" }, "User demoted to regular user.")}
                            color="#9fa8b4" bg="rgba(37,45,61,0.3)" border="rgba(37,45,61,0.5)"/>
                        )}
                        {selected.role !== "admin" && (
                          <ActionBtn label="Make Admin" disabled={saving==="role-admin"}
                            onClick={() => patch("role-admin", { role:"admin" }, "User promoted to admin.")}
                            color="#c9a84c" bg="rgba(201,168,76,0.1)" border="rgba(201,168,76,0.3)"/>
                        )}
                        {selected.role !== "super_admin" && (
                          <ActionBtn label="Make Super Admin" disabled={saving==="role-super"}
                            onClick={() => patch("role-super", { role:"super_admin" }, "User promoted to super admin.")}
                            color="#10d48e" bg="rgba(16,212,142,0.1)" border="rgba(16,212,142,0.3)"/>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Send notification ── */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#6b7a8d" }}>
                      Send Notification
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>Title *</label>
                        <input value={msgTitle} onChange={e => setMsgTitle(e.target.value)}
                          placeholder="e.g. Account update, Important notice…"
                          style={inp} onFocus={focG} onBlur={blrG}/>
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>Message *</label>
                        <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)}
                          placeholder="Write your message to this user…" rows={3}
                          style={{ ...inp, resize:"none" }}
                          onFocus={focG} onBlur={blrG}/>
                      </div>
                      <button onClick={sendNotification}
                        disabled={sendingMsg || !msgTitle.trim() || !msgBody.trim()}
                        className="px-5 py-2 text-xs font-semibold rounded"
                        style={{
                          background: sendingMsg ? "rgba(37,45,61,0.4)" : "rgba(0,188,212,0.1)",
                          color:      sendingMsg ? "#6b7a8d" : "#00bcd4",
                          border:     "1px solid rgba(0,188,212,0.25)",
                          opacity:    !msgTitle.trim() || !msgBody.trim() ? 0.5 : 1,
                        }}>
                        {sendingMsg ? "Sending…" : "Send Notification"}
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
