"use client";

import { useEffect, useRef, useState } from "react";
import ShopProductCard from "./ShopProductCard";
import {
  filterProducts,
  priceOf,
  PRICE_MIN,
  PRICE_MAX,
  formatPrice,
  CASE_TYPES,
  PHONE_BRANDS,
  MODEL_STORAGE_KEY,
  type FilterTag,
  type Product,
  type ShopFilters,
} from "../data/products";

const COLLECTIONS: { tag: FilterTag; label: string }[] = [
  { tag: "all", label: "All" },
  { tag: "new-arrivals", label: "New In" },
  { tag: "sale", label: "On Sale" },
  { tag: "bestsellers", label: "Best Sellers" },
];

// "" = catalog order (nothing selected). Tapping an active pill clears it.
type SortId = "" | "price-asc" | "price-desc";
const SORTS: { id: Exclude<SortId, "">; label: string }[] = [
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

const DEFAULT_DEVICE = "iPhone 16 Pro Max";
// keep in sync with .fs-sheet / .fs-foot background in globals.css
const SHEET_BG = "#f4f2ec";

export default function ShopCatalog({ initialFilter = "all" }: { initialFilter?: FilterTag }) {
  const startCollection = COLLECTIONS.some((c) => c.tag === initialFilter) ? initialFilter : "all";

  const [brand, setBrand] = useState<string>("all");
  const [model, setModel] = useState<string>("all");
  const [caseType, setCaseType] = useState<string>("all");
  const [collection, setCollection] = useState<FilterTag>(startCollection);
  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [sort, setSort] = useState<SortId>("");

  // Which panel is up: the full Filter & Sort sheet, or a sort-only sheet.
  const [mode, setMode] = useState<null | "filter" | "sort">(null);
  // Sort starts collapsed — the sheet is opened for filtering most of the
  // time. Tapping the Sort By control opens the sheet with it expanded.
  const [sortOpen, setSortOpen] = useState(false);
  const [device, setDevice] = useState(DEFAULT_DEVICE);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Device shown on cards / used by quick-add. Shared with the hero and PDP
  // selectors through MODEL_STORAGE_KEY.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved) setDevice(saved);
    } catch { /* ignore */ }
  }, []);

  // While the sheet is up: lock page scroll, close on Escape, focus the panel.
  // `overflow: hidden` alone does NOT stop scrolling on mobile browsers — the
  // page kept moving behind the sheet, and that shifting viewport is what let
  // the page background show under it. Pinning the body with position: fixed
  // genuinely freezes it; we stash the scroll offset and restore it on close.
  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMode(null); };
    const y = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    // Chrome Android paints the strip under its gesture bar from the page
    // CANVAS, which sits outside the layout viewport the sheet is sized to —
    // so the cream page colour showed there however the sheet was measured.
    // <html> is normally transparent here (body drives the canvas, see
    // globals.css); tinting it to the sheet colour for the duration makes that
    // strip match the sheet instead of the page.
    const root = document.documentElement;
    const prevRootBg = root.style.backgroundColor;
    root.style.backgroundColor = SHEET_BG;

    document.addEventListener("keydown", onKey);
    sheetRef.current?.focus({ preventScroll: true });

    return () => {
      root.style.backgroundColor = prevRootBg;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, y); // put them back exactly where they were
      document.removeEventListener("keydown", onKey);
    };
  }, [mode]);

  const filters: ShopFilters = { brand, model, caseType, collection, minPrice, maxPrice };

  let items = filterProducts(filters);
  if (sort === "price-asc") items = [...items].sort((a, b) => priceOf(a) - priceOf(b));
  else if (sort === "price-desc") items = [...items].sort((a, b) => priceOf(b) - priceOf(a));

  // Picking a brand clears a model that no longer belongs to it.
  const pickBrand = (b: string) => {
    setBrand(b);
    if (b !== "all" && model !== "all") {
      const inBrand = PHONE_BRANDS.find((x) => x.brand === b)?.models.includes(model);
      if (!inBrand) setModel("all");
    }
  };

  // Choosing a model also sets the phone you're shopping for.
  const pickModel = (m: string) => {
    setModel(m);
    if (m !== "all") {
      setDevice(m);
      try { window.localStorage.setItem(MODEL_STORAGE_KEY, m); } catch { /* ignore */ }
    }
  };

  // Reset only clears what the open panel is responsible for — wiping the
  // filters from the sort-only sheet would be a nasty surprise.
  const reset = () => {
    if (mode === "sort") { setSort(""); return; }
    setBrand("all"); setModel("all"); setCaseType("all");
    setCollection("all"); setSort("");
    setMinPrice(PRICE_MIN); setMaxPrice(PRICE_MAX);
  };

  const openForFilter = () => { setSortOpen(false); setMode("filter"); };
  const openForSort = () => setMode("sort");
  const closeSheet = () => setMode(null);

  const modelsForBrand = PHONE_BRANDS.find((b) => b.brand === brand)?.models ?? [];
  const activeBits = [
    brand !== "all" ? brand : null,
    model !== "all" ? model : null,
    caseType !== "all" ? caseType : null,
    collection !== "all" ? COLLECTIONS.find((c) => c.tag === collection)?.label : null,
    (minPrice > PRICE_MIN || maxPrice < PRICE_MAX)
      ? `${formatPrice(minPrice)}–${formatPrice(maxPrice)}` : null,
    sort ? SORTS.find((s) => s.id === sort)?.label : null,
  ].filter(Boolean);

  return (
    <main className="shop-page" id="main" tabIndex={-1}>
      <div className="container">
        <div className="shop-banner">
          <div className="shop-banner-head">
            <h1 className="shop-title">All Cases</h1>
          </div>
          <div className="shop-banner-actions">
            <button
              type="button"
              className="shop-dd-btn banner-btn"
              aria-haspopup="dialog"
              aria-expanded={mode !== null}
              onClick={openForFilter}
            >
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6" />
              </svg>
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="shop-bar">
          <button
            type="button"
            className="sort-btn"
            aria-haspopup="dialog"
            aria-expanded={mode !== null}
            onClick={openForSort}
          >
            <span>Sort By</span>
            <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 6h16M4 12h10M4 18h4" />
            </svg>
          </button>
          {activeBits.length > 0 && (
            <span className="shop-active-summary">{activeBits.join(" · ")}</span>
          )}
        </div>

        {items.length ? (
          <div className="shop-grid">
            {items.map((p) => (
              <ShopProductCard key={p.slug} product={p} device={device} />
            ))}
          </div>
        ) : (
          <p className="shop-empty">No cases match these filters — try clearing a few.</p>
        )}
      </div>

      {mode !== null && (
        <div className="fs-overlay" onMouseDown={closeSheet}>
          <div
            className="fs-sheet"
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Filter and sort"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="fs-grabber" aria-hidden="true" />

            <div className="fs-head">
              <h2 className="fs-title">{mode === "sort" ? "Sort By" : "Filter & Sort"}</h2>
              <button type="button" className="fs-close" onClick={closeSheet}>Close</button>
            </div>

            <div className="fs-body">
              <section className="fs-section">
                {mode === "filter" && (
                  <button
                    type="button"
                    className="fs-collapse"
                    aria-expanded={sortOpen}
                    onClick={() => setSortOpen((v) => !v)}
                  >
                    <span className="fs-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M4 6h16M4 12h10M4 18h4" />
                      </svg>
                      Sort By
                    </span>
                    <svg className={`fs-chev ${sortOpen ? "is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                )}
                {(mode === "sort" || sortOpen) && (
                  <div className="fs-pills" role="group" aria-label="Sort by">
                    {SORTS.map((s) => (
                      <button key={s.id} type="button" aria-pressed={sort === s.id}
                        className={`fs-pill ${sort === s.id ? "is-active" : ""}`}
                        onClick={() => setSort((cur) => (cur === s.id ? "" : s.id))}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {mode === "filter" && (
                <>
                <section className="fs-section">
                  <h3 className="fs-label">Phone</h3>
                  <div className="fs-pills" role="group" aria-label="Filter by phone brand">
                    <button type="button" aria-pressed={brand === "all"}
                      className={`fs-pill ${brand === "all" ? "is-active" : ""}`}
                      onClick={() => pickBrand("all")}>
                      All
                    </button>
                    {PHONE_BRANDS.map((b) => (
                      <button key={b.brand} type="button" aria-pressed={brand === b.brand}
                        className={`fs-pill ${brand === b.brand ? "is-active" : ""}`}
                        onClick={() => pickBrand(b.brand)}>
                        {b.brand}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Models only once a brand is chosen — otherwise this is 22 pills */}
                {brand !== "all" && (
                  <section className="fs-section">
                    <h3 className="fs-label">{brand} model</h3>
                    <div className="fs-pills fs-pills--scroll" role="group" aria-label="Filter by phone model">
                      <button type="button" aria-pressed={model === "all"}
                        className={`fs-pill ${model === "all" ? "is-active" : ""}`}
                        onClick={() => pickModel("all")}>
                        All {brand}
                      </button>
                      {modelsForBrand.map((m) => (
                        <button key={m} type="button" aria-pressed={model === m}
                          className={`fs-pill ${model === m ? "is-active" : ""}`}
                          onClick={() => pickModel(m)}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <p className="fs-note">Also sets the phone you&rsquo;re shopping for.</p>
                  </section>
                )}

                <section className="fs-section">
                  <h3 className="fs-label">Price</h3>
                  <div className="fs-range">
                    <output className="fs-range-value">
                      {formatPrice(minPrice)} &ndash; {formatPrice(maxPrice)}
                    </output>
                    <div className="fs-range-track">
                      {/* highlight between the two thumbs */}
                      <span
                        className="fs-range-fill"
                        style={{
                          left: `${((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                          right: `${100 - ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        className="fs-range-input"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        value={minPrice}
                        aria-label="Minimum price"
                        onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                      />
                      <input
                        type="range"
                        className="fs-range-input"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        value={maxPrice}
                        aria-label="Maximum price"
                        onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                      />
                    </div>
                    <div className="fs-range-ends">
                      <span>{formatPrice(PRICE_MIN)}</span>
                      <span>{formatPrice(PRICE_MAX)}</span>
                    </div>
                  </div>
                </section>

                <section className="fs-section">
                  <h3 className="fs-label">Case type</h3>
                  <div className="fs-pills" role="group" aria-label="Filter by case type">
                    <button type="button" aria-pressed={caseType === "all"}
                      className={`fs-pill ${caseType === "all" ? "is-active" : ""}`}
                      onClick={() => setCaseType("all")}>
                      All
                    </button>
                    {CASE_TYPES.map((ct) => (
                      <button key={ct} type="button" aria-pressed={caseType === ct}
                        className={`fs-pill ${caseType === ct ? "is-active" : ""}`}
                        onClick={() => setCaseType(ct)}>
                        {ct}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="fs-section">
                  <h3 className="fs-label">Collection</h3>
                  <div className="fs-pills" role="group" aria-label="Filter by collection">
                    {COLLECTIONS.map((c) => (
                      <button key={c.tag} type="button" aria-pressed={collection === c.tag}
                        className={`fs-pill ${collection === c.tag ? "is-active" : ""}`}
                        onClick={() => setCollection(c.tag)}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </section>
                </>
              )}
            </div>

            <div className="fs-foot">
              <button type="button" className="fs-reset" onClick={reset}>Reset</button>
              <button type="button" className="fs-apply" onClick={closeSheet}>
                Show {items.length} {items.length === 1 ? "design" : "designs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
