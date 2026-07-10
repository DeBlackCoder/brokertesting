"use client";

import { motion } from "framer-motion";

const PILLARS = [
  {
    number: "01",
    title: "Encryption at Every Layer",
    body: "All data at rest is encrypted with AES-256. All data in transit uses TLS 1.3. Database fields containing PII are individually encrypted with separate key management. Hardware Security Modules (HSMs) protect all cryptographic operations.",
    accent: "#10d48e",
  },
  {
    number: "02",
    title: "Segregated Client Funds",
    body: "Client funds are held in segregated accounts at tier-1 banking institutions including HSBC, Barclays, and JPMorgan. AUREX operational funds are entirely separate. In the event of AUREX insolvency, client funds are not available to creditors.",
    accent: "#c9a84c",
  },
  {
    number: "03",
    title: "Multi-Factor Authentication",
    body: "All account access requires multi-factor authentication. We support TOTP authenticator apps, hardware security keys (FIDO2/WebAuthn), and biometric authentication on mobile. SMS 2FA is not offered due to SIM-swap vulnerabilities.",
    accent: "#00bcd4",
  },
  {
    number: "04",
    title: "Continuous Monitoring",
    body: "Our Security Operations Centre monitors all systems 24/7. Automated anomaly detection flags unusual login patterns, order anomalies, and data access irregularities. All events are logged to an immutable audit trail.",
    accent: "#10d48e",
  },
  {
    number: "05",
    title: "Regulatory Compliance",
    body: "AUREX holds full authorisation from the FCA (UK), SEC (US), and MAS (Singapore). We comply with GDPR, MiFID II, Dodd-Frank, and applicable AML/KYC regulations. Annual external audits verify compliance across all frameworks.",
    accent: "#c9a84c",
  },
  {
    number: "06",
    title: "Penetration Testing",
    body: "We engage independent security firms to conduct penetration tests quarterly. Our bug bounty programme rewards responsible disclosure. Critical vulnerabilities are remediated within 24 hours. Reports are available to institutional clients on request.",
    accent: "#00bcd4",
  },
];

const CERTIFICATIONS = [
  { name: "SOC 2 Type II", body: "Annual audit by independent CPA firm covering security, availability, processing integrity, confidentiality, and privacy.", colour: "#10d48e" },
  { name: "ISO 27001", body: "Information Security Management System certified by BSI. Covers all AUREX offices and systems globally.", colour: "#c9a84c" },
  { name: "PCI DSS Level 1", body: "Highest level of Payment Card Industry compliance for handling cardholder data.", colour: "#00bcd4" },
  { name: "FCA Authorised", body: "Full authorisation under the Financial Services and Markets Act 2000. FRN: 987654.", colour: "#10d48e" },
];

export default function SecurityPageContent() {
  return (
    <div style={{ background: "#080a0f" }} className="pb-32">

      {/* Alert banner */}
      <div
        className="px-6 py-5"
        style={{ background: "rgba(16,212,142,0.05)", borderBottom: "1px solid rgba(16,212,142,0.15)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <motion.div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: "#10d48e" }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-hidden="true"
          />
          <p className="text-sm" style={{ color: "#9fa8b4" }}>
            <span className="font-semibold" style={{ color: "#10d48e" }}>All systems operational. </span>
            Current uptime: 99.99% over the last 90 days.{" "}
            <a href="#" className="underline" style={{ color: "#6b7a8d" }}>View status page →</a>
          </p>
        </div>
      </div>

      {/* Security pillars */}
      <div className="max-w-7xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-14"
        >
          <div className="w-8 h-px" style={{ background: "#10d48e" }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: "#10d48e" }}>
            Security Architecture
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0"
          style={{ border: "1px solid rgba(37,45,61,0.35)", borderRadius: "4px", overflow: "hidden" }}
        >
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.number}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-8 relative group"
              style={{
                borderRight: (i % 3 !== 2) ? "1px solid rgba(37,45,61,0.35)" : "none",
                borderBottom: i < 3 ? "1px solid rgba(37,45,61,0.35)" : "none",
              }}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: p.accent, transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.35 }}
              />
              <div className="text-xs font-mono tracking-widest mb-5" style={{ color: p.accent }}>
                {p.number}
              </div>
              <h3 className="font-bold mb-3 text-lg leading-tight" style={{ color: "#f0ede8", letterSpacing: "-0.01em" }}>
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7a8d" }}>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-8 h-px" style={{ background: "#c9a84c" }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>
            Certifications & Compliance
          </span>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CERTIFICATIONS.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09 }}
              className="p-6"
              style={{
                border: `1px solid rgba(${c.colour === "#10d48e" ? "16,212,142" : c.colour === "#c9a84c" ? "201,168,76" : "0,188,212"},0.2)`,
                background: `rgba(${c.colour === "#10d48e" ? "16,212,142" : c.colour === "#c9a84c" ? "201,168,76" : "0,188,212"},0.03)`,
                borderRadius: "4px",
              }}
            >
              <div className="font-bold mb-3" style={{ color: c.colour }}>{c.name}</div>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7a8d" }}>{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report a vulnerability */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10"
          style={{
            border: "1px solid rgba(37,45,61,0.4)",
            background: "rgba(14,17,24,0.6)",
            borderRadius: "4px",
          }}
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>
              Responsible Disclosure
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b7a8d" }}>
              We take security seriously and welcome reports from the security research community. If you discover a vulnerability in our systems, please report it to our security team. We aim to respond within 24 hours and will work with you to understand and remediate the issue. We offer rewards for valid, critical findings.
            </p>
            <a
              href="mailto:security@aurex.com"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase"
              style={{ color: "#10d48e" }}
            >
              security@aurex.com →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
