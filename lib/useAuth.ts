"use client";

import { useEffect, useState } from "react";

export type UserRole = "user" | "admin" | "super_admin";

export interface AuthUser {
  userId:      string;
  email:       string;
  accountType: string;
  kycStatus:   string;
  role:        UserRole;
}

interface UseAuthResult {
  user:         AuthUser | null;
  role:         UserRole | null;
  isAdmin:      boolean;
  isSuperAdmin: boolean;
  isUser:       boolean;
  loaded:       boolean;
  signOut:      () => void;
}

function parseJWT(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // role may not exist in older tokens — default to "user"
    return {
      userId:      payload.userId      ?? "",
      email:       payload.email       ?? "",
      accountType: payload.accountType ?? "individual",
      kycStatus:   payload.kycStatus   ?? "pending",
      role:        payload.role        ?? "user",
    };
  } catch {
    return null;
  }
}

export function useAuth(): UseAuthResult {
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("aurex_token");
    if (token) setUser(parseJWT(token));
    setLoaded(true);

    // Re-read if another tab updates localStorage
    const handler = (e: StorageEvent) => {
      if (e.key === "aurex_token") {
        setUser(e.newValue ? parseJWT(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const signOut = () => {
    localStorage.removeItem("aurex_token");
    window.location.href = "/";
  };

  const role = user?.role ?? null;

  return {
    user,
    role,
    isAdmin:      role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
    isUser:       role === "user",
    loaded,
    signOut,
  };
}
