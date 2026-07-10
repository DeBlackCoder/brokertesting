"use client";

import { motion } from "framer-motion";

const VALUES = [
  { title: "Precision", body: "Every system, every interface, every algorithm is engineered to the highest standard. We don't ship anything we wouldn't use ourselves.", accent: "#10d48e" },
  { title: "Integrity", body: "We operate with complete transparency — on pricing, on risk, on our regulatory standing. No hidden fees. No conflicts of interest.", accent: "#c9a84c" },
  { title: "Innovation", body: "The financial infrastructure of the past decade is being rebuilt. We're building the infrastructure of the next one.", accent: "#00bcd4" },
  { title: "Discretion", body: "Our clients' strategies, portfolios, and identities are protected with the same rigour we apply to our trading systems.", accent: "#10d48e" },
];

const TIMELINE = [
  { year: "2018", event: "Founded in London", detail: "AUREX Capital Markets incorporated with seed funding from institutional investors." },
  { year: "2019", event: "FCA authorisation", detail: "Received full authorisation from the Financial Conduct Authority as an investment firm." },
  { year: "2020", event: "First $1B AUM", detail: "Reached $1 billion in assets under management within 18 months of launch." },
  { year: "2021", event: "Singapore & US expansion", detail: "Licensed by MAS (Singapore) and registered with the SEC, enabling global institutional clients." },
  { year: "2022", event: "Sub-millisecond execution", detail: "Launched co-located infrastructure at 8 global exchange hubs, achieving 0.3ms average execution." },
  { year: "2023", event: "AI Intelligence Layer", detail: "Launched proprietary market intelligence platform processing 12M data points per second." },
  { year: "2024", event: "$20B AUM milestone", detail: "Assets under management crossed $20 billion across 80+ jurisdictions." },
  { year: "2026", event: "$48.7B AUM", detail: "AUREX becomes one of the fastest-growing institutional brokerages in history." },
];

const LEADERSHIP = [
  { initials: "JC", name: "James Caldwell", role: "Chief Executive Officer", bio: "Former MD at Goldman Sachs, 20 years in institutional trading infrastructure." },
  { initials: "SL", name: "Sarah Lin", role: "Chief Technology Officer", bio: "Previously VP Engineering at Citadel. Architected ultra-low-latency trading systems." },
  { initials: "MO", name: "Marcus Okafor", role: "Chief Risk Officer", bio: "Ex-Bridgewater risk management, specialist in tail-risk modelling and portfolio stress testing." },
  { initials: "AH", name: "Amara Hassan", role: "Chief Compliance Officer", bio: "Former FCA regulatory counsel. Led compliance frameworks for tier-1 financial institutions." },
  { initials: "DP", name: "David Park", role: "Head of Institutional Sales", bio: "20 years building relationships with sovereign wealth funds, pension funds, and family offices." },
  { initials: "RN", name: "Riya Nair", role: "Head of Product", bio: "Former Head of Design at Linear and Monzo. Champions the engineering-first product philosophy." },
];

export default function AboutPageContent() {
  return (
    <div style={{ background: "#080a0f" }} className="pb-32">

      {/* Values */}
      <section className="px-6 py-24" style={{ borderBottom: "1px solid rgba(37,45,61,0.3)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-8 h-px" style={{ background: "#c9a84c" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>
              Our Values
            </span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0"
            style={{ border: "1px solid rgba(37,45,61,0.35)", borderRadius: "4px", overflow: "hidden" }}
          >
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8"
                style={{ borderRight: i < VALUES.length - 1 ? "1px solid rgba(37,45,61,0.35)" : "none" }}
              >
                <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: v.accent }}>
                  {v.title}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7a8d" }}>{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-24" style={{ borderBottom: "1px solid rgba(37,45,61,0.3)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-8 h-px" style={{ background: "#10d48e" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#10d48e" }}>
              Our Journey
            </span>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-16 top-0 bottom-0 w-px hidden md:block"
              style={{ background: "linear-gradient(180deg, transparent, #10d48e, transparent)" }}
            />

            <div className="space-y-0">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-8 py-6"
                  style={{ borderBottom: i < TIMELINE.length - 1 ? "1px solid rgba(37,45,61,0.2)" : "none" }}
                >
                  <div
                    className="text-sm font-bold font-mono tabular-nums shrink-0 w-14 text-right"
                    style={{ color: "#10d48e" }}
                  >
                    {item.year}
                  </div>
                  {/* Dot */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0 mt-1 hidden md:block"
                    style={{ background: "#10d48e", marginLeft: -4 }}
                  />
                  <div>
                    <div className="font-semibold mb-1" style={{ color: "#f0ede8" }}>{item.event}</div>
                    <div className="text-sm" style={{ color: "#6b7a8d" }}>{item.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-8 h-px" style={{ background: "#c9a84c" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>
              Leadership
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEADERSHIP.map((l, i) => (
              <motion.div
                key={l.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-6"
                style={{
                  border: "1px solid rgba(37,45,61,0.4)",
                  background: "rgba(14,17,24,0.5)",
                  borderRadius: "4px",
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: "rgba(201,168,76,0.08)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "#c9a84c",
                    }}
                  >
                    {l.initials}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "#f0ede8" }}>{l.name}</div>
                    <div className="text-xs" style={{ color: "#10d48e" }}>{l.role}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7a8d" }}>{l.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
