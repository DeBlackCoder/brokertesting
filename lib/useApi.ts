"use client";

import { useState, useEffect, useCallback } from "react";

interface UseApiResult<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

/**
 * Simple data-fetching hook that reads the JWT from localStorage
 * and attaches it as a Bearer token.
 */
export function useApi<T>(path: string, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("aurex_token") ?? ""
          : "";

        const res  = await fetch(path, {
          headers: { Authorization: `Bearer ${token}` },
          cache:   "no-store",
        });
        const json = await res.json();

        if (!res.ok)       throw new Error(json.error ?? "Request failed");
        if (!cancelled)    setData(json.data ?? json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);

  return { data, loading, error, refetch };
}

export async function apiPost<T>(path: string, body: unknown): Promise<{ data?: T; error?: string }> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("aurex_token") ?? ""
    : "";
  const res  = await fetch(path, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error ?? "Request failed" };
  return { data: json.data };
}

export async function apiPatch<T>(path: string, body: unknown): Promise<{ data?: T; error?: string }> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("aurex_token") ?? ""
    : "";
  const res  = await fetch(path, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error ?? "Request failed" };
  return { data: json.data };
}
