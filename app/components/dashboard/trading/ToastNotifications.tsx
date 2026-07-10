"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Toast, ToastType } from "./useToast";

const STYLES: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
  profit:  { bg:"rgba(16,212,142,0.12)",  border:"rgba(16,212,142,0.35)",  icon:"▲", color:"#10d48e" },
  loss:    { bg:"rgba(239,68,68,0.12)",   border:"rgba(239,68,68,0.35)",   icon:"▼", color:"#ef4444" },
  sl:      { bg:"rgba(239,68,68,0.15)",   border:"rgba(239,68,68,0.5)",    icon:"🛑", color:"#ef4444" },
  tp:      { bg:"rgba(16,212,142,0.15)",  border:"rgba(16,212,142,0.5)",   icon:"🎯", color:"#10d48e" },
  info:    { bg:"rgba(0,188,212,0.12)",   border:"rgba(0,188,212,0.3)",    icon:"ℹ",  color:"#00bcd4" },
  warning: { bg:"rgba(201,168,76,0.12)",  border:"rgba(201,168,76,0.35)",  icon:"⚠",  color:"#c9a84c" },
  market:  { bg:"rgba(155,89,182,0.12)",  border:"rgba(155,89,182,0.35)",  icon:"📊", color:"#9b59b6" },
  alert:   { bg:"rgba(201,168,76,0.15)",  border:"rgba(201,168,76,0.5)",   icon:"⚡", color:"#c9a84c" },
};

interface Props {
  toasts:   Toast[];
  onDismiss:(id: string) => void;
}

export default function ToastNotifications({ toasts, onDismiss }: Props) {
  return (
    <div style={{
      position: "fixed",
      bottom:   80,  // above TickerBar
      right:    16,
      zIndex:   9000,
      display:  "flex",
      flexDirection: "column-reverse",
      gap:      8,
      maxWidth: 320,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {toasts.map(t => {
          const s = STYLES[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity:0, x:60, scale:0.9 }}
              animate={{ opacity:1, x:0,  scale:1   }}
              exit={{    opacity:0, x:60, scale:0.85 }}
              transition={{ type:"spring", stiffness:400, damping:28 }}
              style={{
                background:   s.bg,
                border:       `1px solid ${s.border}`,
                borderRadius: 8,
                padding:      "10px 14px",
                backdropFilter:"blur(16px)",
                cursor:       "pointer",
                pointerEvents:"auto",
                minWidth:     240,
              }}
              onClick={() => onDismiss(t.id)}
            >
              <div className="flex items-start gap-3">
                <span style={{ fontSize:16, lineHeight:1, marginTop:1 }}>{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div style={{ color:s.color, fontWeight:700, fontSize:12, marginBottom:2 }}>
                    {t.title}
                  </div>
                  <div style={{ color:"#9fa8b4", fontSize:11, lineHeight:1.5 }}>
                    {t.message}
                  </div>
                </div>
                <button style={{ color:"#4a5568", fontSize:14, lineHeight:1, flexShrink:0, marginTop:-1 }}
                  onClick={e => { e.stopPropagation(); onDismiss(t.id); }}>×</button>
              </div>
              {/* Progress bar */}
              <motion.div style={{ height:2, background:s.color, borderRadius:1, marginTop:8, originX:0 }}
                initial={{ scaleX:1 }} animate={{ scaleX:0 }}
                transition={{ duration:5, ease:"linear" }}/>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
