"use client";

import { useAuth, UserRole } from "@/lib/useAuth";

interface RoleGuardProps {
  require: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RANK: Record<UserRole, number> = { user: 0, admin: 1, super_admin: 2 };

/**
 * Renders children only if the current user's role meets the required level.
 * Shows fallback (or nothing) otherwise.
 * Renders nothing until auth is loaded to prevent flash.
 */
export default function RoleGuard({ require: minRole, children, fallback = null }: RoleGuardProps) {
  const { role, loaded } = useAuth();
  if (!loaded) return null;
  if (!role || RANK[role] < RANK[minRole]) return <>{fallback}</>;
  return <>{children}</>;
}
