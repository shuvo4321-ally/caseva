"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchProducts, formatPrice } from "../data/products";

// Site search: opens from the nav magnifier, matches on name / case type /
// collection / description, and links straight through to product pages.
export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchProducts(q);
  const hasQuery = q.trim().length > 0;

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    // Same body-pinning lock the filter sheet uses — plain overflow:hidden does
    // not stop scrolling on mobile browsers.
    const y = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position, top: body.style.top,
      left: body.style.left, right: body.style.right,
      width: body.style.width, overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, y);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="search-overlay" onMouseDown={onClose}>
      <div
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="search-bar">
          <svg className="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="Search cases, prints, case types…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search products"
          />
          {hasQuery && (
            <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setQ(""); inputRef.current?.focus(); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
          <button type="button" className="search-cancel" onClick={onClose}>Cancel</button>
        </div>

        <div className="search-results">
          {!hasQuery && (
            <p className="search-hint">Try a print name, or a case type like &ldquo;Impact&rdquo;.</p>
          )}

          {hasQuery && results.length === 0 && (
            <p className="search-hint">
              No cases match &ldquo;{q}&rdquo;. <Link href="/shop" onClick={onClose}>Browse all cases</Link>
            </p>
          )}

          {results.length > 0 && (
            <>
              <p className="search-count" aria-live="polite">
                {results.length} {results.length === 1 ? "result" : "results"}
              </p>
              <ul className="search-list">
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link className="search-row" href={`/product/${p.slug}`} onClick={onClose}>
                      <span className="search-thumb">
                        <Image src={p.images[0]} alt="" width={64} height={96} />
                      </span>
                      <span className="search-meta">
                        <span className="search-name">{p.name}</span>
                        <span className="search-type">{p.caseType}</span>
                      </span>
                      <span className="search-price">
                        {p.salePrice ? (
                          <>
                            <span className="price-now">{formatPrice(p.salePrice)}</span>
                            <span className="price-was">{formatPrice(p.price)}</span>
                          </>
                        ) : (
                          formatPrice(p.price)
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
