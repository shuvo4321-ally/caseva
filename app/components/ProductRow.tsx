"use client";

import { useRef } from "react";
import ProductCard from "./ProductCard";
import { type Product } from "../data/products";

// Curated horizontal carousel — reused for New Arrivals, On Sale, related
// items, etc. Native scroll-snap (swipeable on touch), chevrons on desktop.
export default function ProductRow({
  id,
  title,
  products,
}: {
  id: string;
  title: string;
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;
    // ~one-and-a-bit cards per click
    track.scrollBy({ left: dir * Math.min(track.clientWidth * 0.8, 560), behavior: "smooth" });
  };

  return (
    <section id={id} className={`product-row product-row-${id}`} aria-label={title}>
      <div className="container product-row-head">
        <h2 className="product-row-title reveal">{title}</h2>
        <div className="product-row-nav" aria-hidden="true">
          <button type="button" className="row-chevron" aria-label={`Scroll ${title} left`} onClick={() => scrollBy(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" className="row-chevron" aria-label={`Scroll ${title} right`} onClick={() => scrollBy(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <div className="product-row-track" ref={trackRef}>
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} className="product-row-card" />
        ))}
      </div>
    </section>
  );
}
