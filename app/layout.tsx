import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "CASEVA — Your Paradise, Case by Case",
  description:
    "Designer iPhone cases pretty enough to keep on. Impact-tested protection, 100% recycled materials, MagSafe ready — from $32.",
  openGraph: {
    title: "CASEVA — Your Paradise, Case by Case",
    description:
      "Designer iPhone cases pretty enough to keep on. Impact-tested protection, 100% recycled materials, MagSafe ready.",
    type: "website",
    images: ["/cream-floral-case-v2.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  /* No maximumScale / userScalable lock — pinch-zoom must stay available
     (WCAG 1.4.4; shoppers zoom product photos). */
  themeColor: "#fff9d6",
};

// Shell only — html, body, fonts, globals. The storefront's chrome (promo bar,
// nav, footer, cart drawer) lives in app/(store)/layout.tsx, so a route added
// outside that group renders on the bare shell.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
