import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./cart-context";
import PromoBar from "./components/PromoBar";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
          <a href="#main" className="skip-link">Skip to content</a>
          <PromoBar />
          <Nav />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
