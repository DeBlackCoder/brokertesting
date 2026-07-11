"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApi, apiPatch } from "@/lib/useApi";

interface Profile {
  firstName:  string;
  lastName:   string;
  email:      string;
  phone:      string;
  country:    string;
  role:       string;
  kycStatus:  string;
  mfaEnabled: boolean;
  createdAt:  string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      className="p-4 md:p-6" style={{ background:"rgba(14,17,24,0.8)", border:"1px solid rgba(37,45,61,0.45)", borderRadius:8 }}>
      <h2 className="text-sm font-bold mb-4 md:mb-5" style={{ color:"#f0ede8" }}>{title}</h2>
      {children}
    </motion.div>
  );
}

function Field({ label, sub, children }: { label:string; sub?:string; children:React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid rgba(37,45,61,0.25)" }}>
      <div>
        <div className="text-sm" style={{ color:"#f0ede8" }}>{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color:"#4a5568" }}>{sub}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        position:        "relative",
        display:         "inline-flex",
        alignItems:      "center",
        width:           44,
        height:          24,
        borderRadius:    12,
        border:          "none",
        cursor:          "pointer",
        flexShrink:      0,
        background:      on ? "#10d48e" : "rgba(37,45,61,0.6)",
        transition:      "background 0.2s",
        padding:         0,
      }}
      aria-checked={on}
      role="switch"
    >
      <motion.div
        style={{ position:"absolute", top:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }}
        animate={{ left: on ? 23 : 3 }}
        transition={{ type:"spring", stiffness:500, damping:30 }}
      />
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  background:"rgba(37,45,61,0.25)", border:"1px solid rgba(37,45,61,0.5)",
  borderRadius:4, color:"#f0ede8", padding:"8px 12px", fontSize:"0.8rem",
  outline:"none", width:220,
};
const onF = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = "rgba(16,212,142,0.5)");
const onB = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)");

function Alert({ msg, ok: isOk }: { msg:string; ok:boolean }) {
  return (
    <div className="mt-3 px-3 py-2 text-xs rounded" style={{
      background: isOk ? "rgba(16,212,142,0.08)" : "rgba(239,68,68,0.08)",
      color:      isOk ? "#10d48e" : "#ef4444",
      border:     `1px solid ${isOk ? "rgba(16,212,142,0.2)" : "rgba(239,68,68,0.2)"}`,
    }}>{msg}</div>
  );
}

export default function DashSettings() {
  const { data: profile, loading, refetch } = useApi<Profile>("/api/user/profile");

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [country,   setCountry]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState<{text:string;ok:boolean}|null>(null);

  // Password fields
  const [curPwd,   setCurPwd]   = useState("");
  const [newPwd,   setNewPwd]   = useState("");
  const [confPwd,  setConfPwd]  = useState("");
  const [pwdSaving,setPwdSave]  = useState(false);
  const [pwdMsg,   setPwdMsg]   = useState<{text:string;ok:boolean}|null>(null);

  // Notifications prefs (client-only state for now)
  const [notif, setNotif] = useState({ email:true, pnl:true, news:false, payout:true });

  // Seed form from loaded profile
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhone(profile.phone ?? "");
    setCountry(profile.country ?? "");
  }, [profile]);

  const saveProfile = async () => {
    setSaving(true); setSaveMsg(null);
    const { error } = await apiPatch("/api/user/profile", { firstName, lastName, phone, country });
    setSaving(false);
    if (error) { setSaveMsg({ text: error, ok: false }); return; }
    setSaveMsg({ text: "Profile updated successfully.", ok: true });
    refetch();
    setTimeout(() => setSaveMsg(null), 4000);
  };

  const savePassword = async () => {
    if (!curPwd || !newPwd) { setPwdMsg({ text:"All password fields are required.", ok:false }); return; }
    if (newPwd !== confPwd) { setPwdMsg({ text:"New passwords do not match.", ok:false }); return; }
    if (newPwd.length < 8)  { setPwdMsg({ text:"Password must be at least 8 characters.", ok:false }); return; }
    setPwdSave(true); setPwdMsg(null);
    const { error } = await apiPatch("/api/user/password", { currentPassword: curPwd, newPassword: newPwd });
    setPwdSave(false);
    if (error) { setPwdMsg({ text: error, ok: false }); return; }
    setPwdMsg({ text: "Password changed successfully.", ok: true });
    setCurPwd(""); setNewPwd(""); setConfPwd("");
    setTimeout(() => setPwdMsg(null), 4000);
  };

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl">
        {Array.from({ length:3 }).map((_,i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg" style={{ background:"rgba(37,45,61,0.2)" }}/>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color:"#f0ede8", letterSpacing:"-0.02em" }}>Settings</h1>
        <p className="text-xs mt-1" style={{ color:"#4a5568" }}>Manage your account preferences and security.</p>
      </div>

      {/* ── Profile ── */}
      <Section title="Profile">
        <Field label="Email Address" sub="Your sign-in email — cannot be changed">
          <div className="text-sm font-mono px-3 py-2 rounded"
            style={{ background:"rgba(37,45,61,0.2)", color:"#6b7a8d", width:220 }}>
            {profile?.email ?? "—"}
          </div>
        </Field>
        <Field label="First Name">
          <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} onFocus={onF} onBlur={onB}/>
        </Field>
        <Field label="Last Name">
          <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} onFocus={onF} onBlur={onB}/>
        </Field>
        <Field label="Phone Number" sub="Used for account verification">
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" style={inputStyle} onFocus={onF} onBlur={onB}/>
        </Field>
        <Field label="Country">
          <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inputStyle, appearance:"none" }} onFocus={onF} onBlur={onB}>
            <option value="">Select country</option>
            {["United States","United Kingdom","Canada","Australia","Germany","France","Nigeria","UAE","Singapore","India","Brazil","South Africa","Other"].map(c => (
              <option key={c} value={c} style={{ background:"#0e1118" }}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveProfile} disabled={saving}
            className="px-5 py-2 text-sm font-semibold rounded"
            style={{ background: saving ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)", color: saving ? "#6b7a8d" : "#040507" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background:"rgba(37,45,61,0.3)", color:"#6b7a8d" }}>
              KYC: {profile?.kycStatus ?? "—"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-semibold capitalize" style={{ background:"rgba(16,212,142,0.08)", color:"#10d48e" }}>
              {profile?.role ?? "user"}
            </span>
          </div>
        </div>
        {saveMsg && <Alert msg={saveMsg.text} ok={saveMsg.ok}/>}
      </Section>

      {/* ── Security ── */}
      <Section title="Security">
        <Field label="Change Password" sub="Last changed: we don't track this for privacy">
          <span/>
        </Field>
        <div className="space-y-3 pt-3">
          {[
            { label:"Current Password", val:curPwd, set:setCurPwd },
            { label:"New Password",     val:newPwd, set:setNewPwd },
            { label:"Confirm New",      val:confPwd, set:setConfPwd },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs mb-1.5" style={{ color:"#6b7a8d" }}>{f.label}</label>
              <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
                style={{ ...inputStyle, width:"100%" }} onFocus={onF} onBlur={onB}/>
            </div>
          ))}
          <button onClick={savePassword} disabled={pwdSaving}
            className="px-5 py-2 text-sm font-semibold rounded mt-1"
            style={{ background: pwdSaving ? "rgba(37,45,61,0.4)" : "rgba(239,68,68,0.12)", color: pwdSaving ? "#6b7a8d" : "#ef4444", border:"1px solid rgba(239,68,68,0.25)" }}>
            {pwdSaving ? "Updating…" : "Update Password"}
          </button>
          {pwdMsg && <Alert msg={pwdMsg.text} ok={pwdMsg.ok}/>}
        </div>
      </Section>

      {/* ── Notifications ── */}
      <Section title="Notification Preferences">
        {[
          { key:"email",  label:"Email Notifications",  sub:"Important account updates sent to your email" },
          { key:"pnl",    label:"Daily PnL Report",      sub:"End-of-day summary of your trading activity"  },
          { key:"news",   label:"Market Intelligence",   sub:"Daily market outlook and signal alerts"        },
          { key:"payout", label:"Payout Alerts",         sub:"Notified when a payout is processed"          },
        ].map(n => (
          <Field key={n.key} label={n.label} sub={n.sub}>
            <Toggle on={notif[n.key as keyof typeof notif]} onChange={v => setNotif(p => ({ ...p, [n.key]: v }))}/>
          </Field>
        ))}
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone">
        <Field label="Close Account" sub="Permanently close your AUREX account. Irreversible.">
          <button className="text-xs px-3 py-1.5 rounded font-semibold"
            style={{ border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", background:"rgba(239,68,68,0.06)" }}>
            Close Account
          </button>
        </Field>
      </Section>
    </div>
  );
}
