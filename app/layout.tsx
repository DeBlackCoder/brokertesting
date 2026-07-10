import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TickerBar from "./components/TickerBar";

const geistSans = Geist({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AUREX — Elite Investment & Trading",
  description:
    "AUREX is the premier brokerage platform for high-net-worth individuals, institutions, and professional traders. Experience the future of wealth.",
  keywords: "investment, trading, brokerage, wealth management, institutional, hedge fund",
  openGraph: {
    title: "AUREX — Elite Investment & Trading",
    description: "Experience the future of wealth.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col noise" style={{ paddingBottom: "var(--ticker-h, 40px)" }}>
        {children}
        <TickerBar />
      </body>
    </html>
  );
}
