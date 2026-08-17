"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../cart-context";

// Shared sticky header used on every route. Section links point at the home
// page anchors ("/#collection") so they work from product/checkout routes too.
export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { count, openDrawer } = useCart();

  // Close the mobile menu on outside tap or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const cartClick = () => {
    setMenuOpen(false);
    openDrawer();
  };

  return (
    <nav className="nav-bar" ref={navRef}>
      <div className="nav-inner">
        <Link className="logo" href="/" aria-label="CASEVA home">
          CASEVA
        </Link>
        <div className="nav-right">
          <button className="icon-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          <button className="icon-btn" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 20a6 6 0 0 0-12 0" />
              <circle cx="12" cy="10" r="4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
          <button className="icon-btn cart-btn" aria-label={`Cart, ${count} items`} onClick={cartClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className="cart-badge" aria-hidden="true">{count}</span>}
          </button>
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div id="nav-menu" className={`nav-menu ${menuOpen ? "is-open" : ""}`}>
        <Link className="nav-menu-link" href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
        <Link className="nav-menu-link" href="/#compare" onClick={() => setMenuOpen(false)}>Why CASEVA</Link>
        <Link className="nav-menu-link" href="/#subscribe" onClick={() => setMenuOpen(false)}>Subscribe</Link>
        {/* Cart lives here on mobile (icon hidden from the bar to de-clutter) */}
        <button type="button" className="nav-menu-link nav-menu-cart" aria-label={`Cart, ${count} items`} onClick={cartClick}>
          <span>Cart</span>
          {count > 0 && <span className="nav-menu-cart-count">{count}</span>}
        </button>
      </div>
    </nav>
  );
}
