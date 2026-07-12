"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../cart-context";
import ProductRow from "./ProductRow";
import {
  type Product,
  PHONE_MODELS,
  DEFAULT_MODEL,
  MODEL_STORAGE_KEY,
  formatPrice,
} from "../data/products";

export default function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  const unitPrice = product.salePrice ?? product.price;

  // Remember the shopper's device across pages (same key as the hero selector).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved && PHONE_MODELS.includes(saved)) setModel(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!modelOpen) return;
    const onDown = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setModelOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModelOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [modelOpen]);

  const pickModel = (m: string) => {
    setModel(m);
    setModelOpen(false);
    try { window.localStorage.setItem(MODEL_STORAGE_KEY, m); } catch { /* ignore */ }
  };

  const line = () => ({
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    price: unitPrice,
    model,
  });

  const onAdd = () => { addItem(line(), qty); openDrawer(); };
  const onBuyNow = () => { addItem(line(), qty); router.push("/checkout"); };

  return (
    <main id="main" tabIndex={-1} className="pdp-page">
      <div className="container pdp">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-main-img">
            <Image src={product.images[activeImage]} alt={product.alt} width={600} height={900} priority />
          </div>
          {product.images.length > 1 && (
            <div className="pdp-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  className={`pdp-thumb ${i === activeImage ? "is-active" : ""}`}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt="" width={90} height={135} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pdp-info">
          <div className="pdp-badges">
            {product.isNew && <span className="card-badge pdp-badge">NEW</span>}
            {product.salePrice && <span className="card-badge card-badge-sale pdp-badge">SALE</span>}
          </div>
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-price">
            {product.salePrice ? (
              <>
                <span className="price-was">{formatPrice(product.price)}</span>
                <span className="price-now">{formatPrice(product.salePrice)}</span>
              </>
            ) : (
              formatPrice(product.price)
            )}
          </div>
          <p className="pdp-desc">{product.description}</p>

          {/* Model selector — same styled listbox as the hero */}
          <div className="model-selector pdp-model" ref={modelRef}>
            <button
              type="button"
              className="model-trigger"
              aria-haspopup="listbox"
              aria-expanded={modelOpen}
              aria-label={`For ${model}. Click to change phone model.`}
              onClick={() => setModelOpen((v) => !v)}
            >
              <svg className="model-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="6" y="2" width="12" height="20" rx="2" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              <span className="model-label">
                <span className="model-prefix">For</span>
                <span className="model-value">{model}</span>
              </span>
              <svg className={`model-chevron ${modelOpen ? "is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {modelOpen && (
              <ul className="model-menu" role="listbox" aria-label="iPhone models">
                {PHONE_MODELS.map((m) => (
                  <li key={m} role="option" aria-selected={m === model}>
                    <button type="button" className={`model-option ${m === model ? "is-selected" : ""}`} onClick={() => pickModel(m)}>
                      {m}
                      {m === model && (
                        <svg className="model-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="pdp-actions">
            <div className="pdp-qty" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button type="button" className="cta pdp-add" onClick={onAdd}>Add to Cart</button>
          </div>
          <button type="button" className="pdp-buy" onClick={onBuyNow}>Buy Now</button>

          <ul className="pdp-perks">
            <li>Impact-tested drop protection</li>
            <li>MagSafe-ready · 100% recycled shell</li>
            <li>Free shipping on orders $30+</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <ProductRow id="related" title="You may also like" products={related} />
      )}
    </main>
  );
}
