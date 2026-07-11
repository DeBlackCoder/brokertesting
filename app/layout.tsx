import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import TickerBar from "./components/TickerBar";

/* ── Hero / editorial — ultra-refined serif for big display text ── */
const cormorant = Cormorant_Garamond({
  variable: "--font-hero",
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
  style:    ["normal", "italic"],
  display:  "swap",
});

/* ── UI headings — clean geometric sans for section titles ── */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700"],
  display:  "swap",
});

/* ── Body — Inter for all UI, labels, body copy ── */
const inter = Inter({
  variable: "--font-sans",
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
  display:  "swap",
});

/* ── Mono — JetBrains for prices and numbers ── */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700"],
  display:  "swap",
});

export const viewport: Viewport = {
  width:         "device-width",
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
  viewportFit:   "cover",
};

export const metadata: Metadata = {
  title: "AUREX — Elite Investment & Trading",
  description:
    "AUREX is the premier brokerage platform for high-net-worth individuals, institutions, and professional traders. Experience the future of wealth.",
  keywords: "investment, trading, brokerage, wealth management, institutional, hedge fund",
  openGraph: {
    title:       "AUREX — Elite Investment & Trading",
    description: "Experience the future of wealth.",
    type:        "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col noise">
        {children}
        {/* Spacer so content never sits behind the fixed TickerBar */}
        <div aria-hidden="true" style={{ height: "80px", flexShrink: 0 }} />
        <TickerBar />
      </body>
    </html>
  );
}
