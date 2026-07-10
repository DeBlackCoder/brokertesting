"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/useAuth";

// Views
import DashOverview      from "./views/DashOverview";
import DashPerformance   from "./views/DashPerformance";
import DashMyAccount     from "./views/DashMyAccount";
import DashWallet        from "./views/DashWallet";
import DashTrade         from "./views/DashTrade";
import DashPayouts       from "./views/DashPayouts";
import DashSettings      from "./views/DashSettings";
import AdminUsers        from "./views/AdminUsers";
import AdminApplications from "./views/AdminApplications";
import AdminStats        from "./views/AdminStats";
import AdminWallet       from "./views/AdminWallet";
import AdminPayouts      from "./views/AdminPayouts";
import NotificationBell  from "./NotificationBell";

type Tab =
  | "overview" | "my-account" | "performance" | "wallet" | "trade" | "payouts" | "settings"
  | "admin-stats" | "admin-users" | "admin-applications" | "admin-wallet" | "admin-payouts";

const ICONS = {
  grid: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="8" y="1" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1" y="8" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="8" y="8" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  user: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1.5 12c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  chart: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polyline points="1,10 4,6 7,8 11,3 13,5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  card: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="1" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  cog: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M3 3l1 1M10 10l1 1M3 11l1-1M10 4l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  users: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="10" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M10.5 8.5c1.5.3 2.5 1.5 2.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  file: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10 1l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 1v2h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="4" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <line x1="4" y1="7.5" x2="9" y2="7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <line x1="4" y1="9.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  pulse: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polyline points="1,7 3,7 5,3 7,11 9,5 11,7 13,7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wallet: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="10" cy="9" r="1" fill="currentColor"/>
    </svg>
  ),
  trade: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polyline points="1,10 4,5 7,8 10,2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="8,2 10,2 10,4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const USER_NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",    label: "Overview",    icon: ICONS.grid  },
  { id: "my-account",  label: "My Account",  icon: ICONS.user  },
  { id: "wallet",      label: "Wallet",      icon: ICONS.wallet },
  { id: "trade",       label: "Trade",       icon: ICONS.trade  },
  { id: "performance", label: "Performance", icon: ICONS.chart  },
  { id: "payouts",     label: "Payouts",     icon: ICONS.card   },
  { id: "settings",    label: "Settings",    icon: ICONS.cog    },
];

const ADMIN_NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "admin-stats",        label: "Platform Stats",  icon: ICONS.pulse  },
  { id: "admin-users",        label: "Users",           icon: ICONS.users  },
  { id: "admin-applications", label: "Applications",    icon: ICONS.file   },
  { id: "admin-wallet",       label: "Wallet Mgmt",     icon: ICONS.wallet },
  { id: "admin-payouts",      label: "Finance & Comms", icon: ICONS.card   },
];

const TAB_LABELS: Record<Tab, string> = {
  "overview":            "Overview",
  "my-account":          "My Account",
  "wallet":              "Wallet",
  "trade":               "Trade",
  "performance":         "Performance",
  "payouts":             "Payouts",
  "settings":            "Settings",
  "admin-stats":         "Platform Stats",
  "admin-users":         "Users",
  "admin-applications":  "Applications",
  "admin-wallet":        "Wallet Management",
  "admin-payouts":       "Finance & Comms",
};

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  user:        { label: "User",        color: "#9fa8b4",  bg: "rgba(37,45,61,0.4)"          },
  admin:       { label: "Admin",       color: "#c9a84c",  bg: "rgba(201,168,76,0.12)"        },
  super_admin: { label: "Super Admin", color: "#10d48e",  bg: "rgba(16,212,142,0.12)"        },
};

function NavItem({ item, active, onClick }: { item: { id: Tab; label: string; icon: React.ReactNode }; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left relative transition-all"
      style={{
        color:        active ? "#10d48e" : "#6b7a8d",
        background:   active ? "rgba(16,212,142,0.07)" : "transparent",
        borderRadius: "6px",
        borderLeft:   active ? "2px solid #10d48e" : "2px solid transparent",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.65 }}>{item.icon}</span>
      {item.label}
    </button>
  );
}

export default function DashboardLayout() {
  const { user, role, isAdmin, isSuperAdmin, signOut, loaded } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [initials, setInitials] = useState("AC");

  useEffect(() => {
    try {
      const token = localStorage.getItem("aurex_token");
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      setInitials((payload.email ?? "AC").slice(0, 2).toUpperCase());
    } catch { /* keep default */ }
  }, []);

  useEffect(() => {
    if (loaded && !user) window.location.href = "/auth/signin";
  }, [loaded, user]);

  if (!loaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0c11" }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10d48e" }}/>
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case "overview":            return <DashOverview/>;
      case "my-account":          return <DashMyAccount/>;
      case "wallet":              return <DashWallet/>;
      case "trade":               return <DashTrade/>;
      case "performance":         return <DashPerformance/>;
      case "payouts":             return <DashPayouts/>;
      case "settings":            return <DashSettings/>;
      case "admin-stats":         return isAdmin ? <AdminStats/>         : <AccessDenied/>;
      case "admin-users":         return isAdmin ? <AdminUsers/>         : <AccessDenied/>;
      case "admin-applications":  return isAdmin ? <AdminApplications/>  : <AccessDenied/>;
      case "admin-wallet":        return isAdmin ? <AdminWallet/>        : <AccessDenied/>;
      case "admin-payouts":       return isAdmin ? <AdminPayouts/>       : <AccessDenied/>;
      default:                    return <DashOverview/>;
    }
  };

  const badge = ROLE_BADGE[role ?? "user"];

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo + home link */}
      <div className="px-5 py-5 mb-1">
        <a href="/" className="flex items-center gap-2.5 group mb-3">
          <div className="relative w-6 h-6 shrink-0">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
            <div className="absolute inset-[1.5px]" style={{ background: "#0d0f14", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)" }}/>
            <div className="absolute inset-[3px]" style={{ background: "linear-gradient(135deg,#10d48e,#00bcd4)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity: 0.75 }}/>
          </div>
          <span className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "#f0ede8" }}>AUREX</span>
        </a>
        <a href="/"
          className="flex items-center gap-1 text-xs"
          style={{ color:"#4a5568", transition:"color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color="#6b7a8d")}
          onMouseLeave={e => (e.currentTarget.style.color="#4a5568")}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to site
        </a>
      </div>

      <div className="mx-4 mb-3 h-px" style={{ background: "rgba(37,45,61,0.4)" }}/>

      {/* Main nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {USER_NAV.map(item => (
          <NavItem key={item.id} item={item} active={activeTab === item.id}
            onClick={() => { setActiveTab(item.id); if (mobile) setMobileOpen(false); }}/>
        ))}

        {/* Admin section — only for admin+ */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: "rgba(37,45,61,0.4)" }}/>
                <span className="text-xs font-bold tracking-widest uppercase shrink-0" style={{ color: "#c9a84c" }}>
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(37,45,61,0.4)" }}/>
              </div>
            </div>
            {ADMIN_NAV.map(item => (
              <NavItem key={item.id} item={item} active={activeTab === item.id}
                onClick={() => { setActiveTab(item.id); if (mobile) setMobileOpen(false); }}/>
            ))}
          </>
        )}
      </nav>

      <div className="mx-4 mt-3 mb-3 h-px" style={{ background: "rgba(37,45,61,0.4)" }}/>

      {/* User block */}
      <div className="px-4 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: badge.bg, border: `1px solid ${badge.color}30`, color: badge.color }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: "#f0ede8" }}>
              {user?.email?.split("@")[0] ?? "Account"}
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
              style={{ background: badge.bg, color: badge.color, fontSize: "9px", letterSpacing: "0.05em" }}>
              {badge.label}
            </span>
          </div>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2 text-xs w-full px-2 py-1.5 rounded"
          style={{ color: "#6b7a8d", background: "rgba(37,45,61,0.2)" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 6H10M7.5 3.5L10 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 2H2.5C2 2 1.5 2.5 1.5 3v6c0 .5.5 1 1 1H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0c11", fontFamily: "var(--font-editorial, system-ui)" }}>

      {/* Desktop sidebar — hidden on mobile, scrolls internally */}
      <aside className="hidden md:flex flex-col shrink-0 overflow-y-auto"
        style={{ width: 210, background: "#0d0f14", borderRight: "1px solid rgba(37,45,61,0.35)" }}>
        <Sidebar/>
      </aside>

      {/* Mobile full-screen drawer — triggered by "More" tab */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background:"rgba(4,5,7,0.85)", backdropFilter:"blur(6px)" }}
              onClick={() => setMobileOpen(false)}/>
            <motion.div
              initial={{ x:-260 }} animate={{ x:0 }} exit={{ x:-260 }}
              transition={{ type:"spring", stiffness:320, damping:32 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
              style={{ background:"#0d0f14", borderRight:"1px solid rgba(37,45,61,0.4)" }}>
              <Sidebar mobile/>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Sticky header */}
        <header className="flex items-center justify-between shrink-0"
          style={{
            background:    "rgba(13,15,20,0.95)",
            backdropFilter:"blur(16px)",
            borderBottom:  "1px solid rgba(37,45,61,0.35)",
            position:      "sticky", top:0, zIndex:30,
            padding:       "0 16px",
            height:        52,
          }}>
          {/* Mobile: hamburger + current tab name */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Open menu"
              style={{ color:"#6b7a8d", background:"none", border:"none", padding:0, width:32, height:32 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="5"  x2="16" y2="5"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="2" y1="9"  x2="16" y2="9"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="text-sm font-semibold" style={{ color:"#f0ede8" }}>{TAB_LABELS[activeTab]}</span>
          </div>

          {/* Desktop: breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm" style={{ color:"#6b7a8d" }}>
            <span>Dashboard</span>
            <span style={{ color:"rgba(37,45,61,0.8)" }}>/</span>
            <span style={{ color:"#f0ede8" }}>{TAB_LABELS[activeTab]}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs"
              style={{ border:"1px solid rgba(37,45,61,0.4)", borderRadius:4, background:"rgba(14,17,24,0.6)", color:"#6b7a8d" }}>
              Account <span className="font-mono" style={{ color:"#10d48e" }}>AUREX-001</span>
            </div>
            <div className="hidden sm:block px-2.5 py-1 rounded text-xs font-bold"
              style={{ background:badge.bg, color:badge.color }}>
              {badge.label}
            </div>
            <NotificationBell onNavigate={(tab) => setActiveTab(tab as Tab)}/>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-7 dash-main scroll-smooth-ios">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-4 }} transition={{ duration:0.18 }}
              className="dash-content">
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] flex items-stretch safe-bottom"
        style={{
          background:    "rgba(10,12,17,0.97)",
          backdropFilter:"blur(20px)",
          borderTop:     "1px solid rgba(37,45,61,0.4)",
          height:        "calc(60px + env(safe-area-inset-bottom, 0px))",
        }}>
        {/* Core user tabs always visible */}
        {([
          { id:"overview",    icon: ICONS.grid,   label:"Home"    },
          { id:"trade",       icon: ICONS.trade,  label:"Trade"   },
          { id:"wallet",      icon: ICONS.wallet, label:"Wallet"  },
          { id:"performance", icon: ICONS.chart,  label:"Stats"   },
          { id:"settings",    icon: ICONS.cog,    label:"More"    },
        ] as { id: Tab; icon: React.ReactNode; label: string }[]).map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id}
              onClick={() => {
                if (item.id === "settings") {
                  // "More" opens the sidebar drawer instead of navigating
                  setMobileOpen(o => !o);
                } else {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }
              }}
              style={{
                flex:       1,
                position:   "relative",
                display:    "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap:        3,
                paddingTop: 8,
                paddingBottom: 4,
                background: "none",
                border:     "none",
                cursor:     "pointer",
                color:      active ? "#10d48e" : "#4a5568",
                minHeight:  "unset",
                minWidth:   "unset",
                transition: "color 0.15s",
              }}>
              <span style={{ opacity: active ? 1 : 0.6, transform: active ? "scale(1.1)" : "scale(1)", transition:"all 0.15s" }}>
                {item.icon}
              </span>
              <span style={{ fontSize:10, fontWeight: active ? 700 : 400, letterSpacing:"0.02em" }}>
                {item.label}
              </span>
              {active && (
                <motion.div layoutId="bottom-tab-dot"
                  style={{ position:"absolute", top:0, width:24, height:2, background:"#10d48e", borderRadius:"0 0 2px 2px" }}/>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: "#f0ede8" }}>Access Denied</h2>
      <p className="text-sm" style={{ color: "#6b7a8d" }}>You don't have permission to view this page.</p>
    </div>
  );
}
