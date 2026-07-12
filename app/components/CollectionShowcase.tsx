"use client";

import Image from "next/image";
import ProductRow from "./ProductRow";
import {
  SHOWCASE_TILES,
  byCollection,
  allProductsSorted,
  filterCount,
  type FilterTag,
} from "../data/products";

// "Shop by collection" tile mosaic that jumps to per-collection product
// carousels below. Each collection is its own labelled swipeable shelf;
// cards link to the product page (with a Quick Add).
const SHELVES: { tag: FilterTag; title: string }[] = [
  { tag: "new-arrivals", title: "New In" },
  { tag: "sale", title: "On Sale" },
  { tag: "bestsellers", title: "Best Sellers" },
  { tag: "all", title: "Shop All" },
];

// Mosaic size: feature (large), half (small), full (wide).
const tileSize = (tag: FilterTag) =>
  tag === "new-arrivals" ? "feature" : tag === "all" ? "full" : "half";

const shelfProducts = (tag: FilterTag) =>
  tag === "all" ? allProductsSorted() : byCollection(tag);

export default function CollectionShowcase() {
  const jump = (tag: FilterTag) =>
    document.getElementById(`all-products`)?.scrollIntoView({ block: "start" });

  return (
    <section className="collection-wrap" id="collection">
      <div className="container">
        <h2 className="collection-title reveal">The Collection</h2>
      </div>

      {/* Tile mosaic — jumps to the matching carousel below */}
      <div className="showcase-bento reveal">
        {SHOWCASE_TILES.map((t) => (
          <button
            key={t.tag}
            type="button"
            className={`showcase-tile showcase-tile--${tileSize(t.tag)} showcase-tile--${t.accent}`}
            onClick={() => jump(t.tag)}
            aria-label={`Jump to ${t.label} — ${filterCount(t.tag)} designs`}
          >
            <div className="showcase-tile-media">
              <Image src={t.image} alt="" width={300} height={450} draggable={false} />
            </div>
            <div className="showcase-tile-body">
              <span className="showcase-tile-label">{t.label}</span>
              <span className="showcase-tile-count">{filterCount(t.tag)} designs</span>
              <span className="showcase-tile-cta">
                Shop
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* A single swipeable product carousel for all products */}
      <ProductRow
        id="all-products"
        title="The CASEVA Standard"
        subtitle="Real life happens. CASEVA has your back, proving protection that rises to meet your life."
        products={allProductsSorted()}
      />
    </section>
  );
}
