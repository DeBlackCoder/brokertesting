"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "email" | "otp" | "done";

// ── Shared styles ─────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: "rgba(37,45,61,0.2)",
  border: "1px solid rgba(37,45,61,0.5)",
  borderRadius: "2px",
  color: "#f0ede8",
  width: "100%",
  padding: "12px 16px",
  fontSize: "0.875rem",
  outline: "none",
};
const onFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)");
const onBlur = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)");

// ── 5-box OTP input (reusable, no hook-in-loop) ───────────────────────────
function OTPInput({ value, onChange, disabled, hasError }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; hasError?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits    = value.padEnd(5, " ").split("").slice(0, 5);
  const border    = hasError ? "rgba(239,68,68,0.5)" : "rgba(37,45,61,0.5)";
  const focusClr  = hasError ? "rgba(239,68,68,0.7)" : "rgba(201,168,76,0.5)";
  const focusBox  = (i: number) => inputsRef.current[i]?.focus();

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(-1);
    if (!raw) return;
    const arr = digits.map((d, i) => i === idx ? raw : d);
    onChange(arr.join("").replace(/ /g, ""));
    if (idx < 4) focusBox(idx + 1);
  };
  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace") return;
    e.preventDefault();
    onChange(value.slice(0, idx) + value.slice(idx + 1));
    if (idx > 0) focusBox(idx - 1);
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (p) { onChange(p); focusBox(Math.min(p.length, 4)); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {[0,1,2,3,4].map(i => (
        <input key={i} ref={el => { inputsRef.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={e => handleChange(i, e)} onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste} disabled={disabled} aria-label={`Digit ${i+1}`}
          className="w-12 h-14 text-center text-2xl font-bold font-mono outline-none rounded-sm"
          style={{ background: "rgba(37,45,61,0.2)", border: `1px solid ${border}`, color: "#f0ede8", caretColor: "transparent" }}
          onFocus={e  => (e.currentTarget.style.borderColor = focusClr)}
          onBlur={e   => (e.currentTarget.style.borderColor = border)} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function ForgotPasswordContent() {
  const [screen, setScreen]   = useState<Screen>("email");
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [resendCooldown, setCooldown] = useState(0);
  const [resendMsg, setResendMsg]     = useState("");

  // ── Step 1: request OTP ────────────────────────────────────────────────
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email address is required"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setScreen("otp");
      startCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  // ── Step 2: verify OTP + set new password ─────────────────────────────
  const handleReset = async () => {
    if (otp.length !== 5)     { setError("Please enter the full 5-digit code"); return; }
    if (newPass.length < 8)   { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: newPass }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOtp(""); // clear code on wrong attempt
        throw new Error(json.error ?? "Reset failed");
      }
      // Store new JWT and go to dashboard
      localStorage.setItem("aurex_token", json.data.token);
      setScreen("done");
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  // ── Resend ─────────────────────────────────────────────────────────────
  const startCooldown = () => {
    setCooldown(60);
    const iv = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
  };
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setResendMsg(res.ok ? "New code sent!" : (json.error ?? "Failed to resend"));
    } catch { setResendMsg("Network error"); }
    startCooldown();
  };

  const Logo = () => (
    <a href="/" className="flex items-center gap-3 mb-12 justify-center">
      <div className="relative w-8 h-8 shrink-0">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
        <div className="absolute inset-[2px]" style={{ background: "#080a0f", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
        <div className="absolute inset-[4px]" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity: 0.7 }}/>
      </div>
      <span className="text-lg font-bold tracking-[0.25em] uppercase" style={{ color: "#f0ede8" }}>AUREX</span>
    </a>
  );

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", padding: "5rem 1.5rem 8rem", background: "#080a0f",
  };
  const gridBg: React.CSSProperties = {
    backgroundImage: `linear-gradient(rgba(37,45,61,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,45,61,0.1) 1px,transparent 1px)`,
    backgroundSize: "80px 80px",
  };
  const card: React.CSSProperties = {
    border: "1px solid rgba(37,45,61,0.5)", background: "rgba(14,17,24,0.8)",
    borderRadius: "4px", backdropFilter: "blur(20px)", padding: "2rem",
  };

  return (
    <div style={pageStyle}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={gridBg}/>
      <div className="relative z-10 w-full max-w-md">
        <Logo/>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Email ── */}
          {screen === "email" && (
            <motion.div key="email" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }} style={card}>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Forgot password?</h1>
              <p className="text-sm mb-8" style={{ color: "#6b7a8d" }}>
                Enter your account email. We'll send a 5-digit code to reset your password.
              </p>

              {error && (
                <div className="mb-5 px-4 py-3 text-sm rounded-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "#9fa8b4" }}>Email Address</label>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@institution.com" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} autoComplete="email"/>
                </div>
                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full py-3.5 text-sm font-semibold tracking-widest uppercase"
                  style={{ background: loading ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)", color: loading ? "#6b7a8d" : "#040507", borderRadius: "2px", transition: "all 0.2s" }}>
                  {loading ? "Sending code…" : "Send Reset Code"}
                </motion.button>
              </form>

              <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(37,45,61,0.4)" }}>
                <p className="text-xs text-center" style={{ color: "#6b7a8d" }}>
                  Remember your password?{" "}
                  <a href="/auth/signin" style={{ color: "#10d48e" }}>Sign in →</a>
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: OTP + New password ── */}
          {screen === "otp" && (
            <motion.div key="otp" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }} style={card}>
              <button onClick={() => { setScreen("email"); setOtp(""); setError(""); }}
                className="text-sm mb-6 block" style={{ color: "#6b7a8d" }}>← Back</button>

              <h1 className="text-2xl font-bold mb-2" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Enter your code</h1>
              <p className="text-sm mb-1" style={{ color: "#6b7a8d" }}>We sent a 5-digit code to</p>
              <p className="text-sm font-semibold mb-8" style={{ color: "#c9a84c" }}>{email}</p>

              {error && (
                <div className="mb-5 px-4 py-3 text-sm rounded-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  {error}
                </div>
              )}

              {/* OTP boxes */}
              <div className="mb-6">
                <OTPInput value={otp} onChange={v => { setOtp(v); setError(""); }}
                  disabled={loading} hasError={!!error && otp.length === 5} />
              </div>

              {/* New password */}
              <div className="mb-6">
                <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "#9fa8b4" }}>New Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={newPass}
                    onChange={e => { setNewPass(e.target.value); setError(""); }}
                    placeholder="Min 8 characters" required
                    style={{ ...inputStyle, paddingRight: 56 }}
                    onFocus={onFocus} onBlur={onBlur} autoComplete="new-password"/>
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: "#6b7a8d" }}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {newPass.length > 0 && newPass.length < 8 && (
                  <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>At least 8 characters required</p>
                )}
              </div>

              <motion.button onClick={handleReset}
                disabled={loading || otp.length !== 5 || newPass.length < 8}
                whileHover={!loading && otp.length === 5 && newPass.length >= 8 ? { scale: 1.01 } : {}}
                whileTap={!loading && otp.length === 5 && newPass.length >= 8 ? { scale: 0.98 } : {}}
                className="w-full py-3.5 text-sm font-semibold tracking-widest uppercase mb-6"
                style={{
                  background: loading || otp.length !== 5 || newPass.length < 8 ? "rgba(37,45,61,0.35)" : "linear-gradient(135deg,#10d48e,#00bcd4)",
                  color:      loading || otp.length !== 5 || newPass.length < 8 ? "#6b7a8d" : "#040507",
                  borderRadius: "2px", transition: "all 0.2s",
                }}>
                {loading ? "Resetting…" : "Reset Password"}
              </motion.button>

              <div className="h-px mb-5" style={{ background: "rgba(37,45,61,0.4)" }}/>
              {resendMsg && <p className="text-xs mb-2 text-center" style={{ color: "#10d48e" }}>{resendMsg}</p>}
              <button onClick={handleResend} disabled={resendCooldown > 0}
                className="text-sm w-full text-center"
                style={{ color: resendCooldown > 0 ? "#4a5568" : "#9fa8b4", transition: "color 0.2s" }}>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend →"}
              </button>
            </motion.div>
          )}

          {/* ── Done ── */}
          {screen === "done" && (
            <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center">
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                style={{ background: "rgba(16,212,142,0.08)", border: "1px solid rgba(16,212,142,0.3)" }}
                animate={{ boxShadow: ["0 0 0 0 rgba(16,212,142,0.15)","0 0 0 20px rgba(16,212,142,0)","0 0 0 0 rgba(16,212,142,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10d48e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Password reset.</h2>
              <p className="text-sm" style={{ color: "#6b7a8d" }}>Redirecting to your dashboard…</p>
              <motion.div className="w-full h-0.5 mt-8 origin-left"
                style={{ background: "linear-gradient(90deg,#10d48e,#00bcd4)" }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2, ease: "linear" }}/>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-xs text-center mt-6" style={{ color: "rgba(107,122,141,0.4)" }}>
          Need help? <a href="mailto:support@aurex.com" style={{ color: "#6b7a8d" }}>support@aurex.com</a>
        </p>
      </div>
    </div>
  );
}
