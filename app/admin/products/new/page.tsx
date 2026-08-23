"use client";

import { useEffect, useState } from "react";
import ProductForm from "../ProductForm";
import { listProducts } from "../../store";
import { type Product } from "../../../data/products";

export default function NewProduct() {
  const [others, setOthers] = useState<Product[] | null>(null);
  useEffect(() => { void listProducts().then(setOthers); }, []);

  return (
    <>
      <h1>Add product</h1>
      <p className="admin-sub">A new case in the catalog.</p>
      {/* Wait for the list: the slug uniqueness check is meaningless without it. */}
      {others === null ? <p className="admin-empty">Loading…</p> : <ProductForm others={others} />}
    </>
  );
}
