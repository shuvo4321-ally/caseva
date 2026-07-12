"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../cart-context";
import { type Product, DEFAULT_MODEL, formatPrice } from "../data/products";

// Shoppable product card: links to the PDP, with a quick Add to Cart that
// adds the default device (shoppers refine the model on the product page).
export default function ProductCard({ product, className = "" }: { product: Product; className?: string }) {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onAdd = () => {
    addItem({
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.salePrice ?? product.price,
      model: DEFAULT_MODEL,
    });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
    openDrawer();
  };

  return (
    <div className={`casetify-style ${className}`}>
      <Link className="collection-card-link" href={`/product/${product.slug}`}>
        <div className="casetify-img-bg">
          {product.isNew && <span className="card-badge">NEW</span>}
          {product.salePrice && <span className="card-badge card-badge-sale">SALE</span>}
          <Image src={product.images[0]} alt={product.alt} width={360} height={540} />
        </div>
        <div className="casetify-card-body">
          <h3 className="casetify-title">{product.name}</h3>
          <span className="casetify-subtitle">
            {product.salePrice ? (
              <>
                <span className="price-now">{formatPrice(product.salePrice)}</span>
                <span className="price-was">{formatPrice(product.price)}</span>
              </>
            ) : (
              formatPrice(product.price)
            )}
          </span>
          <p className="casetify-desc">{product.description}</p>
          <button
            type="button"
            className={`casetify-shop-btn ${added ? "is-added" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              onAdd();
            }}
          >
            {added ? "Added ✓" : "Shop Now"}
          </button>
        </div>
      </Link>
    </div>
  );
}
