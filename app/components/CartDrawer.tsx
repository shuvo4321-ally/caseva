"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "../cart-context";
import { formatPrice } from "../data/products";

export default function CartDrawer() {
  const { items, subtotal, count, setQty, removeItem, drawerOpen, closeDrawer } = useCart();

  // Close on Escape while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <div
        className={`cart-overlay ${drawerOpen ? "is-open" : ""}`}
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`cart-drawer ${drawerOpen ? "is-open" : ""}`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal={drawerOpen}
      >
        <div className="cart-drawer-head">
          <h2 className="cart-drawer-title">Your Cart{count > 0 ? ` (${count})` : ""}</h2>
          <button type="button" className="icon-btn" aria-label="Close cart" onClick={closeDrawer}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link className="cta" href="/#collection" onClick={closeDrawer}>Shop the Collection</Link>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {items.map((it) => (
                <div className="cart-line" key={`${it.slug}-${it.model}`}>
                  <div className="cart-line-img">
                    <Image src={it.image} alt={it.name} width={80} height={120} />
                  </div>
                  <div className="cart-line-info">
                    <span className="cart-line-name">{it.name}</span>
                    <span className="cart-line-model">{it.model}</span>
                    <span className="cart-line-price">{formatPrice(it.price)}</span>
                    <div className="cart-qty">
                      <button type="button" aria-label={`Decrease ${it.name} quantity`} onClick={() => setQty(it.slug, it.model, it.qty - 1)}>−</button>
                      <span aria-live="polite">{it.qty}</span>
                      <button type="button" aria-label={`Increase ${it.name} quantity`} onClick={() => setQty(it.slug, it.model, it.qty + 1)}>+</button>
                    </div>
                  </div>
                  <button type="button" className="cart-line-remove" aria-label={`Remove ${it.name}`} onClick={() => removeItem(it.slug, it.model)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="cart-note">Shipping &amp; taxes calculated at checkout.</p>
              <Link className="cta cart-checkout" href="/checkout" onClick={closeDrawer}>
                Checkout
              </Link>
              <button type="button" className="cart-continue" onClick={closeDrawer}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
