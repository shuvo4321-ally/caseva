"use client";

import { useEffect, useRef, useState } from "react";
import ShopProductCard from "./ShopProductCard";
import {
  productsByFilter,
  filterCount,
  MODEL_STORAGE_KEY,
  type FilterTag,
  type Product,
} from "../data/products";

const FILTERS: { tag: FilterTag; label: string }[] = [
  { tag: "all", label: "All" },
  { tag: "new-arrivals", label: "New In" },
  { tag: "sale", label: "On Sale" },
  { tag: "bestsellers", label: "Best Sellers" },
];

type SortId = "featured" | "price-asc" | "price-desc";
const SORTS: { id: SortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

export default function ShopCatalog({ initialFilter = "all" }: { initialFilter?: FilterTag }) {
  const start = FILTERS.some((f) => f.tag === initialFilter) ? initialFilter : "all";
  const [filter, setFilter] = useState<FilterTag>(start);
  const [sort, setSort] = useState<SortId>("featured");
  const [open, setOpen] = useState<"filter" | "sort" | null>(null);
  const [device, setDevice] = useState("iPhone 16 Pro Max");
  const barRef = useRef<HTMLDivElement>(null);

  // Show the shopper's saved device on each card (like Casetify's device line).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved) setDevice(saved);
    } catch { /* ignore */ }
  }, []);

  // Close the open dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const priceOf = (p: Product) => p.salePrice ?? p.price;
  let items = productsByFilter(filter);
  if (sort === "price-asc") items = [...items].sort((a, b) => priceOf(a) - priceOf(b));
  else if (sort === "price-desc") items = [...items].sort((a, b) => priceOf(b) - priceOf(a));

  const filterLabel = FILTERS.find((f) => f.tag === filter)?.label ?? "All";
  const sortLabel = SORTS.find((s) => s.id === sort)?.label ?? "Featured";

  return (
    <main className="shop-page" id="main" tabIndex={-1}>
      <div className="container">
        {/* Filter + Sort container */}
        <div ref={barRef}>
          {/* Title banner */}
          <div className="shop-banner">
            <div className="shop-banner-head">
              <h1 className="shop-title">All Cases</h1>
            </div>
            
            <div className="shop-banner-actions">
              {/* Filter Dropdown */}
              <div className={`shop-dd ${open === "filter" ? "is-open" : ""}`}>
                <button type="button" className="shop-dd-btn banner-btn" aria-expanded={open === "filter"} onClick={() => setOpen(open === "filter" ? null : "filter")}>
                  <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6" />
                  </svg>
                  <span>Filter</span>
                </button>
                {open === "filter" && (
                  <div className="shop-dd-menu" role="listbox" aria-label="Filter by collection">
                    {FILTERS.map((f) => (
                      <button key={f.tag} type="button" role="option" aria-selected={filter === f.tag}
                        className={`shop-dd-item ${filter === f.tag ? "is-active" : ""}`}
                        onClick={() => { setFilter(f.tag); setOpen(null); }}>
                        <span>{f.label}</span>
                        <span className="shop-dd-count">{filterCount(f.tag)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sort By toolbar */}
          <div className="shop-bar">
            <div className={`shop-dd ${open === "sort" ? "is-open" : ""}`}>
              <button type="button" className="sort-btn" aria-expanded={open === "sort"} onClick={() => setOpen(open === "sort" ? null : "sort")}>
                <span>Sort By</span>
                <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 6h16M4 12h10M4 18h4" />
                </svg>
              </button>
              {open === "sort" && (
                <div className="shop-dd-menu" role="listbox" aria-label="Sort by">
                  {SORTS.map((s) => (
                    <button key={s.id} type="button" role="option" aria-selected={sort === s.id}
                      className={`shop-dd-item ${sort === s.id ? "is-active" : ""}`}
                      onClick={() => { setSort(s.id); setOpen(null); }}>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {items.length ? (
          <div className="shop-grid">
            {items.map((p) => (
              <ShopProductCard key={p.slug} product={p} device={device} />
            ))}
          </div>
        ) : (
          <p className="shop-empty">Nothing in this collection yet — check back soon.</p>
        )}
      </div>
    </main>
  );
}
