import Link from "next/link";

// Shared footer. Section links point at home anchors so they resolve from any
// route; true-external items stay inert placeholders (no fake navigation).
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="logo">CASEVA</div>
          <p className="footer-tag">Your paradise, case by case.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/#collection">All Cases</Link>
          <Link href="/#new-arrivals">New Arrivals</Link>
          <Link href="/#on-sale">On Sale</Link>
        </div>
        <div>
          <h3>Help</h3>
          <a href="#" aria-disabled="true">Shipping</a>
          <a href="#" aria-disabled="true">Returns</a>
          <a href="#" aria-disabled="true">Contact</a>
        </div>
        <div>
          <h3>About</h3>
          <a href="#" aria-disabled="true">Our Story</a>
          <a href="#" aria-disabled="true">Sustainability</a>
          <Link href="/#press">Press</Link>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 CASEVA. All rights reserved.</div>
    </footer>
  );
}
