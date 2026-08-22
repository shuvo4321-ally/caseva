"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../cart-context";
import ProductRow from "./ProductRow";
import ModelSelector from "./ModelSelector";
import {
  type Product,
  PHONE_MODELS,
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
  const [model, setModel] = useState(""); // unselected until the shopper picks brand + model

  const unitPrice = product.salePrice ?? product.price;

  // Remember the shopper's device across pages (same key as the hero selector).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved && PHONE_MODELS.includes(saved)) setModel(saved);
    } catch { /* ignore */ }
  }, []);

  const pickModel = (m: string) => {
    setModel(m);
    try { window.localStorage.setItem(MODEL_STORAGE_KEY, m); } catch { /* ignore */ }
  };

  // The track is the single source of truth for which image is showing:
  // swiping it updates the dots/thumbs, and clicking a thumb scrolls it. That
  // keeps touch and pointer on the same state instead of two rival ones.
  const trackRef = useRef<HTMLDivElement>(null);

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActiveImage((prev) => (prev === i ? prev : i));
  };

  const goToImage = (i: number) => {
    const el = trackRef.current;
    if (!el) return setActiveImage(i);
    const target = i * el.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
    // Smooth scrolling is animated by the compositor and can be dropped
    // outright — backgrounded tabs, some embedded webviews, reduced-motion
    // shims. When that happens scrollTo is a silent no-op, and the thumbnail
    // would light up for an image the track never moved to. Re-assert the
    // position once the animation has had its budget, so the worst case is an
    // instant jump rather than a lie.
    window.setTimeout(() => {
      if (el.scrollLeft !== target) {
        el.scrollLeft = target;
        setActiveImage(i);
      }
    }, 400);
  };

  const line = () => ({
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    price: unitPrice,
    model,
  });

  const onAdd = () => { if (!model) return; addItem(line(), qty); openDrawer(); };
  const onBuyNow = () => { if (!model) return; addItem(line(), qty); router.push("/checkout"); };

  return (
    <main id="main" tabIndex={-1} className="pdp-page">
      <div className="container pdp">
        {/* Gallery — a horizontal snap track, not a stack. Extra photos cost
            horizontal room, so a product with six images lands on screen at
            exactly the same height as one with a single image, and the title
            and price stay where the shopper expects them. */}
        <div className="pdp-gallery">
          <div
            className="pdp-track"
            ref={trackRef}
            onScroll={onTrackScroll}
            role="group"
            aria-label={`${product.name} images`}
          >
            {product.images.map((img, i) => (
              // A packshot and a lifestyle photo want opposite treatment: the
              // cut-out needs room and a shadow to sit on the ground, the photo
              // needs to fill the frame edge to edge. Keyed off the extension
              // so dropping real photography in just works.
              <div className={`pdp-slide ${/\.(jpe?g|webp)$/i.test(img) ? "pdp-slide--photo" : ""}`} key={img}>
                <Image
                  src={img}
                  alt={i === 0 ? product.alt : `${product.name}, view ${i + 1}`}
                  width={600}
                  height={900}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {product.images.length > 1 && (
            <>
              {/* Dots: on a phone the track is swiped, so this is the only
                  affordance telling you more photos exist. */}
              <div className="pdp-dots" aria-hidden="true">
                {product.images.map((img, i) => (
                  <span key={img} className={`pdp-dot ${i === activeImage ? "is-active" : ""}`} />
                ))}
              </div>

              <div className="pdp-thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    className={`pdp-thumb ${i === activeImage ? "is-active" : ""} ${
                      /\.(jpe?g|webp)$/i.test(img) ? "pdp-thumb--photo" : ""
                    }`}
                    aria-label={`View image ${i + 1}`}
                    aria-current={i === activeImage}
                    onClick={() => goToImage(i)}
                  >
                    <Image src={img} alt="" width={90} height={135} />
                  </button>
                ))}
              </div>
            </>
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

          {/* Model selector — brand → model drill-down (shared with the hero) */}
          <ModelSelector value={model} onChange={pickModel} prefix="For" className="pdp-model" />

          {!model && (
            <p className="pdp-model-hint">Choose your phone above to add this case to your cart.</p>
          )}

          {/* Quantity + actions */}
          <div className="pdp-actions">
            <div className="pdp-qty" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button type="button" className="cta pdp-add" onClick={onAdd} disabled={!model}>Add to Cart</button>
          </div>
          <button type="button" className="pdp-buy" onClick={onBuyNow} disabled={!model}>Buy Now</button>

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
