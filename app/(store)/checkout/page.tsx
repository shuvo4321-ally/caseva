"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "../../cart-context";
import { formatPrice } from "../../data/products";

const SHIPPING_FLAT = 60; // ৳/$ flat rate placeholder until real rates wire in

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.name.trim() && /\d{6,}/.test(form.phone) && form.address.trim() && form.city.trim();
  const shipping = items.length ? SHIPPING_FLAT : 0;
  const total = subtotal + shipping;

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || items.length === 0) return;
    // Phase 3 will hand off to bKash here (create payment → redirect → execute).
    setPlaced(true);
    clear();
  };

  if (placed) {
    return (
      <main id="main" tabIndex={-1} className="checkout-page">
        <div className="container checkout-confirm">
          <div className="confirm-check" aria-hidden="true">✓</div>
          <h1 className="checkout-title">Order placed!</h1>
          <p>Thanks, {form.name.split(" ")[0] || "friend"} — we&rsquo;ve got your order and will text you on {form.phone} with delivery details.</p>
          <Link className="cta" href="/shop">Continue shopping</Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main id="main" tabIndex={-1} className="checkout-page">
        <div className="container checkout-empty">
          <h1 className="checkout-title">Your cart is empty</h1>
          <Link className="cta" href="/shop">Shop the Collection</Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main" tabIndex={-1} className="checkout-page">
      <div className="container checkout-grid">
        <form className="checkout-form" onSubmit={placeOrder}>
          <h1 className="checkout-title">Checkout</h1>

          <section className="checkout-block">
            <h2>Shipping details</h2>
            <label className="field">
              <span>Full name</span>
              <input value={form.name} onChange={set("name")} autoComplete="name" required />
            </label>
            <label className="field">
              <span>Mobile number</span>
              <input value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
            </label>
            <label className="field">
              <span>Full address</span>
              <input value={form.address} onChange={set("address")} autoComplete="street-address" required />
            </label>
            <label className="field">
              <span>City / District</span>
              <input value={form.city} onChange={set("city")} autoComplete="address-level2" required />
            </label>
          </section>

          <section className="checkout-block">
            <h2>Payment</h2>
            <label className="pay-method is-selected">
              <input type="radio" name="pay" defaultChecked readOnly />
              <span className="pay-method-label">bKash</span>
              <span className="pay-method-note">You&rsquo;ll confirm payment on bKash</span>
            </label>
          </section>

          <button type="submit" className="cta checkout-place" disabled={!valid}>
            Place Order · Pay with bKash
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <div className="summary-lines">
            {items.map((it) => (
              <div className="summary-line" key={`${it.slug}-${it.model}`}>
                <div className="summary-img">
                  <Image src={it.image} alt={it.name} width={56} height={84} />
                  <span className="summary-qty">{it.qty}</span>
                </div>
                <div className="summary-info">
                  <span className="summary-name">{it.name}</span>
                  <span className="summary-model">{it.model}</span>
                </div>
                <span className="summary-price">{formatPrice(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{formatPrice(shipping)}</span></div>
          <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>
    </main>
  );
}
