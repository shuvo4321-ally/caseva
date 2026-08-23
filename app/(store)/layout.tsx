import { CartProvider } from "../cart-context";
import PromoBar from "../components/PromoBar";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

// Storefront chrome. This used to live in the ROOT layout, which meant every
// route got it — including /admin. A nested layout cannot escape a parent
// layout in the App Router, so the shop moved into this route group instead.
// The "(store)" folder name is a group: it does NOT appear in URLs, so /shop
// is still /shop.
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      <PromoBar />
      <Nav />
      {children}
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
