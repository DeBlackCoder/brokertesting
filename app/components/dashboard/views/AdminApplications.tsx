"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiPatch } from "@/lib/useApi";
import { ErrorState } from "../Skeleton";

interface Application {
  _id: string;
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  employmentStatus: string;
  annualIncome: string;
  netWorth: string;
  tradingExperience: string;
  sourceOfFunds: string;
  status: string;
  createdAt: string;
  reviewNotes?: string;
}

interface ApplicationsData {
  applications: Application[];
  total: number;
  page: number;
  pages: number;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  submitted:           { bg: "rgba(0,188,212,0.1)",   color: "#00bcd4"  },
  under_review:        { bg: "rgba(201,168,76,0.1)",  color: "#c9a84c"  },
  approved:            { bg: "rgba(16,212,142,0.1)",  color: "#10d48e"  },
  rejected:            { bg: "rgba(239,68,68,0.1)",   color: "#ef4444"  },
  more_info_required:  { bg: "rgba(155,89,182,0.1)",  color: "#9b59b6"  },
};

export default function AdminApplications() {
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatus] = useState("");
  const [page, setPage]       = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving]   = useState<string | null>(null);
  const [notes, setNotes]     = useState<Record<string, string>>({});

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (search)       params.set("search", search);
  if (statusFilter) params.set("status", statusFilter);

  const { data, loading, error, refetch } = useApi<ApplicationsData>(
    `/api/admin/applications?${params}`, [search, statusFilter, page]
  );

  const review = async (id: string, status: string) => {
    setSaving(id);
    const { error: err } = await apiPatch(`/api/admin/applications/${id}`, {
      status,
      reviewNotes: notes[id] ?? "",
    });
    setSaving(null);
    if (err) alert(err);
    else { setExpanded(null); refetch(); }
  };

  if (error) return <ErrorState message={error} onRetry={refetch}/>;

  const inputCls: React.CSSProperties = {
    background: "rgba(37,45,61,0.25)", border: "1px solid rgba(37,45,61,0.5)",
    borderRadius: 4, color: "#f0ede8", padding: "8px 12px", fontSize: "0.8rem", outline: "none",
  };

  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f0ede8", letterSpacing: "-0.02em" }}>Applications</h1>
        <p className="text-xs mt-1" style={{ color: "#4a5568" }}>
          {data ? `${data.total} total applications` : "Loading…"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input placeholder="Search email or name…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inputCls, width: 240 }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,212,142,0.4)")}
          onBlur={e  => (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)")}/>
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ ...inputCls, appearance: "none" }}>
          <option value="">All Statuses</option>
          {["submitted","under_review","approved","rejected","more_info_required"].map(s => (
            <option key={s} value={s} style={{ background: "#0e1118" }}>{s.replace("_"," ")}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(14,17,24,0.8)", border: "1px solid rgba(37,45,61,0.45)", borderRadius: 8, overflowX: "auto" }}>
        {loading ? (
          <div className="p-10 text-center text-sm" style={{ color: "#4a5568" }}>Loading applications…</div>
        ) : !data?.applications.length ? (
          <div className="p-10 text-center text-sm" style={{ color: "#4a5568" }}>No applications found.</div>
        ) : (
          <>
            <table className="w-full text-sm" style={{ minWidth: 620 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(37,45,61,0.4)" }}>
                  {["Applicant","Type","Country","Income","Status","Submitted","Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#4a5568" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.applications.map((a, i) => {
                  const s = STATUS_STYLES[a.status] ?? STATUS_STYLES.submitted;
                  const isOpen = expanded === a._id;
                  return (
                    <React.Fragment key={a._id}>
                      <motion.tr key={a._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.03 }}
                        className="cursor-pointer"
                        style={{ borderBottom: isOpen ? "none" : "1px solid rgba(37,45,61,0.2)", background: isOpen ? "rgba(16,212,142,0.03)" : "transparent" }}
                        onClick={() => setExpanded(isOpen ? null : a._id)}>
                        <td className="px-5 py-3">
                          <div className="font-medium text-xs" style={{ color: "#f0ede8" }}>{a.firstName} {a.lastName}</div>
                          <div className="text-xs" style={{ color: "#4a5568" }}>{a.email}</div>
                        </td>
                        <td className="px-5 py-3 text-xs capitalize" style={{ color: "#9fa8b4" }}>{a.accountType}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "#9fa8b4" }}>{a.country || "—"}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "#9fa8b4" }}>{a.annualIncome || "—"}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2 py-0.5 rounded font-bold capitalize"
                            style={{ background: s.bg, color: s.color }}>
                            {a.status.replace("_"," ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "#4a5568" }}>
                          {new Date(a.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs" style={{ color: "#6b7a8d" }}>{isOpen ? "▲ Close" : "▼ Review"}</span>
                        </td>
                      </motion.tr>

                      {/* Expanded review panel */}
                      <AnimatePresence>
                        {isOpen && (
                          <tr>
                            <td colSpan={7} style={{ padding: 0, borderBottom: "1px solid rgba(37,45,61,0.3)" }}>
                              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                                exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}
                                className="overflow-hidden">
                                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6"
                                  style={{ background: "rgba(14,17,24,0.6)", borderTop: "1px solid rgba(37,45,61,0.3)" }}>
                                  {/* Details */}
                                  <div>
                                    <div className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#6b7a8d" }}>Application Details</div>
                                    <div className="space-y-2">
                                      {[
                                        ["Phone",        a.phone],
                                        ["Employment",   a.employmentStatus],
                                        ["Net Worth",    a.netWorth],
                                        ["Experience",   a.tradingExperience],
                                        ["Source",       a.sourceOfFunds],
                                      ].map(([l,v]) => (
                                        <div key={l} className="flex justify-between text-xs">
                                          <span style={{ color: "#4a5568" }}>{l}</span>
                                          <span style={{ color: "#9fa8b4" }}>{v || "—"}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Review actions */}
                                  <div>
                                    <div className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#6b7a8d" }}>Review</div>
                                    <textarea
                                      placeholder="Add review notes (optional)…"
                                      value={notes[a._id] ?? a.reviewNotes ?? ""}
                                      onChange={e => setNotes(n => ({ ...n, [a._id]: e.target.value }))}
                                      rows={3}
                                      className="w-full text-xs outline-none resize-none mb-4 p-3"
                                      style={{ background: "rgba(37,45,61,0.25)", border: "1px solid rgba(37,45,61,0.5)", borderRadius: 4, color: "#f0ede8" }}
                                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,212,142,0.4)")}
                                      onBlur={e  => (e.currentTarget.style.borderColor = "rgba(37,45,61,0.5)")}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                      {[
                                        { s: "under_review",       l: "Mark Under Review", bg: "rgba(201,168,76,0.1)",  c: "#c9a84c" },
                                        { s: "approved",           l: "Approve",            bg: "rgba(16,212,142,0.1)", c: "#10d48e" },
                                        { s: "rejected",           l: "Reject",             bg: "rgba(239,68,68,0.08)", c: "#ef4444" },
                                        { s: "more_info_required", l: "Request Info",       bg: "rgba(155,89,182,0.1)", c: "#9b59b6" },
                                      ].map(btn => (
                                        <button key={btn.s} disabled={saving === a._id || a.status === btn.s}
                                          onClick={() => review(a._id, btn.s)}
                                          className="text-xs px-3 py-1.5 rounded font-semibold"
                                          style={{ background: btn.bg, color: btn.c, border: `1px solid ${btn.c}30`, opacity: a.status === btn.s ? 0.4 : 1 }}>
                                          {saving === a._id ? "…" : btn.l}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#4a5568" }}>Page {data.page} of {data.pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="text-xs px-3 py-1.5 rounded"
              style={{ border: "1px solid rgba(37,45,61,0.5)", color: "#6b7a8d", opacity: page <= 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
              className="text-xs px-3 py-1.5 rounded"
              style={{ border: "1px solid rgba(37,45,61,0.5)", color: "#6b7a8d", opacity: page >= data.pages ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
