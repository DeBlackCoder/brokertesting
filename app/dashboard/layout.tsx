import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — AUREX",
};

/**
 * Dashboard segment layout.
 * Intentionally minimal — suppresses the public TickerBar/NavBar
 * that the root layout adds via body className.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
