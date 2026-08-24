import { CartProvider } from "../cart-context";
import PromoBar from "../components/PromoBar";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

// Storefront chrome. It sits here rather than in the ROOT layout so that a
// route outside this group gets the bare shell instead — a nested layout
// cannot escape a parent layout in the App Router, so anything that should not
// carry the promo bar, nav and footer has to live as a sibling of (store).
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
