"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEPARTMENTS = ["All", "Engineering", "Trading", "Product", "Compliance", "Operations"];

const ROLES = [
  { title: "Senior Systems Engineer — Low-Latency", dept: "Engineering", location: "London", type: "Full-time", level: "Senior" },
  { title: "Quantitative Developer — Market Making", dept: "Engineering", location: "London / Remote", type: "Full-time", level: "Senior" },
  { title: "Platform Engineer — Infrastructure", dept: "Engineering", location: "Singapore", type: "Full-time", level: "Mid-Senior" },
  { title: "Senior FX Trader", dept: "Trading", location: "London", type: "Full-time", level: "Senior" },
  { title: "Derivatives Strategist", dept: "Trading", location: "New York", type: "Full-time", level: "Senior" },
  { title: "Head of Product Design", dept: "Product", location: "London / Remote", type: "Full-time", level: "Lead" },
  { title: "Product Manager — Trading Platform", dept: "Product", location: "London", type: "Full-time", level: "Mid-Senior" },
  { title: "Senior Compliance Analyst — MAS", dept: "Compliance", location: "Singapore", type: "Full-time", level: "Senior" },
  { title: "KYC / AML Specialist", dept: "Compliance", location: "London", type: "Full-time", level: "Mid" },
  { title: "Head of Client Operations", dept: "Operations", location: "London", type: "Full-time", level: "Lead" },
];

const BENEFITS = [
  { title: "Competitive Compensation", body: "Base salary in the top quartile for your role, with performance-linked bonuses and equity participation for senior positions." },
  { title: "Flexible Working", body: "Hybrid arrangements across all offices. Core hours are 10–4 in your local timezone. Remote-first roles available in engineering and product." },
  { title: "Learning Budget", body: "£5,000 annual learning budget per employee for courses, conferences, certifications, and books. No approval needed for amounts under £500." },
  { title: "Health & Wellbeing", body: "Comprehensive private healthcare for you and your family, mental health support, gym membership, and annual wellbeing allowance." },
  { title: "Parental Leave", body: "26 weeks fully paid parental leave for all parents, regardless of gender, with flexible return-to-work arrangements." },
  { title: "Global Mobility", body: "Permanent employees can spend up to 90 days per year working from any of our global offices." },
];

export default function CareersPageContent() {
  const [activeDept, setActiveDept] = useState("All");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const filtered = activeDept === "All" ? ROLES : ROLES.filter(r => r.dept === activeDept);

  return (
    <div style={{ background: "#080a0f" }} className="pb-32">

      {/* Culture strip */}
      <div
        className="px-6 py-8"
        style={{ borderBottom: "1px solid rgba(37,45,61,0.3)", background: "rgba(14,17,24,0.4)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "180+", label: "Team Members" },
            { value: "22", label: "Nationalities" },
            { value: "4", label: "Global Offices" },
            { value: "94%", label: "Retention Rate" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gradient-gold mb-1" style={{ letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#6b7a8d" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Open roles */}
      <div className="max-w-7xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-8 h-px" style={{ background: "#10d48e" }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: "#10d48e" }}>
            Open Positions
          </span>
        </motion.div>

        {/* Department filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDept(d)}
              className="px-4 py-2 text-xs font-medium tracking-widest uppercase"
              style={{
                border: `1px solid ${activeDept === d ? "rgba(16,212,142,0.4)" : "rgba(37,45,61,0.5)"}`,
                color: activeDept === d ? "#10d48e" : "#6b7a8d",
                background: activeDept === d ? "rgba(16,212,142,0.06)" : "transparent",
                borderRadius: "2px",
                transition: "all 0.2s",
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Role list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((role, i) => (
              <motion.div
                key={role.title}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className="p-5 cursor-pointer"
                  style={{
                    border: "1px solid rgba(37,45,61,0.4)",
                    background: expandedRole === role.title ? "rgba(16,212,142,0.04)" : "rgba(14,17,24,0.4)",
                    borderRadius: "4px",
                    transition: "background 0.2s",
                  }}
                  onClick={() => setExpandedRole(expandedRole === role.title ? null : role.title)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold mb-1" style={{ color: "#f0ede8" }}>{role.title}</div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs" style={{ color: "#6b7a8d" }}>{role.location}</span>
                        <span className="text-xs" style={{ color: "rgba(37,45,61,0.8)" }}>·</span>
                        <span className="text-xs" style={{ color: "#6b7a8d" }}>{role.type}</span>
                        <span className="text-xs" style={{ color: "rgba(37,45,61,0.8)" }}>·</span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#10d48e" }}
                        >
                          {role.dept}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-xs px-2.5 py-1"
                        style={{
                          background: "rgba(37,45,61,0.4)",
                          color: "#9fa8b4",
                          borderRadius: "2px",
                        }}
                      >
                        {role.level}
                      </span>
                      <motion.span
                        style={{ color: "#6b7a8d" }}
                        animate={{ rotate: expandedRole === role.title ? 180 : 0 }}
                      >
                        ↓
                      </motion.span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedRole === role.title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="pt-5 mt-5"
                          style={{ borderTop: "1px solid rgba(37,45,61,0.3)" }}
                        >
                          <p className="text-sm leading-relaxed mb-5" style={{ color: "#6b7a8d" }}>
                            We are looking for an exceptional {role.title.split(" — ")[0].toLowerCase()} to join our{" "}
                            {role.dept.toLowerCase()} team in {role.location}. This is a {role.level.toLowerCase()}{" "}
                            role for someone who wants to work on infrastructure that processes billions of dollars
                            in transactions daily.
                          </p>
                          <a
                            href="/auth/open-account"
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-widest uppercase"
                            style={{
                              background: "linear-gradient(135deg, #10d48e, #00bcd4)",
                              color: "#040507",
                              borderRadius: "2px",
                            }}
                          >
                            Apply Now
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-8 h-px" style={{ background: "#c9a84c" }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>
            Benefits
          </span>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-6"
              style={{
                border: "1px solid rgba(37,45,61,0.4)",
                background: "rgba(14,17,24,0.4)",
                borderRadius: "4px",
              }}
            >
              <div className="font-semibold mb-3" style={{ color: "#f0ede8" }}>{b.title}</div>
              <p className="text-sm leading-relaxed" style={{ color: "#6b7a8d" }}>{b.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
