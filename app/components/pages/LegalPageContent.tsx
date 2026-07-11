"use client";

import { motion } from "framer-motion";

interface Section {
  heading: string;
  body: string;
}

interface LegalPageContentProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalPageContent({ title, lastUpdated, sections }: LegalPageContentProps) {
  return (
    <div style={{ background: "#080a0f" }}>
      {/* Header bar */}
      <div
        className="border-b px-6 py-8"
        style={{ borderColor: "rgba(37,45,61,0.4)" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1
            className="text-3xl font-bold"
            style={{ color: "#f0ede8", letterSpacing: "-0.02em", fontFamily: "var(--font-hero, Cormorant Garamond, Georgia, serif)" }}
          >
            {title}
          </h1>
          <span className="text-sm" style={{ color: "#6b7a8d" }}>
            Last updated: {lastUpdated}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-16 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Risk callout */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 p-6 rounded-sm"
            style={{
              border: "1px solid rgba(201,168,76,0.2)",
              background: "rgba(201,168,76,0.04)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "#9fa8b4" }}>
              <span className="font-bold" style={{ color: "#c9a84c" }}>Important: </span>
              Trading in financial instruments involves substantial risk of loss. Please read
              this document carefully before using AUREX services. If you have any questions,
              contact{" "}
              <a href="mailto:legal@aurex.com" style={{ color: "#10d48e" }}>
                legal@aurex.com
              </a>
              .
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ color: "#f0ede8", letterSpacing: "-0.01em" }}
                >
                  {s.heading}
                </h2>
                <div className="space-y-4">
                  {s.body.split("\n\n").map((para, j) => (
                    <p
                      key={j}
                      className="text-sm leading-relaxed"
                      style={{ color: "#6b7a8d" }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
                {i < sections.length - 1 && (
                  <div
                    className="mt-12 h-px"
                    style={{ background: "rgba(37,45,61,0.4)" }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 p-8 rounded-sm"
            style={{
              border: "1px solid rgba(37,45,61,0.4)",
              background: "rgba(14,17,24,0.6)",
            }}
          >
            <h3
              className="text-sm font-bold tracking-widest uppercase mb-3"
              style={{ color: "#9fa8b4" }}
            >
              Questions about this document?
            </h3>
            <p className="text-sm mb-4" style={{ color: "#6b7a8d" }}>
              Our legal team is available to address any questions or concerns.
            </p>
            <a
              href="mailto:legal@aurex.com"
              className="text-sm font-semibold tracking-widest uppercase"
              style={{ color: "#10d48e" }}
            >
              legal@aurex.com →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
