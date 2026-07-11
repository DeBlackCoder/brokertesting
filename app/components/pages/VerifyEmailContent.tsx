"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Screen = "input" | "success" | "error";

interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

function OTPInput({ value, onChange, disabled, hasError }: OTPInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits    = value.padEnd(5, " ").split("").slice(0, 5);
  const border    = hasError ? "rgba(239,68,68,0.5)" : "rgba(37,45,61,0.5)";
  const focusClr  = hasError ? "rgba(239,68,68,0.7)" : "rgba(16,212,142,0.5)";
  const focusBox  = (i: number) => inputsRef.current[i]?.focus();

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(-1);
    if (!raw) return;
    const arr = digits.map((d, i) => (i === idx ? raw : d));
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
      {[0, 1, 2, 3, 4].map(i => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="w-12 h-14 text-center text-2xl font-bold font-mono outline-none rounded-sm transition-colors"
          style={{ background: "rgba(37,45,61,0.2)", border: `1px solid ${border}`, color: "#f0ede8", caretColor: "transparent" }}
          onFocus={e => (e.currentTarget.style.borderColor = focusClr)}
          onBlur={e  => (e.currentTarget.style.borderColor = border)}
        />
      ))}
    </div>
  );
}

export default function VerifyEmailContent() {
  const params     = useSearchParams();
  const emailParam = params.get("email") ?? "";

  const [email, setEmail]     = useState(emailParam);
  const [otp, setOtp]         = useState("");
  const [screen, setScreen]   = useState<Screen>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [resendCooldown, setCooldown] = useState(0);
  const [resendMsg, setResendMsg]     = useState("");

  const startCooldown = () => {
    setCooldown(60);
    const iv = setInterval(() => setCooldown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
  };

  const handleVerify = async () => {
    if (otp.length !== 5) { setError("Please enter the full 5-digit code."); return; }
    if (!email)           { setError("Email address is required."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/verify-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();
      if (res.ok && json.data?.verified) {
        localStorage.setItem("aurex_token", json.data.token);
        setScreen("success");
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
      } else {
        setOtp("");
        setError(json.error ?? "Verification failed.");
      }
    } catch { setError("Network error. Please try again."); }
    finally  { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      const res  = await fetch("/api/auth/resend-verification", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setResendMsg(json.data?.message ?? json.error ?? "");
    } catch { setResendMsg("Failed to resend. Please try again."); }
    startCooldown();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32 pb-24" style={{ background: "#080a0f" }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ backgroundImage: `linear-gradient(rgba(37,45,61,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(37,45,61,0.1) 1px,transparent 1px)`, backgroundSize: "80px 80px" }} />

      <div className="relative z-10 w-full max-w-md">
        <a href="/" className="flex items-center gap-3 mb-12 justify-center">
          <div className="relative w-8 h-8 shrink-0">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
            <div className="absolute inset-[2px]" style={{ background: "#080a0f", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
            <div className="absolute inset-[4px]" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity: 0.7 }} />
          </div>
          <span className="text-lg font-bold tracking-[0.25em] uppercase" style={{ color: "#f0ede8" }}>AUREX</span>
        </a>

        <AnimatePresence mode="wait">
          {screen === "input" && (
            <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="p-8 text-center"
              style={{ border: "1px solid rgba(37,45,61,0.5)", background: "rgba(14,17,24,0.8)", borderRadius: "4px", backdropFilter: "blur(20px)" }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(16,212,142,0.08)", border: "1px solid rgba(16,212,142,0.25)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10d48e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>

              <h1 className="text-2xl font-bold mb-2" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Enter your code</h1>
              <p className="text-sm mb-2" style={{ color: "#6b7a8d", lineHeight: 1.7 }}>We sent a 5-digit code to</p>

              {email ? (
                <p className="text-sm font-semibold mb-8" style={{ color: "#10d48e" }}>{email}</p>
              ) : (
                <div className="mb-6">
                  <input type="email" placeholder="your-email@example.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-center outline-none mb-1"
                    style={{ background: "rgba(37,45,61,0.2)", border: "1px solid rgba(37,45,61,0.5)", borderRadius: "2px", color: "#f0ede8" }} />
                  <p className="text-xs" style={{ color: "#6b7a8d" }}>Enter the email you applied with</p>
                </div>
              )}

              <div className="mb-6">
                <OTPInput value={otp} onChange={v => { setOtp(v); setError(""); }} disabled={loading} hasError={!!error} />
              </div>

              {error && <p className="text-sm mb-4" style={{ color: "#f87171" }}>{error}</p>}

              <motion.button onClick={handleVerify} disabled={loading || otp.length !== 5}
                whileHover={!loading && otp.length === 5 ? { scale: 1.02 } : {}}
                whileTap={!loading && otp.length === 5 ? { scale: 0.98 } : {}}
                className="w-full py-3.5 text-sm font-semibold tracking-widest uppercase mb-6"
                style={{ background: loading || otp.length !== 5 ? "rgba(37,45,61,0.35)" : "linear-gradient(135deg,#10d48e,#00bcd4)", color: loading || otp.length !== 5 ? "#6b7a8d" : "#040507", borderRadius: "2px", transition: "all 0.2s" }}>
                {loading ? "Verifying…" : "Verify Code"}
              </motion.button>

              <div className="mb-5 h-px" style={{ background: "rgba(37,45,61,0.4)" }} />
              {resendMsg && <p className="text-xs mb-2" style={{ color: "#10d48e" }}>{resendMsg}</p>}
              <button onClick={handleResend} disabled={resendCooldown > 0} className="text-sm"
                style={{ color: resendCooldown > 0 ? "#4a5568" : "#9fa8b4", transition: "color 0.2s" }}>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend →"}
              </button>
            </motion.div>
          )}

          {screen === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
                style={{ background: "rgba(16,212,142,0.08)", border: "1px solid rgba(16,212,142,0.3)" }}
                animate={{ boxShadow: ["0 0 0 0 rgba(16,212,142,0.15)","0 0 0 20px rgba(16,212,142,0)","0 0 0 0 rgba(16,212,142,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10d48e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Email verified.</h2>
              <p className="text-sm" style={{ color: "#6b7a8d" }}>Redirecting to your dashboard…</p>
              <motion.div className="w-full h-0.5 mt-8 origin-left"
                style={{ background: "linear-gradient(90deg,#10d48e,#00bcd4)" }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2, ease: "linear" }} />
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
