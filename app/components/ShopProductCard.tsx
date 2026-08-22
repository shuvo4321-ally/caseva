"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../cart-context";
import { type Product, DEFAULT_MODEL, formatPrice } from "../data/products";

// Flat catalog card for /shop (distinct from the home carousel card): the
// primary packshot, then product name, device, case-type, price, and an "Add"
// button with a cart icon.
//
// No carousel here on purpose. A grid is for COMPARING products, so every card
// should show the same thing — the primary shot — and let the shopper scan
// across. Per-card dots ask them to browse inside a thumbnail instead, which
// competes with the scan and duplicates what the product page does properly.
export default function ShopProductCard({ product, device }: { product: Product; device: string }) {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const imgs = product.images.length ? product.images : ["/blue-case-hero.png"];

  const onAdd = () => {
    addItem({
      slug: product.slug,
      name: product.name,
      image: imgs[0],
      price: product.salePrice ?? product.price,
      model: DEFAULT_MODEL,
    });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
    openDrawer();
  };

  return (
    <article className="shopcard">
      <Link className="shopcard-media" href={`/product/${product.slug}`} aria-label={product.name}>
        <Image src={imgs[0]} alt={product.alt} width={360} height={540} />
      </Link>

      <div className="shopcard-body">
        <Link className="shopcard-name" href={`/product/${product.slug}`}>{product.name}</Link>
        <p className="shopcard-device">{device}</p>
        <p className="shopcard-type">{product.caseType}</p>
        <p className="shopcard-price">
          {product.salePrice ? (
            <>
              <span className="price-now">{formatPrice(product.salePrice)} USD</span>
              <span className="price-was">{formatPrice(product.price)}</span>
            </>
          ) : (
            <>{formatPrice(product.price)} USD</>
          )}
        </p>
        {/* Icon + label are separate so mobile can drop to an icon-only
            circular button (the wide pill crowds a 2-up phone grid). */}
        <button
          type="button"
          className={`shopcard-add ${added ? "is-added" : ""}`}
          onClick={onAdd}
          aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
        >
          {added ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )}
          <span className="shopcard-add-label">{added ? "Added" : "Add"}</span>
        </button>
      </div>
    </article>
  );
}
