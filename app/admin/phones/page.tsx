"use client";

import { useEffect, useState } from "react";
import { listPhoneBrands, savePhoneBrands, listProducts } from "../store";
import { type PhoneBrand, type Product } from "../../data/products";

export default function AdminPhones() {
  const [brands, setBrands] = useState<PhoneBrand[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void listPhoneBrands().then(setBrands);
    void listProducts().then(setProducts);
  }, []);

  if (!brands) return <p className="admin-empty">Loading…</p>;

  const touch = (next: PhoneBrand[]) => { setBrands(next); setSaved(false); };

  // Renaming or deleting a model orphans any product still listing it, which
  // would quietly drop that product out of the model filter. Surface it.
  const usage = (model: string) =>
    products.filter((p) => p.fitsModels?.includes(model)).length;

  const setBrandName = (i: number, brand: string) =>
    touch(brands.map((b, n) => (n === i ? { ...b, brand } : b)));

  const setModel = (bi: number, mi: number, v: string) =>
    touch(brands.map((b, n) => (n === bi ? { ...b, models: b.models.map((m, k) => (k === mi ? v : m)) } : b)));

  const addModel = (bi: number) =>
    touch(brands.map((b, n) => (n === bi ? { ...b, models: [...b.models, ""] } : b)));

  const removeModel = (bi: number, mi: number) =>
    touch(brands.map((b, n) => (n === bi ? { ...b, models: b.models.filter((_, k) => k !== mi) } : b)));

  const addBrand = () => touch([...brands, { brand: "New brand", models: [""] }]);
  const removeBrand = (i: number) => touch(brands.filter((_, n) => n !== i));

  const save = async () => { await savePhoneBrands(brands); setSaved(true); };

  return (
    <>
      <h1>Phones</h1>
      <p className="admin-sub">The brands and models behind the model selector and shop filters.</p>

      <div className="admin-note admin-note--warn">
        Renaming or removing a model does <b>not</b> update products that list it. Any
        product still pointing at the old name silently drops out of that filter — the
        “used by” count next to each model shows what is at risk.
      </div>

      {brands.map((b, bi) => (
        <div className="admin-panel" key={bi}>
          <div className="admin-field">
            <label htmlFor={`brand${bi}`}>Brand name</label>
            <input id={`brand${bi}`} type="text" value={b.brand}
              onChange={(e) => setBrandName(bi, e.target.value)} />
          </div>

          <span className="admin-legend">Models</span>
          {b.models.map((m, mi) => {
            const used = usage(m);
            return (
              <div className="admin-img-row" key={mi} style={{ gridTemplateColumns: "1fr auto auto" }}>
                <input type="text" value={m} aria-label={`${b.brand} model ${mi + 1}`}
                  onChange={(e) => setModel(bi, mi, e.target.value)} />
                <span className="admin-tag" title="Products listing this model">
                  {used} product{used === 1 ? "" : "s"}
                </span>
                <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => removeModel(bi, mi)} aria-label={`Remove ${m || "model"}`}>✕</button>
              </div>
            );
          })}

          <div className="admin-actions" style={{ marginTop: 10 }}>
            <button type="button" className="admin-btn admin-btn--sm" onClick={() => addModel(bi)}>
              + Add model
            </button>
            <button type="button" className="admin-btn admin-btn--sm admin-btn--danger"
              onClick={() => removeBrand(bi)} disabled={brands.length === 1}>
              Delete brand
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="admin-btn" onClick={addBrand}>+ Add brand</button>

      <div className="admin-save">
        <button type="button" className="admin-btn admin-btn--primary" onClick={save}>Save</button>
        {saved && <span style={{ alignSelf: "center", fontSize: 13, color: "var(--ad-dim)" }}>Saved.</span>}
      </div>
    </>
  );
}
