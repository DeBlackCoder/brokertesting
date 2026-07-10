"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, label: "Account Type"      },
  { id: 2, label: "Personal Info"     },
  { id: 3, label: "Financial Profile" },
  { id: 4, label: "Review"            },
];

const ACCOUNT_TYPES = [
  { id: "individual",   title: "Individual",   description: "For high-net-worth individuals trading their own capital.",             min: "$250,000",   badge: null          },
  { id: "institutional",title: "Institutional",description: "For hedge funds, family offices, and asset managers.",                 min: "$5,000,000",  badge: "Most Common" },
  { id: "corporate",    title: "Corporate",    description: "For trading companies, proprietary trading firms, and corporations.",  min: "$1,000,000",  badge: null          },
];

type FormData = {
  accountType: string;
  firstName: string; lastName: string; email: string; phone: string;
  country: string; dob: string;
  employmentStatus: string; annualIncome: string; netWorth: string;
  tradingExperience: string; sourceOfFunds: string;
};

type Screen = "form" | "otp" | "done";

function stepValid(step: number, form: FormData): { ok: boolean; hint: string } {
  switch (step) {
    case 1: return form.accountType ? { ok: true, hint: "" } : { ok: false, hint: "Please select an account type to continue." };
    case 2:
      if (!form.firstName.trim()) return { ok: false, hint: "First name is required." };
      if (!form.lastName.trim())  return { ok: false, hint: "Last name is required." };
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return { ok: false, hint: "Valid email address is required." };
      if (!form.dob)              return { ok: false, hint: "Date of birth is required." };
      if (!form.country.trim())   return { ok: false, hint: "Country of residence is required." };
      return { ok: true, hint: "" };
    case 3:
      if (!form.employmentStatus)  return { ok: false, hint: "Employment status is required." };
      if (!form.annualIncome)      return { ok: false, hint: "Annual income is required." };
      if (!form.netWorth)          return { ok: false, hint: "Net worth is required." };
      if (!form.tradingExperience) return { ok: false, hint: "Trading experience is required." };
      if (!form.sourceOfFunds)     return { ok: false, hint: "Source of funds is required." };
      return { ok: true, hint: "" };
    default: return { ok: true, hint: "" };
  }
}

// ── 5-box OTP input ────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled, hasError }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; hasError?: boolean;
}) {
  // Single ref array — no hook calls in a loop
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const digits = value.padEnd(5, " ").split("").slice(0, 5);
  const border = hasError ? "rgba(239,68,68,0.5)" : "rgba(37,45,61,0.5)";
  const focus  = hasError ? "rgba(239,68,68,0.7)" : "rgba(16,212,142,0.5)";

  const focusBox = (idx: number) => inputsRef.current[idx]?.focus();

  const handle = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(-1);
    if (!raw) return;
    const arr = digits.map((d, i) => i === idx ? raw : d);
    onChange(arr.join("").replace(/ /g, ""));
    if (idx < 4) focusBox(idx + 1);
  };

  const keydown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();
    const next = value.slice(0, idx) + value.slice(idx + 1);
    onChange(next);
    if (idx > 0) focusBox(idx - 1);
  };

  const paste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (p) { onChange(p); focusBox(Math.min(p.length, 4)); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {[0,1,2,3,4].map(i => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={e => handle(i, e)}
          onKeyDown={e => keydown(i, e)}
          onPaste={paste}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="w-12 h-14 text-center text-2xl font-bold font-mono outline-none rounded-sm transition-colors"
          style={{
            background: "rgba(37,45,61,0.2)",
            border: `1px solid ${border}`,
            color: "#f0ede8",
            caretColor: "transparent",
          }}
          onFocus={e  => (e.currentTarget.style.borderColor = focus)}
          onBlur={e   => (e.currentTarget.style.borderColor = border)}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function OpenAccountPageContent() {
  const [step, setStep]       = useState(1);
  const [screen, setScreen]   = useState<Screen>("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stepError, setStepError]     = useState("");
  const [email, setEmail]     = useState(""); // confirmed email after submission

  // OTP state
  const [otp, setOtp]           = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setCooldown] = useState(0);
  const [resendMsg, setResendMsg]     = useState("");

  const [form, setForm] = useState<FormData>({
    accountType: "", firstName: "", lastName: "", email: "", phone: "",
    country: "", dob: "", employmentStatus: "", annualIncome: "",
    netWorth: "", tradingExperience: "", sourceOfFunds: "",
  });

  const update = (f: keyof FormData, v: string) => { setForm(p => ({ ...p, [f]: v })); setStepError(""); };

  const inputStyle: React.CSSProperties = {
    background: "rgba(37,45,61,0.2)", border: "1px solid rgba(37,45,61,0.5)",
    borderRadius: "2px", color: "#f0ede8", width: "100%", padding: "12px 16px",
    fontSize: "0.875rem", outline: "none",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "rgba(16,212,142,0.5)");
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)");

  // ── Continue guard ────────────────────────────────────────────────────────
  const handleContinue = () => {
    const { ok, hint } = stepValid(step, form);
    if (!ok) { setStepError(hint); return; }
    setStepError(""); setStep(s => s + 1);
  };

  // ── Submit application ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true); setSubmitError("");
    try {
      const res  = await fetch("/api/applications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      setEmail(form.email);
      setScreen("otp"); // show OTP input inline — no redirect
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.length !== 5) { setOtpError("Please enter the full 5-digit code."); return; }
    setOtpLoading(true); setOtpError("");
    try {
      const res  = await fetch("/api/auth/verify-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();
      if (res.ok && json.data?.verified) {
        localStorage.setItem("aurex_token", json.data.token);
        setScreen("done");
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
      } else {
        setOtp("");
        setOtpError(json.error ?? "Incorrect code. Please try again.");
      }
    } catch { setOtpError("Network error. Please try again."); }
    finally { setOtpLoading(false); }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res  = await fetch("/api/auth/resend-verification", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setResendMsg(res.ok ? "New code sent!" : (json.error ?? "Failed to resend."));
    } catch { setResendMsg("Network error."); }
    setCooldown(60);
    const iv = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
  };

  // ════════════════════════════════════════════════════════════════════════
  // SCREEN: OTP input
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32" style={{ background: "#080a0f" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: `linear-gradient(rgba(37,45,61,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,45,61,0.1) 1px,transparent 1px)`, backgroundSize: "80px 80px" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md p-8 text-center"
          style={{ border: "1px solid rgba(37,45,61,0.5)", background: "rgba(14,17,24,0.85)", borderRadius: "4px", backdropFilter: "blur(20px)" }}
        >
          {/* Icon */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(16,212,142,0.08)", border: "1px solid rgba(16,212,142,0.25)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10d48e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Check your inbox</h2>
          <p className="text-sm mb-1" style={{ color: "#6b7a8d", lineHeight: 1.7 }}>We sent a 5-digit code to</p>
          <p className="text-sm font-semibold mb-8" style={{ color: "#10d48e" }}>{email}</p>

          <div className="mb-5">
            <OTPInput value={otp} onChange={v => { setOtp(v); setOtpError(""); }}
              disabled={otpLoading} hasError={!!otpError} />
          </div>

          {otpError && <p className="text-sm mb-4" style={{ color: "#f87171" }}>{otpError}</p>}

          <motion.button onClick={handleVerify} disabled={otpLoading || otp.length !== 5}
            whileHover={!otpLoading && otp.length === 5 ? { scale: 1.02 } : {}}
            whileTap={!otpLoading && otp.length === 5 ? { scale: 0.98 } : {}}
            className="w-full py-3.5 text-sm font-semibold tracking-widest uppercase mb-6"
            style={{
              background:   otpLoading || otp.length !== 5 ? "rgba(37,45,61,0.35)" : "linear-gradient(135deg,#10d48e,#00bcd4)",
              color:        otpLoading || otp.length !== 5 ? "#6b7a8d" : "#040507",
              borderRadius: "2px", transition: "all 0.2s",
            }}
          >
            {otpLoading ? "Verifying…" : "Verify Code"}
          </motion.button>

          <div className="h-px mb-5" style={{ background: "rgba(37,45,61,0.4)" }} />
          {resendMsg && <p className="text-xs mb-2" style={{ color: "#10d48e" }}>{resendMsg}</p>}
          <button onClick={handleResend} disabled={resendCooldown > 0} className="text-sm"
            style={{ color: resendCooldown > 0 ? "#4a5568" : "#9fa8b4", transition: "color 0.2s" }}>
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend →"}
          </button>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // SCREEN: Done — redirecting
  // ════════════════════════════════════════════════════════════════════════
  if (screen === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#080a0f" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: "rgba(16,212,142,0.08)", border: "1px solid rgba(16,212,142,0.3)" }}
            animate={{ boxShadow: ["0 0 0 0 rgba(16,212,142,0.15)","0 0 0 20px rgba(16,212,142,0)","0 0 0 0 rgba(16,212,142,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10d48e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Email verified.</h2>
          <p className="text-sm" style={{ color: "#6b7a8d" }}>Redirecting to your dashboard…</p>
          <motion.div className="w-full h-0.5 mt-8 origin-left"
            style={{ background: "linear-gradient(90deg,#10d48e,#00bcd4)" }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2, ease: "linear" }} />
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // SCREEN: Multi-step form
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen px-6 py-24" style={{ background: "#080a0f" }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ backgroundImage: `linear-gradient(rgba(37,45,61,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,45,61,0.1) 1px,transparent 1px)`, backgroundSize: "80px 80px" }} />
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{ background: "#10d48e" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#10d48e" }}>Account Application</span>
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: "#f0ede8", letterSpacing: "-0.03em" }}>Open your account.</h1>
          <p className="text-sm" style={{ color: "#6b7a8d" }}>Applications reviewed within 24 hours.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-12 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center shrink-0">
              <div className="flex items-center gap-2 px-4 py-2"
                style={{ border: `1px solid ${step === s.id ? "rgba(16,212,142,0.4)" : step > s.id ? "rgba(16,212,142,0.2)" : "rgba(37,45,61,0.4)"}`, background: step === s.id ? "rgba(16,212,142,0.08)" : "transparent", borderRadius: "2px" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: step > s.id ? "#10d48e" : step === s.id ? "rgba(16,212,142,0.2)" : "rgba(37,45,61,0.4)", color: step > s.id ? "#040507" : step === s.id ? "#10d48e" : "#6b7a8d" }}>
                  {step > s.id ? "✓" : s.id}
                </span>
                <span className="text-xs font-medium tracking-wide whitespace-nowrap hidden sm:block"
                  style={{ color: step >= s.id ? "#f0ede8" : "#6b7a8d" }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px shrink-0" style={{ background: step > s.id ? "rgba(16,212,142,0.3)" : "rgba(37,45,61,0.4)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step cards */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="p-8" style={{ border: "1px solid rgba(37,45,61,0.4)", background: "rgba(14,17,24,0.7)", borderRadius: "4px", backdropFilter: "blur(20px)" }}>

            {/* ── Step 1 ── */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#f0ede8" }}>Choose account type</h2>
                <p className="text-sm mb-8" style={{ color: "#6b7a8d" }}>Select the type that best describes your trading activity.</p>
                <div className="space-y-4">
                  {ACCOUNT_TYPES.map(a => (
                    <button key={a.id} onClick={() => update("accountType", a.id)} className="w-full text-left p-5 transition-all"
                      style={{ border: `1px solid ${form.accountType === a.id ? "rgba(16,212,142,0.4)" : "rgba(37,45,61,0.4)"}`, background: form.accountType === a.id ? "rgba(16,212,142,0.06)" : "transparent", borderRadius: "4px" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold" style={{ color: "#f0ede8" }}>{a.title}</span>
                        <div className="flex items-center gap-2">
                          {a.badge && <span className="text-xs px-2 py-0.5 font-bold" style={{ background: "rgba(16,212,142,0.12)", color: "#10d48e", borderRadius: "2px" }}>{a.badge}</span>}
                          <span className="text-xs font-mono" style={{ color: "#10d48e" }}>Min {a.min}</span>
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: "#6b7a8d" }}>{a.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#f0ede8" }}>Personal information</h2>
                <p className="text-sm mb-8" style={{ color: "#6b7a8d" }}>Required for identity verification and regulatory compliance.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {([
                    { label: "First Name", field: "firstName" as keyof FormData, type: "text",  placeholder: "James",            req: true  },
                    { label: "Last Name",  field: "lastName"  as keyof FormData, type: "text",  placeholder: "Caldwell",         req: true  },
                    { label: "Email",      field: "email"     as keyof FormData, type: "email", placeholder: "james@fund.com",   req: true  },
                    { label: "Phone",      field: "phone"     as keyof FormData, type: "tel",   placeholder: "+44 20 7000 0000", req: false },
                    { label: "Date of Birth", field: "dob"   as keyof FormData, type: "date",  placeholder: "",                 req: true  },
                    { label: "Country",    field: "country"   as keyof FormData, type: "text",  placeholder: "United Kingdom",   req: true  },
                  ] as const).map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "#9fa8b4" }}>
                        {f.label}{f.req && <span style={{ color: "#10d48e" }}> *</span>}
                      </label>
                      <input type={f.type} value={form[f.field]} onChange={e => update(f.field, e.target.value)}
                        placeholder={f.placeholder} className="w-full px-4 py-3 text-sm outline-none"
                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#f0ede8" }}>Financial profile</h2>
                <p className="text-sm mb-8" style={{ color: "#6b7a8d" }}>Required by FCA/SEC regulations to assess suitability.</p>
                <div className="space-y-5">
                  {([
                    { label: "Employment Status",                  field: "employmentStatus"  as keyof FormData, options: ["Employed","Self-employed","Business owner","Retired","Other"] },
                    { label: "Annual Income",                      field: "annualIncome"      as keyof FormData, options: ["$50,000 – $100,000","$100,000 – $250,000","$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000+"] },
                    { label: "Net Worth (excl. primary residence)",field: "netWorth"          as keyof FormData, options: ["$250,000 – $500,000","$500,000 – $1,000,000","$1,000,000 – $5,000,000","$5,000,000 – $25,000,000","$25,000,000+"] },
                    { label: "Trading Experience",                 field: "tradingExperience" as keyof FormData, options: ["Less than 1 year","1–3 years","3–5 years","5–10 years","10+ years"] },
                    { label: "Source of Funds",                    field: "sourceOfFunds"     as keyof FormData, options: ["Employment income","Business profits","Investments","Inheritance","Property sale","Other"] },
                  ] as const).map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "#9fa8b4" }}>
                        {f.label} <span style={{ color: "#10d48e" }}>*</span>
                      </label>
                      <select value={form[f.field]} onChange={e => update(f.field, e.target.value)}
                        className="w-full px-4 py-3 text-sm outline-none appearance-none" style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                        <option value="" style={{ background: "#0e1118" }}>Select…</option>
                        {f.options.map(o => <option key={o} value={o} style={{ background: "#0e1118" }}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 4: Review ── */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#f0ede8" }}>Review & confirm</h2>
                <p className="text-sm mb-8" style={{ color: "#6b7a8d" }}>Please review your details before submitting.</p>
                {submitError && (
                  <div className="mb-5 px-4 py-3 text-sm rounded-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>{submitError}</div>
                )}
                <div className="mb-8" style={{ border: "1px solid rgba(37,45,61,0.35)", borderRadius: "4px", overflow: "hidden" }}>
                  {[
                    { label: "Account Type",   value: ACCOUNT_TYPES.find(a => a.id === form.accountType)?.title || "—" },
                    { label: "Full Name",       value: [form.firstName, form.lastName].filter(Boolean).join(" ") || "—" },
                    { label: "Email",           value: form.email    || "—" },
                    { label: "Phone",           value: form.phone    || "—" },
                    { label: "Country",         value: form.country  || "—" },
                    { label: "Date of Birth",   value: form.dob      || "—" },
                    { label: "Employment",      value: form.employmentStatus  || "—" },
                    { label: "Annual Income",   value: form.annualIncome      || "—" },
                    { label: "Net Worth",       value: form.netWorth          || "—" },
                    { label: "Experience",      value: form.tradingExperience || "—" },
                    { label: "Source of Funds", value: form.sourceOfFunds     || "—" },
                  ].map((r, i, arr) => (
                    <div key={r.label} className="flex justify-between items-center px-5 py-3"
                      style={{ background: i % 2 === 0 ? "rgba(14,17,24,0.5)" : "transparent", borderBottom: i < arr.length - 1 ? "1px solid rgba(37,45,61,0.25)" : "none" }}>
                      <span className="text-xs uppercase tracking-widest" style={{ color: "#6b7a8d" }}>{r.label}</span>
                      <span className="text-sm font-medium text-right" style={{ color: "#f0ede8" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 mb-2 text-xs leading-relaxed"
                  style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "2px", color: "#9fa8b4" }}>
                  By submitting you agree to the{" "}
                  <a href="/legal/terms" style={{ color: "#10d48e" }}>Terms of Service</a>,{" "}
                  <a href="/legal/privacy" style={{ color: "#10d48e" }}>Privacy Policy</a>, and{" "}
                  <a href="/legal/risk-disclosure" style={{ color: "#10d48e" }}>Risk Disclosure</a>.
                  A 5-digit verification code will be sent to <strong style={{ color: "#f0ede8" }}>{form.email}</strong>.
                </div>
              </div>
            )}

            {/* Step error */}
            {stepError && (
              <div className="mt-5 px-4 py-3 text-sm rounded-sm flex items-center gap-2"
                style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                ⚠ {stepError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: "1px solid rgba(37,45,61,0.3)" }}>
              <button onClick={() => { setStepError(""); setStep(s => Math.max(1, s - 1)); }}
                disabled={step === 1} className="text-sm font-medium"
                style={{ color: step === 1 ? "rgba(107,122,141,0.3)" : "#6b7a8d" }}>← Back</button>

              {step < 4 ? (
                <motion.button onClick={handleContinue} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 text-sm font-semibold tracking-widest uppercase"
                  style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", color: "#040507", borderRadius: "2px" }}>
                  Continue →
                </motion.button>
              ) : (
                <motion.button onClick={handleSubmit} disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}} whileTap={!submitting ? { scale: 0.98 } : {}}
                  className="px-8 py-3 text-sm font-semibold tracking-widest uppercase"
                  style={{ background: submitting ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)", color: submitting ? "#6b7a8d" : "#040507", borderRadius: "2px", transition: "all 0.2s" }}>
                  {submitting ? "Submitting…" : "Submit & Verify Email"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
