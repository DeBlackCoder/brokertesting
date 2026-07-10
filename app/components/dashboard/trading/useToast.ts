"use client";

import { useState, useCallback } from "react";

export type ToastType = "profit" | "loss" | "sl" | "tp" | "info" | "warning" | "market" | "alert";

export interface Toast {
  id:      string;
  type:    ToastType;
  title:   string;
  message: string;
  ts:      number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: ToastType, title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(t => [...t.slice(-4), { id, type, title, message, ts: Date.now() }]);
    // Auto-dismiss after 5s
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return { toasts, add, dismiss };
}
