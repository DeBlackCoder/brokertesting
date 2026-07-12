"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Notif {
  _id:       string;
  type:      string;
  title:     string;
  message:   string;
  read:      boolean;
  link?:     string;
  createdAt: string;
}

const TYPE_COLOR: Record<string, string> = {
  deposit: "#10d48e",
  payout:  "#10d48e",
  trade:   "#00bcd4",
  system:  "#9fa8b4",
  alert:   "#c9a84c",
  kyc:     "#9b59b6",
};

// One consistent stroke-icon set instead of emoji, so notifications read
// as part of the product's own visual language rather than borrowing
// whatever glyphs the reader's OS happens to render.
function TypeIcon({ type }: { type: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "deposit":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" {...common}>
          <path d="M8 2.5v7"/><path d="M5 6.5l3 3 3-3"/>
          <path d="M2.5 11.5v1.5a1 1 0 001 1h9a1 1 0 001-1v-1.5"/>
        </svg>
      );
    case "payout":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" {...common}>
          <path d="M8 12.5v-7"/><path d="M5 8.5l3-3 3 3"/>
          <path d="M2.5 11.5v1.5a1 1 0 001 1h9a1 1 0 001-1v-1.5"/>
        </svg>
      );
    case "trade":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" {...common}>
          <path d="M2 12l3.5-4 2.5 2.5L13 4"/><path d="M9.5 4H13v3.5"/>
        </svg>
      );
    case "alert":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" {...common}>
          <path d="M8 2L14.5 13.5H1.5L8 2z"/>
          <path d="M8 6.7v3"/><path d="M8 11.6h.01"/>
        </svg>
      );
    case "kyc":
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" {...common}>
          <rect x="2" y="3.2" width="12" height="9.6" rx="1.5"/>
          <circle cx="6" cy="7.1" r="1.3"/>
          <path d="M4 10.7c0-1.15.98-1.7 2-1.7s2 .55 2 1.7"/>
          <path d="M9.6 6.4h2.8"/><path d="M9.6 8.7h2.8"/>
        </svg>
      );
    default: // system
      return (
        <svg width="15" height="15" viewBox="0 0 16 16" {...common}>
          <circle cx="8" cy="8" r="6"/>
          <path d="M8 7.2v4"/><path d="M8 5.1h.01"/>
        </svg>
      );
  }
}

function BellIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 1a4 4 0 014 4v2.5l1 2H2l1-2V5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

interface Props {
  onNavigate?: (tab: string) => void;
}

export default function NotificationBell({ onNavigate }: Props) {
  const [open,   setOpen]   = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetch_ = useCallback(async () => {
    const token = localStorage.getItem("aurex_token") ?? "";
    const res   = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const json  = await res.json();
    setNotifs(json.data?.notifications ?? []);
    setUnread(json.data?.unread ?? 0);
  }, []);

  // Poll every 30s
  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 30_000);
    return () => clearInterval(id);
  }, [fetch_]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem("aurex_token") ?? "";
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:   JSON.stringify({ action: "mark_all_read" }),
    });
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const markOneRead = async (id: string, link?: string) => {
    const token = localStorage.getItem("aurex_token") ?? "";
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:   JSON.stringify({ action: "mark_read", id }),
    });
    setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
    if (link && onNavigate) onNavigate(link);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetch_(); }}
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          width:          36,
          height:         36,
          position:       "relative",
          background:     open ? "rgba(37,45,61,0.55)" : "rgba(14,17,24,0.6)",
          border:         "1px solid rgba(37,45,61,0.4)",
          borderRadius:   8,
          cursor:         "pointer",
          color:          open ? "#c3cad4" : "#6b7a8d",
          flexShrink:     0,
          padding:        0,
          transition:     "background 0.15s, color 0.15s",
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.color = "#9fa8b4"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = "#6b7a8d"; }}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <BellIcon/>
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: "absolute", top: -3, right: -3,
              minWidth: 16, height: 16, padding: "0 3px", borderRadius: 8,
              background: "#ef4444", color: "#fff",
              fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid #0d0f14",
              boxShadow: "0 0 0 0 rgba(239,68,68,0.4)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position:      "absolute",
              top:           "calc(100% + 8px)",
              right:         0,
              width:         "min(340px, calc(100vw - 24px))",
              maxHeight:     440,
              background:    "rgba(13,15,20,0.98)",
              border:        "1px solid rgba(37,45,61,0.5)",
              borderRadius:  10,
              backdropFilter:"blur(20px)",
              zIndex:        200,
              overflow:      "hidden",
              boxShadow:     "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(37,45,61,0.4)" }}>
              <span className="text-sm font-bold" style={{ color: "#f0ede8" }}>
                Notifications {unread > 0 && <span style={{ color: "#10d48e" }}>({unread})</span>}
              </span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs" style={{ color: "#10d48e" }}>
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", maxHeight: 380 }}>
              {!notifs.length ? (
                <div className="py-12 flex flex-col items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(37,45,61,0.35)", color: "#4a5568" }}>
                    <BellIcon size={17}/>
                  </div>
                  <p className="text-xs" style={{ color: "#4a5568" }}>No notifications yet.</p>
                </div>
              ) : (
                notifs.map(n => (
                  <button
                    key={n._id}
                    onClick={() => markOneRead(n._id, n.link)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background:   n.read ? "transparent" : "rgba(16,212,142,0.04)",
                      borderBottom: "1px solid rgba(37,45,61,0.2)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(37,45,61,0.2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(16,212,142,0.04)")}
                  >
                    <div
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                      style={{
                        background: `${TYPE_COLOR[n.type] ?? "#9fa8b4"}18`,
                        color:      TYPE_COLOR[n.type] ?? "#9fa8b4",
                      }}
                    >
                      <TypeIcon type={n.type}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold truncate"
                          style={{ color: n.read ? "#9fa8b4" : TYPE_COLOR[n.type] ?? "#f0ede8" }}>
                          {n.title}
                        </span>
                        <span className="text-xs shrink-0" style={{ color: "#4a5568" }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#6b7a8d" }}>{n.message}</p>
                    </div>
                    {!n.read && (
                      <div className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#10d48e" }}/>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}