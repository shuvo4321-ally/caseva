"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { type Product } from "../data/products";

// Curated horizontal carousel — reused for New Arrivals, On Sale, related
// items, etc. Native scroll-snap (swipeable on touch), chevrons on desktop.
export default function ProductRow({
  id,
  title,
  viewAllHref,
  products,
}: {
  id: string;
  title: string;
  /** Renders a "View all" link opposite the title, as on the home row. */
  viewAllHref?: string;
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollBy = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;
    // ~one-and-a-bit cards per click
    track.scrollBy({ left: dir * Math.min(track.clientWidth * 0.8, 560), behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!trackRef.current || !trackRef.current.firstElementChild) return;
    const scrollLeft = trackRef.current.scrollLeft;
    const cardWidth = trackRef.current.firstElementChild.clientWidth + 30; // 30px gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(index >= products.length ? products.length - 1 : index);
  };

  const scrollToDot = (index: number) => {
    if (!trackRef.current || !trackRef.current.firstElementChild) return;
    const cardWidth = trackRef.current.firstElementChild.clientWidth + 30;
    trackRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth"
    });
  };

  return (
    <section id={id} className={`product-row product-row-${id}`} aria-label={title}>
      <div className="container product-row-head">
        <h2 className="product-row-title reveal">{title}</h2>
        {viewAllHref && (
          <Link className="product-row-viewall reveal" href={viewAllHref}>
            View all
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        )}
      </div>
      <div className="product-row-track" ref={trackRef} onScroll={handleScroll}>
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} className="product-row-card" />
        ))}
      </div>
      <div className="container product-row-footer" aria-hidden="true">
        <div className="product-row-dots">
          {products.map((_, i) => (
            <button
              key={i}
              className={`row-dot ${i === activeIndex ? "is-active" : ""}`}
              onClick={() => scrollToDot(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="product-row-nav">
          <button type="button" className={`row-arrow ${activeIndex === 0 ? "is-disabled" : ""}`} aria-label={`Scroll ${title} left`} onClick={() => scrollBy(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <button type="button" className={`row-arrow ${activeIndex >= products.length - 1 ? "is-disabled" : ""}`} aria-label={`Scroll ${title} right`} onClick={() => scrollBy(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
