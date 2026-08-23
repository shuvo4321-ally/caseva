"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listProducts, deleteProduct } from "../store";
import { validateProduct } from "../validate";
import { formatPrice, type Product } from "../../data/products";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => { void listProducts().then(setProducts); }, []);

  if (!products) return <p className="admin-empty">Loading…</p>;

  const needle = q.trim().toLowerCase();
  const shown = needle
    ? products.filter((p) =>
        `${p.name} ${p.slug} ${p.caseType} ${p.collections.join(" ")}`.toLowerCase().includes(needle)
      )
    : products;

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    await deleteProduct(p.slug);
    setProducts(await listProducts());
  };

  return (
    <>
      <h1>Products</h1>
      <p className="admin-sub">{products.length} in the catalog.</p>

      <div className="admin-actions" style={{ marginBottom: 16 }}>
        <Link className="admin-btn admin-btn--primary" href="/admin/products/new">+ Add product</Link>
      </div>

      <div className="admin-field">
        <label htmlFor="pfilter">Filter</label>
        <input id="pfilter" type="text" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Name, slug, case type or collection" />
      </div>

      {shown.length === 0 ? (
        <p className="admin-empty">
          {needle ? `Nothing matches “${q}”.` : "No products yet."}
        </p>
      ) : (
        <div className="admin-list">
          {shown.map((p) => {
            const issues = validateProduct(p, products.filter((o) => o.slug !== p.slug));
            const errs = issues.filter((i) => i.level === "error").length;
            return (
              <article className="admin-item" key={p.slug}>
                {/* Plain <img>: these are arbitrary user-entered paths that may
                    not resolve, and next/image throws on a bad src. */}
                <img className="admin-thumb" src={p.images[0]} alt="" loading="lazy" />
                <div>
                  <div className="admin-item-name">{p.name}</div>
                  <div className="admin-item-meta">
                    /{p.slug} · {p.caseType} ·{" "}
                    {p.salePrice ? (
                      <>
                        <b>{formatPrice(p.salePrice)}</b>{" "}
                        <s>{formatPrice(p.price)}</s>
                      </>
                    ) : (
                      formatPrice(p.price)
                    )}
                    {" · "}
                    {p.images.length} image{p.images.length === 1 ? "" : "s"}
                    {" · "}
                    {p.fitsModels ? `${p.fitsModels.length} models` : "fits all"}
                  </div>
                  <div className="admin-item-meta" style={{ marginTop: 4 }}>
                    {p.isNew && <span className="admin-tag admin-tag--new">NEW</span>}
                    {p.salePrice && <span className="admin-tag admin-tag--sale">SALE</span>}
                    {p.featured && <span className="admin-tag">Featured</span>}
                    {errs > 0 && (
                      <span className="admin-tag" style={{ background: "#fdeceb", color: "#b3261e" }}>
                        {errs} error{errs === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <div className="admin-item-actions">
                    <Link className="admin-btn admin-btn--sm" href={`/admin/products/${p.slug}`}>Edit</Link>
                    <a className="admin-btn admin-btn--sm" href={`/product/${p.slug}`} target="_blank" rel="noreferrer">View</a>
                    <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => remove(p)}>Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
