"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Step = "credentials" | "mfa";

export default function SignInPageContent() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mfaCode, setMfaCode]   = useState("");
  const [step, setStep]         = useState<Step>("credentials");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // If already signed in, go straight to dashboard
  useEffect(() => {
    try {
      const token = localStorage.getItem("aurex_token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check token hasn't expired
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          window.location.replace("/dashboard");
        }
      }
    } catch { /* bad token — stay on sign-in */ }
  }, []);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Sign in failed");
        return;
      }

      // Store token
      localStorage.setItem("aurex_token", json.data.token);

      // If MFA enabled, move to step 2 — else go to dashboard
      if (json.data.user.mfaEnabled) {
        setStep("mfa");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
    (e.currentTarget.style.borderColor = "rgba(16,212,142,0.5)");
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-32"
      style={{ background: "#080a0f" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(37,45,61,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,45,61,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-12">
          {/* Back to home */}
          <div className="flex justify-start mb-6">
            <a href="/" className="flex items-center gap-1.5 text-xs tracking-widest uppercase"
              style={{ color:"#4a5568", transition:"color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color="#9fa8b4")}
              onMouseLeave={e => (e.currentTarget.style.color="#4a5568")}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to home
            </a>
          </div>
          <a href="/" className="flex items-center gap-3 justify-center">
            <div className="relative w-8 h-8 shrink-0">
              <div className="absolute inset-0"     style={{ background:"linear-gradient(135deg,#10d48e,#00bcd4)", clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
              <div className="absolute inset-[2px]" style={{ background:"#080a0f",                                  clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }} />
              <div className="absolute inset-[4px]" style={{ background:"linear-gradient(135deg,#10d48e,#00bcd4)", clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity:0.7 }} />
            </div>
            <span className="text-lg font-bold tracking-[0.25em] uppercase" style={{ color:"#f0ede8" }}>AUREX</span>
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8"
          style={{ border: "1px solid rgba(37,45,61,0.5)", background: "rgba(14,17,24,0.8)", borderRadius: "4px", backdropFilter: "blur(20px)" }}
        >
          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 text-sm rounded-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              {error}
            </div>
          )}

          {step === "credentials" ? (
            <>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Welcome back</h1>
              <p className="text-sm mb-8" style={{ color: "#6b7a8d" }}>Sign in to your AUREX account</p>

              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: "#9fa8b4" }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@institution.com" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} autoComplete="email" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-medium tracking-widest uppercase" style={{ color: "#9fa8b4" }}>Password</label>
                    <a href="/auth/forgot-password" className="text-xs" style={{ color: "#10d48e" }}>Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      style={{ ...inputStyle, paddingRight: 56 }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#6b7a8d" }}>
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full py-3.5 text-sm font-semibold tracking-widest uppercase mt-2"
                  style={{ background: loading ? "rgba(37,45,61,0.4)" : "linear-gradient(135deg,#10d48e,#00bcd4)", color: loading ? "#6b7a8d" : "#040507", borderRadius: "2px", transition: "all 0.2s" }}
                >
                  {loading ? "Signing in…" : "Sign In"}
                </motion.button>
              </form>

              <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(37,45,61,0.4)" }}>
                <p className="text-xs text-center" style={{ color: "#6b7a8d" }}>
                  Don't have an account?{" "}
                  <a href="/auth/open-account" style={{ color: "#10d48e" }}>Apply for access →</a>
                </p>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setStep("credentials")} className="text-sm mb-6 block" style={{ color: "#6b7a8d" }}>← Back</button>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Two-factor authentication</h1>
              <p className="text-sm mb-8" style={{ color: "#6b7a8d" }}>Enter the 6-digit code from your authenticator app</p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-[0.5em] outline-none mb-5"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />

              <motion.button
                disabled={mfaCode.length !== 6}
                whileHover={mfaCode.length === 6 ? { scale: 1.01 } : {}}
                whileTap={mfaCode.length === 6 ? { scale: 0.98 } : {}}
                className="w-full py-3.5 text-sm font-semibold tracking-widest uppercase"
                style={{ background: mfaCode.length === 6 ? "linear-gradient(135deg,#10d48e,#00bcd4)" : "rgba(37,45,61,0.3)", color: mfaCode.length === 6 ? "#040507" : "#6b7a8d", borderRadius: "2px", transition: "all 0.2s" }}
              >
                Verify
              </motion.button>
            </>
          )}
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs text-center mt-6" style={{ color: "rgba(107,122,141,0.5)" }}>
          Protected by AUREX Security · FCA Regulated · SOC 2 Type II
        </motion.p>
      </div>
    </div>
  );
}
