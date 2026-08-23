"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductForm from "../ProductForm";
import { listProducts } from "../../store";
import { type Product } from "../../../data/products";

export default function EditProduct() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params.slug));
  const [all, setAll] = useState<Product[] | null>(null);

  useEffect(() => { void listProducts().then(setAll); }, []);

  if (all === null) return <p className="admin-empty">Loading…</p>;

  const product = all.find((p) => p.slug === slug);
  if (!product) {
    return (
      <>
        <h1>Not found</h1>
        <p className="admin-sub">No product with the slug “{slug}”.</p>
        <Link className="admin-btn" href="/admin/products">Back to products</Link>
      </>
    );
  }

  return (
    <>
      <h1>{product.name}</h1>
      <p className="admin-sub">/product/{product.slug}</p>
      {/* `others` excludes this product so its own slug isn't a duplicate of itself. */}
      <ProductForm initial={product} others={all.filter((p) => p.slug !== slug)} />
    </>
  );
}
