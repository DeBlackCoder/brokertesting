"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/useApi";

interface Bot {
  _id:        string;
  name:       string;
  description:string;
  price:      number;
  monthlyFee: number;
  risk:       string;
  features:   string[];
  returns:    string;
  badge:      string;
  status:     string;
  sortOrder:  number;
}

const RISK_STYLE: Record<string, { color:string; bg:string }> = {
  low:    { color:"#10d48e", bg:"rgba(16,212,142,0.1)" },
  medium: { color:"#c9a84c", bg:"rgba(201,168,76,0.1)" },
  high:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)"  },
};

const inp: React.CSSProperties = {
  background:"rgba(37,45,61,0.25)", border:"1px solid rgba(37,45,61,0.5)",
  borderRadius:4, color:"#f0ede8", padding:"9px 12px", fontSize:"0.8rem",
  outline:"none", width:"100%",
};
const focG = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor="rgba(16,212,142,0.4)");
const blrG = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor="rgba(37,45,61,0.5)");

export default function AdminBots() {
  const { data: bots, loading, refetch } = useApi<Bot[]>("/api/admin/bots");
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Bot | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState<{ text:string; ok:boolean } | null>(null);

  const emptyForm = { name:"", description:"", price:"", monthlyFee:"0", risk:"medium", returns:"", badge:"", sortOrder:"0", features:"" };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowForm(true); setMsg(null); };
  const openEdit   = (b: Bot) => {
    setForm({ name:b.name, description:b.description, price:String(b.price), monthlyFee:String(b.monthlyFee), risk:b.risk, returns:b.returns, badge:b.badge, sortOrder:String(b.sortOrder), features:b.features.join("\n") });
    setEditing(b);
    setShowForm(true);
    setMsg(null);
  };

  const save = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.price) {
      setMsg({ text:"Name, description and price are required.", ok:false }); return;
    }
    setSaving(true); setMsg(null);
    const token  = localStorage.getItem("aurex_token") ?? "";
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       Number(form.price),
      monthlyFee:  Number(form.monthlyFee || 0),
      risk:        form.risk,
      returns:     form.returns.trim(),
      badge:       form.badge.trim(),
      sortOrder:   Number(form.sortOrder || 0),
      features:    form.features.split("\n").map(s=>s.trim()).filter(Boolean),
    };
    const url    = editing ? `/api/admin/bots/${editing._id}` : "/api/admin/bots";
    const method = editing ? "PATCH" : "POST";
    const res    = await fetch(url, { method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body:JSON.stringify(payload) });
    const json   = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg({ text:json.error??"Failed", ok:false }); return; }
    setMsg({ text:editing?"Bot updated.":"Bot created.", ok:true });
    refetch();
    setTimeout(() => { setShowForm(false); setEditing(null); setMsg(null); }, 1800);
  };

  const toggleStatus = async (bot: Bot) => {
    const token  = localStorage.getItem("aurex_token") ?? "";
    await fetch(`/api/admin/bots/${bot._id}`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ status: bot.status==="active" ? "inactive" : "active" }),
    });
    refetch();
  };

  const deleteBot = async (id: string) => {
    const token = localStorage.getItem("aurex_token") ?? "";
    await fetch(`/api/admin/bots/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
    refetch();
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Trading Bots</h1>
          <p className="text-xs mt-1" style={{ color:"#4a5568" }}>Create and manage bot plans available for purchase.</p>
        </div>
        <button onClick={openCreate}
          className="text-xs px-4 py-2 rounded font-semibold"
          style={{ background:"rgba(16,212,142,0.1)", border:"1px solid rgba(16,212,142,0.3)", color:"#10d48e" }}>
          + New Bot
        </button>
      </div>

      {/* Bot cards */}
      {loading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-20 animate-pulse rounded" style={{background:"rgba(37,45,61,0.2)"}}/>)}</div>
      ) : !bots?.length ? (
        <div className="py-12 text-center text-sm" style={{ color:"#4a5568" }}>No bots yet. Create your first one.</div>
      ) : (
        <div className="space-y-3">
          {bots.map(bot => {
            const risk = RISK_STYLE[bot.risk] ?? RISK_STYLE.medium;
            return (
              <motion.div key={bot._id} initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="flex items-center justify-between gap-4 p-4 rounded-lg flex-wrap"
                style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background:"rgba(37,45,61,0.4)" }}>🤖</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color:"#f0ede8" }}>{bot.name}</span>
                      {bot.badge && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background:"rgba(201,168,76,0.12)", color:"#c9a84c" }}>{bot.badge}</span>}
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background:risk.bg, color:risk.color }}>{bot.risk}</span>
                      <span className="text-xs px-2 py-0.5 rounded capitalize"
                        style={{ background:bot.status==="active"?"rgba(16,212,142,0.1)":"rgba(37,45,61,0.3)", color:bot.status==="active"?"#10d48e":"#6b7a8d" }}>
                        {bot.status}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color:"#4a5568" }}>{bot.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <div className="text-sm font-bold font-mono" style={{ color:"#10d48e" }}>${bot.price.toLocaleString()}</div>
                  <button onClick={() => openEdit(bot)}
                    className="text-xs px-3 py-1.5 rounded"
                    style={{ background:"rgba(37,45,61,0.3)", color:"#9fa8b4", border:"1px solid rgba(37,45,61,0.5)" }}>
                    Edit
                  </button>
                  <button onClick={() => toggleStatus(bot)}
                    className="text-xs px-3 py-1.5 rounded"
                    style={{ background:bot.status==="active"?"rgba(239,68,68,0.08)":"rgba(16,212,142,0.08)", color:bot.status==="active"?"#ef4444":"#10d48e", border:`1px solid ${bot.status==="active"?"rgba(239,68,68,0.2)":"rgba(16,212,142,0.2)"}` }}>
                    {bot.status==="active"?"Disable":"Enable"}
                  </button>
                  <button onClick={() => deleteBot(bot._id)}
                    className="text-xs px-2.5 py-1.5 rounded"
                    style={{ background:"rgba(239,68,68,0.06)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.15)" }}>
                    ×
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{position:"fixed",inset:0,zIndex:9998,background:"rgba(4,5,7,0.88)",backdropFilter:"blur(8px)"}}
              onClick={() => { setShowForm(false); setEditing(null); }}/>
            <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,pointerEvents:"none"}}>
              <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
                style={{pointerEvents:"auto",width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",background:"rgba(13,15,20,0.99)",border:"1px solid rgba(37,45,61,0.55)",borderRadius:12,boxShadow:"0 32px 80px rgba(0,0,0,0.7)"}}>

                <div className="flex items-center justify-between px-6 py-4" style={{borderBottom:"1px solid rgba(37,45,61,0.4)",position:"sticky",top:0,background:"rgba(13,15,20,0.98)"}}>
                  <h3 className="font-bold" style={{color:"#f0ede8"}}>{editing?"Edit Bot":"Create New Bot"}</h3>
                  <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{color:"#4a5568",fontSize:22,lineHeight:1}}>×</button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Bot Name *</label>
                      <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Momentum Pro" style={inp} onFocus={focG} onBlur={blrG}/>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Price (USD) *</label>
                      <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="299" style={inp} onFocus={focG} onBlur={blrG}/>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Monthly Fee (0 = one-time)</label>
                      <input type="number" value={form.monthlyFee} onChange={e=>setForm(f=>({...f,monthlyFee:e.target.value}))} placeholder="0" style={inp} onFocus={focG} onBlur={blrG}/>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Risk Level</label>
                      <select value={form.risk} onChange={e=>setForm(f=>({...f,risk:e.target.value}))} style={{...inp,appearance:"none"}} onFocus={focG} onBlur={blrG}>
                        <option value="low" style={{background:"#0e1118"}}>Low Risk</option>
                        <option value="medium" style={{background:"#0e1118"}}>Medium Risk</option>
                        <option value="high" style={{background:"#0e1118"}}>High Risk</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Est. Returns</label>
                      <input value={form.returns} onChange={e=>setForm(f=>({...f,returns:e.target.value}))} placeholder="e.g. 8–14% monthly" style={inp} onFocus={focG} onBlur={blrG}/>
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Badge (optional)</label>
                      <input value={form.badge} onChange={e=>setForm(f=>({...f,badge:e.target.value}))} placeholder="Best Seller" style={inp} onFocus={focG} onBlur={blrG}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Description *</label>
                    <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Describe what this bot does…" style={{...inp,resize:"none"}} onFocus={focG} onBlur={blrG}/>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{color:"#6b7a8d"}}>Features <span style={{color:"#4a5568"}}>(one per line)</span></label>
                    <textarea value={form.features} onChange={e=>setForm(f=>({...f,features:e.target.value}))} rows={4} placeholder={"Trades BTC/ETH 24/7\nAuto stop-loss protection\nReal-time performance reports"} style={{...inp,resize:"none"}} onFocus={focG} onBlur={blrG}/>
                  </div>

                  {msg && (
                    <div className="px-3 py-2 text-xs rounded" style={{background:msg.ok?"rgba(16,212,142,0.08)":"rgba(239,68,68,0.08)",color:msg.ok?"#10d48e":"#ef4444",border:`1px solid ${msg.ok?"rgba(16,212,142,0.2)":"rgba(239,68,68,0.2)"}`}}>
                      {msg.ok?"✓ ":"✗ "}{msg.text}
                    </div>
                  )}

                  <button onClick={save} disabled={saving}
                    className="w-full py-3 text-sm font-bold rounded"
                    style={{background:saving?"rgba(37,45,61,0.4)":"linear-gradient(135deg,#10d48e,#00bcd4)",color:saving?"#6b7a8d":"#040507"}}>
                    {saving?"Saving…":editing?"Update Bot":"Create Bot"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
