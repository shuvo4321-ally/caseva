"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
